"""从 questions/*.yaml 生成浏览页面与数据文件。

用法：python scripts/build.py
输出：
  docs/README.md                 题库导航（大类 / 小类 / 题型统计）
  docs/<大类>/<小类>.md          按小类的练习页（答案默认折叠）
  docs/by-type/<题型>.md         按题型浏览的索引
  dist/questions.json            全部题目（结构化数据）
  dist/questions.csv             表格版（可导入表格软件或 Anki）
  README.md                      更新 <!-- STATS:START --> 与 <!-- STATS:END --> 之间的统计
"""
from __future__ import annotations

import csv
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
QDIR, DOCS, DIST = ROOT / "questions", ROOT / "docs", ROOT / "dist"

TYPE_ORDER = ["single", "multiple", "judge", "fill", "calc", "code_output", "code_fill",
              "code_debug", "coding", "short", "scenario", "design"]
TYPE_NAME = {"single": "单选题", "multiple": "多选题", "judge": "判断题", "fill": "填空题", "short": "简答题",
             "calc": "计算题", "code_output": "代码输出题", "code_debug": "代码改错题", "code_fill": "代码填空题",
             "coding": "编程题", "scenario": "场景分析题", "design": "系统设计题"}
DIFF = {1: "基础", 2: "进阶", 3: "挑战"}
STARS = {1: "★", 2: "★★", 3: "★★★"}
GROUP = {  # 统计表中的列
    "单选": ["single"], "多选": ["multiple"], "判断": ["judge"], "填空": ["fill"], "计算": ["calc"],
    "代码": ["code_output", "code_fill", "code_debug", "coding"], "简答": ["short"], "场景/设计": ["scenario", "design"],
}


def load():
    tax = yaml.safe_load((ROOT / "taxonomy.yaml").read_text(encoding="utf-8"))
    bank = {}
    for f in sorted(QDIR.rglob("*.yaml")):
        data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        bank[(data.get("domain"), data.get("subcategory"))] = data.get("questions") or []
    return tax, bank


def strip_md(s: str, n=42) -> str:
    s = re.sub(r"```.*?```", " ", s or "", flags=re.S)
    s = re.sub(r"[`*$|#>]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s if len(s) <= n else s[:n] + "…"


def fill_answer(a) -> str:
    if isinstance(a, list):
        return " / ".join(map(str, a))
    return str(a)


def render_question(q) -> str:
    t = q["type"]
    out = [f'<a name="{q["id"]}"></a>', "",
           f'### {q["id"]}　{DIFF.get(q.get("difficulty"), "")} · 考频 {STARS.get(q.get("frequency"), "")}', ""]
    out.append(q["question"].rstrip())
    out.append("")
    if t in ("single", "multiple"):
        for k, v in q["options"].items():
            out.append(f"- **{k}.** {v}")
        out.append("")
    if q.get("code") and t in ("code_output", "code_debug", "code_fill"):
        out += ["```python", q["code"].rstrip(), "```", ""]
    out += ["<details>", "<summary>答案与解析</summary>", ""]
    ans = q.get("answer")
    if t == "single":
        out.append(f"**答案：{ans}**")
    elif t == "multiple":
        out.append(f"**答案：{''.join(ans)}**")
    elif t == "judge":
        out.append("**答案：✅ 正确**" if ans else "**答案：❌ 错误**")
    elif t == "fill":
        out.append("**答案：** " + "；".join(f"({i + 1}) {fill_answer(a)}" for i, a in enumerate(ans))
                   + ("（各空顺序不限）" if q.get("unordered") else ""))
    elif t == "calc":
        out.append(f"**答案：{str(ans).strip()}**")
    elif t == "code_output":
        out += ["**答案（程序输出）：**", "", "```text", str(ans).rstrip(), "```"]
    elif t == "code_fill":
        out.append("**答案：** " + "；".join(f"({i + 1}) `{a}`" for i, a in enumerate(ans)))
    elif t == "code_debug":
        out += ["**答案：**", "", str(ans).rstrip()]
        if q.get("fixed_code"):
            out += ["", "**修正后的代码：**", "", "```python", q["fixed_code"].rstrip(), "```"]
    elif t == "coding":
        out += ["**参考实现：**", "", "```python", str(ans).rstrip(), "```"]
        if q.get("test"):
            out += ["", "**测试用例：**", "", "```python", q["test"].rstrip(), "```"]
    else:  # short / scenario / design
        out += ["**参考答案：**", "", str(ans).rstrip()]
        if q.get("rubric"):
            out += ["", "**评分要点（共 10 分）：**", ""] + [f"- {r}" for r in q["rubric"]]
    out += ["", "**解析：**" if t not in ("short", "scenario", "design") else "**讲解：**", "",
            q["explanation"].rstrip(), ""]
    meta = "考点：" + "、".join(q.get("points") or [])
    if q.get("source"):
        meta += f"　｜　出处：{q['source']}"
    out += [f"<sub>{meta}</sub>", "", "</details>", "", "---", ""]
    return "\n".join(out)


def counts_row(qs):
    c = Counter(q["type"] for q in qs)
    return [sum(c[t] for t in ts) for ts in GROUP.values()]


def build():
    tax, bank = load()
    if DOCS.exists():
        for p in DOCS.iterdir():
            if p.is_dir() and (p.name in {d["code"] for d in tax["domains"]} or p.name == "by-type"):
                shutil.rmtree(p)
    DOCS.mkdir(exist_ok=True)
    DIST.mkdir(exist_ok=True)

    all_rows, by_type = [], defaultdict(list)
    nav = ["# 题库导航", ""]
    total = sum(len(v) for v in bank.values())
    n_sub = sum(1 for v in bank.values() if v)
    nav += [f"共 **{total}** 道题，覆盖 {sum(1 for d in tax['domains'] if any(bank.get((d['code'], s['code'])) for s in d['subcategories']))} 个大类、"
            f"{n_sub} 个小类。每个小类一页，题目按题型分组，**答案与解析默认折叠**，适合自测。", ""]
    nav += ["| 大类 | 小类 | 题量 | " + " | ".join(GROUP) + " |",
            "|---|---|---|" + "---|" * len(GROUP)]
    for d in tax["domains"]:
        for s in d["subcategories"]:
            qs = bank.get((d["code"], s["code"])) or []
            if not qs:
                continue
            rel = f"{d['code']}/{s['code']}.md"
            nav.append(f"| {d['name']} | [{d['code']}-{s['code']} {s['name']}]({rel}) | {len(qs)} | "
                       + " | ".join(str(x) for x in counts_row(qs)) + " |")
            # ---- 小类页面 ----
            pc = Counter(p for q in qs for p in (q.get("points") or []))
            types = [t for t in TYPE_ORDER if any(q["type"] == t for q in qs)]
            page = [f"# {d['code']}-{s['code']} · {s['name']}", "",
                    f"> 所属大类：{d['name']}　｜　题量：{len(qs)}", "",
                    s.get("description", ""), "",
                    "**考点覆盖**：" + " · ".join(f"{p}（{pc[p]}）" for p in s.get("points", [])), "",
                    "**题型**：" + " · ".join(f"[{TYPE_NAME[t]}（{sum(q['type'] == t for q in qs)}）](#{TYPE_NAME[t]})" for t in types),
                    "", "---", ""]
            for t in types:
                page += [f"## {TYPE_NAME[t]}", ""]
                for q in sorted((q for q in qs if q["type"] == t), key=lambda x: x["id"]):
                    page.append(render_question(q))
                    by_type[t].append((q, rel))
            (DOCS / d["code"]).mkdir(exist_ok=True)
            (DOCS / rel).write_text("\n".join(page).rstrip("\n") + "\n", encoding="utf-8", newline="\n")
            for q in qs:
                all_rows.append({"domain": d["code"], "domain_name": d["name"], "subcategory": s["code"],
                                 "subcategory_name": s["name"], **q})

    # ---- 按题型索引 ----
    (DOCS / "by-type").mkdir(exist_ok=True)
    nav += ["", "## 按题型浏览", ""]
    for t in TYPE_ORDER:
        items = by_type.get(t) or []
        if not items:
            continue
        nav.append(f"- [{TYPE_NAME[t]}（{len(items)}）](by-type/{t}.md)")
        lines = [f"# {TYPE_NAME[t]}（{len(items)} 道）", "", "| 编号 | 题目 | 难度 | 考频 |", "|---|---|---|---|"]
        for q, rel in sorted(items, key=lambda x: x[0]["id"]):
            lines.append(f"| [{q['id']}](../{rel}#{q['id']}) | {strip_md(q['question'])} | "
                         f"{DIFF.get(q.get('difficulty'), '')} | {STARS.get(q.get('frequency'), '')} |")
        (DOCS / "by-type" / f"{t}.md").write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8", newline="\n")
    diff = Counter(r.get("difficulty") for r in all_rows)
    nav += ["", "## 难度分布", "", "| 基础 | 进阶 | 挑战 |", "|---|---|---|",
            f"| {diff[1]} | {diff[2]} | {diff[3]} |", ""]
    nav += ["## 分类体系", "", "全部大类、小类与考点的覆盖情况见 [taxonomy.md](taxonomy.md)。", ""]
    (DOCS / "README.md").write_text("\n".join(nav).rstrip("\n") + "\n", encoding="utf-8", newline="\n")

    # ---- 数据文件 ----
    meta = {"total": len(all_rows),
            "by_type": dict(Counter(r["type"] for r in all_rows)),
            "by_domain": dict(Counter(r["domain"] for r in all_rows))}
    (DIST / "questions.json").write_text(json.dumps({"meta": meta, "questions": all_rows}, ensure_ascii=False, indent=1) + "\n",
                                         encoding="utf-8", newline="\n")
    cols = ["id", "domain", "subcategory", "type", "difficulty", "frequency", "points", "question", "options",
            "answer", "explanation"]
    with (DIST / "questions.csv").open("w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(cols)
        for r in all_rows:
            w.writerow([r.get("id"), r["domain"], r["subcategory"], r.get("type"), r.get("difficulty"), r.get("frequency"),
                        "、".join(r.get("points") or []), r.get("question", "").strip(),
                        json.dumps(r.get("options") or {}, ensure_ascii=False),
                        json.dumps(r.get("answer"), ensure_ascii=False) if not isinstance(r.get("answer"), str) else r["answer"].strip(),
                        r.get("explanation", "").strip()])

    # ---- 分类体系全表 ----
    tx = ["# 分类体系与考点覆盖", "",
          "本页由 `scripts/build.py` 根据 `taxonomy.yaml` 与题目数据自动生成。括号内为该考点当前的题目数。", ""]
    for d in tax["domains"]:
        n_dom = sum(len(bank.get((d["code"], s["code"])) or []) for s in d["subcategories"])
        tx += [f"## {d['code']} · {d['name']}（{n_dom} 题）", "", d.get("description", ""), "",
               "| 小类 | 目标 | 当前 | 考点（题数） |", "|---|---|---|---|"]
        for s in d["subcategories"]:
            qs = bank.get((d["code"], s["code"])) or []
            pc = Counter(p for q in qs for p in (q.get("points") or []))
            link = f"[{d['code']}-{s['code']} {s['name']}]({d['code']}/{s['code']}.md)" if qs else f"{d['code']}-{s['code']} {s['name']}"
            tx.append(f"| {link} | {s['target']} | {len(qs)} | " + "、".join(f"{p}（{pc[p]}）" for p in s["points"]) + " |")
        tx.append("")
    (DOCS / "taxonomy.md").write_text("\n".join(tx).rstrip("\n") + "\n", encoding="utf-8", newline="\n")

    # ---- README 统计 ----
    readme = ROOT / "README.md"
    if readme.exists():
        stats = ["| 大类 | 小类数 | 题量 |", "|---|---|---|"]
        for d in tax["domains"]:
            n = sum(len(bank.get((d["code"], s["code"])) or []) for s in d["subcategories"])
            stats.append(f"| {d['code']} {d['name']} | {len(d['subcategories'])} | {n} |")
        stats.append(f"| **合计** | **{sum(len(d['subcategories']) for d in tax['domains'])}** | **{total}** |")
        tc = Counter(r["type"] for r in all_rows)
        stats += ["", "题型分布：" + "，".join(f"{TYPE_NAME[t]} {tc[t]}" for t in TYPE_ORDER if tc[t]) + "。",
                  f"难度分布：基础 {diff[1]}，进阶 {diff[2]}，挑战 {diff[3]}。"]
        text = readme.read_text(encoding="utf-8")
        text = re.sub(r"<!-- STATS:START -->.*?<!-- STATS:END -->",
                      lambda _: "<!-- STATS:START -->\n" + "\n".join(stats) + "\n<!-- STATS:END -->", text, flags=re.S)
        taxo = ["| 大类 | 小类 |", "|---|---|"]
        for d in tax["domains"]:
            taxo.append(f"| **{d['code']}** {d['name']} | " + " · ".join(s["name"] for s in d["subcategories"]) + " |")
        text = re.sub(r"<!-- TAXONOMY:START -->.*?<!-- TAXONOMY:END -->",
                      lambda _: "<!-- TAXONOMY:START -->\n" + "\n".join(taxo) + "\n<!-- TAXONOMY:END -->", text, flags=re.S)
        readme.write_text(text, encoding="utf-8", newline="\n")
    print(f"生成完成：{total} 道题，{n_sub} 个小类页面，{len(by_type)} 个题型索引；数据文件在 dist/")


if __name__ == "__main__":
    build()
