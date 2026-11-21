"""题库校验脚本。

用法：
    python scripts/validate.py                       # 校验全部题目
    python scripts/validate.py questions/LLM/ATTN.yaml questions/LLM/POS.yaml
    python scripts/validate.py --no-run              # 不运行代码题（更快）
    python scripts/validate.py --stats               # 额外输出考点覆盖与题型配比
退出码：存在 ERROR 时为 1。
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import importlib.util
import os
import re
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
QDIR = ROOT / "questions"

TYPES = {
    "single": "单选", "multiple": "多选", "judge": "判断", "fill": "填空", "short": "简答",
    "calc": "计算", "code_output": "代码输出", "code_debug": "代码改错", "code_fill": "代码填空",
    "coding": "编程", "scenario": "场景分析", "design": "系统设计",
}
SUBJECTIVE = {"short", "scenario", "design"}
CODE_TYPES = {"code_output", "code_debug", "code_fill", "coding"}
BLANK = "____"
ID_RE = re.compile(r"^([A-Z]+)-([A-Z]+)-(\d{3})$")
RUBRIC_PTS = re.compile(r"[（(]\s*(\d+(?:\.\d+)?)\s*分\s*[）)]")


class Report:
    def __init__(self):
        self.items = defaultdict(list)   # file -> [(level, qid, msg)]
        self.n_err = 0
        self.n_warn = 0

    def err(self, f, qid, msg):
        self.items[f].append(("ERROR", qid, msg)); self.n_err += 1

    def warn(self, f, qid, msg):
        self.items[f].append(("WARN", qid, msg)); self.n_warn += 1


class UniqueKeyLoader(yaml.SafeLoader):
    """与 SafeLoader 相同，但遇到同一映射中的重复键时报错（PyYAML 默认会静默保留后一个值）。"""

    def construct_mapping(self, node, deep=False):
        seen = set()
        for key_node, _ in node.value:
            key = self.construct_object(key_node, deep=deep)
            if key in seen:
                raise yaml.constructor.ConstructorError(None, None, f"重复的键 {key!r}", key_node.start_mark)
            seen.add(key)
        return super().construct_mapping(node, deep)


def load_taxonomy():
    t = yaml.safe_load((ROOT / "taxonomy.yaml").read_text(encoding="utf-8"))
    tax = {}
    for d in t["domains"]:
        for s in d["subcategories"]:
            tax[(d["code"], s["code"])] = {"domain": d, "sub": s, "points": list(s.get("points", []))}
    return tax


def text(v):
    return v if isinstance(v, str) else ""


def norm_out(s: str) -> str:
    return "\n".join(line.rstrip() for line in s.replace("\r\n", "\n").strip("\n").split("\n"))


def missing_deps(code: str):
    miss = []
    for mod in ("torch", "numpy"):
        if re.search(rf"^\s*(import|from)\s+{mod}\b", code, re.M) and importlib.util.find_spec(mod) is None:
            miss.append(mod)
    return miss


def run_py(code: str, timeout=30):
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "q.py"
        p.write_text(code, encoding="utf-8")
        env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1", "PYTHONHASHSEED": "0"}
        try:
            r = subprocess.run([sys.executable, str(p)], cwd=td, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=timeout, env=env)
            return r.returncode, r.stdout, r.stderr
        except subprocess.TimeoutExpired:
            return -1, "", f"TIMEOUT >{timeout}s"


def check_question(q, f, rep: Report, tax, dom, sub, seen_ids, jobs):
    qid = q.get("id", "?")
    if not isinstance(q, dict):
        rep.err(f, "?", "题目必须是映射（dict）"); return
    m = ID_RE.match(str(qid))
    if not m:
        rep.err(f, qid, f"ID 格式错误：{qid}（应为 大类-小类-三位序号）")
    elif (m.group(1), m.group(2)) != (dom, sub):
        rep.err(f, qid, f"ID 前缀与文件不符（文件为 {dom}-{sub}）")
    if qid in seen_ids:
        rep.err(f, qid, f"ID 重复（另见 {seen_ids[qid]}）")
    seen_ids[qid] = f

    t = q.get("type")
    if t not in TYPES:
        rep.err(f, qid, f"未知题型 {t!r}"); return
    for k in ("question", "answer", "explanation"):
        if k not in q or q[k] in (None, "", []):
            rep.err(f, qid, f"缺少字段 {k}")
    if q.get("difficulty") not in (1, 2, 3):
        rep.err(f, qid, "difficulty 必须是 1/2/3")
    if q.get("frequency") not in (1, 2, 3):
        rep.err(f, qid, "frequency 必须是 1/2/3")
    pts = q.get("points")
    if not isinstance(pts, list) or not pts:
        rep.err(f, qid, "points 必须是非空列表")
    else:
        valid = set(tax.get((dom, sub), {}).get("points", []))
        bad = [p for p in pts if p not in valid]
        if bad:
            rep.warn(f, qid, f"考点不在 taxonomy 中：{bad}")
    for key in ("points", "tags"):
        vals = q.get(key)
        if vals is not None and (not isinstance(vals, list)
                                 or any(not isinstance(v, str) or not v.strip() for v in vals)):
            # 常见原因：YAML 把未加引号的 NULL / null / ~ / yes / no 解析成了空值或布尔值
            rep.err(f, qid, f"{key} 的每一项都必须是非空字符串（NULL、yes 等词需要加引号）：{vals}")
    expl = text(q.get("explanation"))
    if t not in SUBJECTIVE and len(expl.strip()) < 40:
        rep.warn(f, qid, f"讲解过短（{len(expl.strip())} 字）")
    qtext = text(q.get("question"))
    if "\ufffd" in yaml.safe_dump(q, allow_unicode=True):
        rep.err(f, qid, "含乱码字符 U+FFFD")

    ans = q.get("answer")
    opts = q.get("options")
    if t in ("single", "multiple"):
        if not isinstance(opts, dict) or not opts:
            rep.err(f, qid, "选择题缺少 options"); return
        keys = list(opts.keys())
        if keys != [chr(65 + i) for i in range(len(keys))]:
            rep.err(f, qid, f"选项键必须依次为 A、B、C……，实际为 {keys}")
        if any(not str(v).strip() for v in opts.values()):
            rep.err(f, qid, "存在空选项")
        if t == "single":
            if len(keys) != 4:
                rep.warn(f, qid, f"单选题建议 4 个选项（当前 {len(keys)} 个）")
            if not isinstance(ans, str) or ans not in opts:
                rep.err(f, qid, f"单选答案 {ans!r} 不在选项中")
        else:
            if len(keys) not in (4, 5):
                rep.warn(f, qid, f"多选题建议 4～5 个选项（当前 {len(keys)} 个）")
            if not isinstance(ans, list) or len(ans) < 2:
                rep.err(f, qid, "多选答案必须是至少 2 个字母的列表")
            elif any(a not in opts for a in ans) or len(set(ans)) != len(ans):
                rep.err(f, qid, f"多选答案 {ans} 含不存在或重复的选项")
            elif len(ans) == len(keys):
                rep.warn(f, qid, "多选题所有选项都正确，区分度低")
    elif t == "judge":
        if not isinstance(ans, bool):
            rep.err(f, qid, "判断题答案必须是 true 或 false")
    elif t == "fill":
        n_blank = qtext.count(BLANK)
        if not isinstance(ans, list) or not ans:
            rep.err(f, qid, "填空题答案必须是列表")
        elif n_blank != len(ans):
            rep.err(f, qid, f"空位数 {n_blank} 与答案数 {len(ans)} 不一致（空位用 ____ 表示）")
        else:
            for a in ans:
                if not (isinstance(a, (str, int, float)) and str(a).strip()) and not (
                        isinstance(a, list) and a and all(str(x).strip() for x in a)):
                    rep.err(f, qid, f"填空答案格式错误：{a!r}")
    elif t in SUBJECTIVE:
        if len(text(ans).strip()) < 80:
            rep.warn(f, qid, "主观题参考答案过短（少于 80 字）")
        rub = q.get("rubric")
        if not isinstance(rub, list) or len(rub) < 2:
            rep.err(f, qid, "主观题必须提供至少 2 条 rubric")
        else:
            total = sum(float(x) for r in rub for x in RUBRIC_PTS.findall(str(r)))
            if abs(total - 10) > 1e-6:
                rep.warn(f, qid, f"rubric 分值合计为 {total:g}，应为 10")
    elif t == "calc":
        if not str(ans).strip():
            rep.err(f, qid, "计算题缺少最终答案")

    # ---- 代码类：登记运行任务 ----
    if t in CODE_TYPES:
        code = text(q.get("code"))
        if t != "coding" and not code.strip():
            rep.err(f, qid, "缺少 code 字段"); return
        if t == "code_output":
            jobs.append((f, qid, "output", code, text(ans)))
        elif t == "coding":
            test = text(q.get("test"))
            if not test.strip():
                rep.err(f, qid, "编程题必须提供 test"); return
            jobs.append((f, qid, "pass", text(ans) + "\n\n" + test, None))
        elif t == "code_debug":
            fixed, test = text(q.get("fixed_code")), text(q.get("test"))
            if fixed.strip() and test.strip():
                jobs.append((f, qid, "pass", fixed + "\n\n" + test, None))
                jobs.append((f, qid, "fail", code + "\n\n" + test, None))
            else:
                rep.warn(f, qid, "改错题建议提供 fixed_code 与 test 以便自动验证")
        elif t == "code_fill":
            n_blank = code.count(BLANK)
            if not isinstance(ans, list) or len(ans) != n_blank:
                rep.err(f, qid, f"代码空位数 {n_blank} 与答案数不一致")
            elif text(q.get("test")).strip():
                filled = code
                for a in ans:
                    filled = filled.replace(BLANK, str(a), 1)
                jobs.append((f, qid, "pass", filled + "\n\n" + text(q["test"]), None))
            else:
                rep.warn(f, qid, "代码填空题建议提供 test 以便自动验证")


def run_jobs(jobs, rep: Report, workers=8):
    def one(job):
        f, qid, mode, code, expect = job
        miss = missing_deps(code)
        if miss:
            return job, "skip", f"缺少依赖 {miss}，跳过运行"
        rc, out, err = run_py(code)
        return job, rc, (out, err)

    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        for job, rc, payload in ex.map(one, jobs):
            f, qid, mode, code, expect = job
            if rc == "skip":
                rep.warn(f, qid, payload); continue
            out, err = payload
            if mode == "output":
                if rc != 0:
                    rep.err(f, qid, f"代码运行失败：{err.strip().splitlines()[-1] if err.strip() else rc}")
                elif norm_out(out) != norm_out(expect or ""):
                    rep.err(f, qid, f"输出与答案不符。\n      实际：{norm_out(out)[:200]!r}\n      答案：{norm_out(expect or '')[:200]!r}")
            elif mode == "pass" and rc != 0:
                last = err.strip().splitlines()[-1] if err.strip() else f"exit {rc}"
                rep.err(f, qid, f"参考实现 / 修正代码未通过测试：{last[:200]}")
            elif mode == "fail" and rc == 0:
                rep.warn(f, qid, "原（有 bug 的）代码也通过了测试，测试无法证明 bug 存在")


def shingles(s: str, n=4):
    s = re.sub(r"\s+", "", s)
    return {s[i:i + n] for i in range(max(1, len(s) - n + 1))}


def dup_check(all_q, rep: Report, thr=0.72):
    index = defaultdict(set)
    sh = {}
    for qid, (f, qt) in all_q.items():
        sh[qid] = shingles(qt)
        for g in sh[qid]:
            index[g].add(qid)
    seen = set()
    for qid, gs in sh.items():
        cand = Counter()
        for g in gs:
            if len(index[g]) < 60:   # 忽略过于常见的片段
                for o in index[g]:
                    if o != qid:
                        cand[o] += 1
        for o, c in cand.items():
            if (o, qid) in seen:
                continue
            inter = c
            union = len(gs) + len(sh[o]) - inter
            if union and inter / union >= thr:
                seen.add((qid, o))
                rep.warn(all_q[qid][0], qid, f"题干与 {o} 高度相似（Jaccard {inter / union:.2f}），请检查是否重复")


def stats(files_data, tax):
    print("\n=================== 覆盖与配比统计 ===================")
    for (dom, sub), qs in sorted(files_data.items()):
        info = tax.get((dom, sub))
        target = info["sub"]["target"] if info else "?"
        types = Counter(q.get("type") for q in qs)
        diffs = Counter(q.get("difficulty") for q in qs)
        pts = Counter(p for q in qs for p in (q.get("points") or []))
        lacking = [p for p in (info["points"] if info else []) if pts[p] < 2]
        print(f"\n[{dom}-{sub}] {info['sub']['name'] if info else ''}：{len(qs)} 题 / 目标 {target}")
        print("  题型：" + "，".join(f"{TYPES.get(k, k)} {v}" for k, v in types.most_common()))
        print("  难度：" + "，".join(f"{k}:{diffs[k]}" for k in (1, 2, 3)))
        singles = [q.get("answer") for q in qs if q.get("type") == "single"]
        if singles:
            print("  单选答案分布：" + " ".join(f"{k}:{v}" for k, v in sorted(Counter(singles).items())))
            longest = 0
            for q in qs:
                if q.get("type") == "single" and isinstance(q.get("options"), dict) and q.get("answer") in q["options"]:
                    lens = {k: len("".join(str(v).split())) for k, v in q["options"].items()}
                    top = max(lens.values())
                    longest += lens[q["answer"]] == top and list(lens.values()).count(top) == 1
            print(f"  单选正确项为唯一最长：{longest}/{len(singles)}（随机约 25%，过高说明长度泄露答案）")
        multis = Counter(f"{len(q['answer'])}/{len(q.get('options') or {})}" for q in qs
                         if q.get("type") == "multiple" and isinstance(q.get("answer"), list))
        if multis:
            print("  多选正确项数（正确/选项）：" + " ".join(f"{k}:{v}" for k, v in sorted(multis.items())))
        judges = Counter(q.get("answer") for q in qs if q.get("type") == "judge")
        if judges:
            print(f"  判断题答案：正确 {judges[True]}，错误 {judges[False]}")
        if lacking:
            print(f"  覆盖不足（<2 题）的考点：{lacking}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--no-run", action="store_true")
    ap.add_argument("--stats", action="store_true")
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    tax = load_taxonomy()
    files = [Path(x).resolve() for x in args.files] if args.files else sorted(QDIR.rglob("*.yaml"))
    rep = Report()
    seen_ids, jobs, all_q = {}, [], {}
    files_data = {}
    # 查重和 ID 唯一性需要全库数据：只校验部分文件时也加载其余文件参与比较
    universe = sorted(QDIR.rglob("*.yaml"))
    check_set = {f.resolve() for f in files}
    for f in universe + [x for x in files if x not in universe]:
        rel = f.relative_to(ROOT).as_posix() if f.is_relative_to(ROOT) else str(f)
        try:
            data = yaml.load(f.read_text(encoding="utf-8"), Loader=UniqueKeyLoader)
        except yaml.YAMLError as e:
            if f.resolve() in check_set:
                rep.err(rel, "-", f"YAML 解析失败：{e}")
            continue
        if not isinstance(data, dict) or "questions" not in data:
            if f.resolve() in check_set:
                rep.err(rel, "-", "文件顶层必须包含 domain、subcategory、questions")
            continue
        dom, sub = data.get("domain"), data.get("subcategory")
        if f.resolve() in check_set:
            if (f.parent.name, f.stem) != (dom, sub):
                rep.err(rel, "-", f"文件路径应为 questions/{dom}/{sub}.yaml")
            if (dom, sub) not in tax:
                rep.err(rel, "-", f"taxonomy 中不存在 {dom}-{sub}")
        qs = data.get("questions") or []
        if f.resolve() in check_set:
            files_data[(dom, sub)] = qs
        nums = []
        for q in qs:
            if not isinstance(q, dict):
                if f.resolve() in check_set:
                    rep.err(rel, "?", "题目必须是映射（dict）")
                continue
            if f.resolve() in check_set:
                check_question(q, rel, rep, tax, dom, sub, seen_ids, jobs)
            else:
                seen_ids.setdefault(q.get("id"), rel)
            all_q[q.get("id")] = (rel, text(q.get("question")) + " " + text(q.get("code")) + " "
                                  + " ".join(map(str, (q.get("options") or {}).values())))
            m = ID_RE.match(str(q.get("id")))
            if m:
                nums.append(int(m.group(3)))
        if f.resolve() in check_set and nums != sorted(nums):
            rep.warn(rel, "-", "题目 ID 未按序号递增排列")

    if jobs and not args.no_run:
        run_jobs(jobs, rep, args.workers)
    dup_check({k: v for k, v in all_q.items() if k}, rep)

    n_q = sum(len(v) for v in files_data.values())
    for f in sorted(rep.items):
        if not any(f == (p.relative_to(ROOT).as_posix() if p.is_relative_to(ROOT) else str(p)) for p in check_set):
            continue
        print(f"\n== {f}")
        for level, qid, msg in rep.items[f]:
            print(f"  [{level}] {qid}: {msg}")
    if args.stats:
        stats(files_data, tax)
    print(f"\n校验 {len(files_data)} 个文件、{n_q} 道题，代码运行任务 {0 if args.no_run else len(jobs)} 个："
          f"ERROR {rep.n_err}，WARN {rep.n_warn}")
    sys.exit(1 if rep.n_err else 0)


if __name__ == "__main__":
    main()
