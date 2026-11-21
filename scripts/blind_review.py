"""盲答复核：导出不含答案的客观题，供独立作答者重新作答；再把作答结果与答案键比对。

导出：python scripts/blind_review.py export LLM --out drafts/blind-LLM.md [--sub ATTN,POS] [--types single,multiple,judge,fill]
比对：python scripts/blind_review.py compare drafts/blind-LLM-answers.json [--out drafts/blind-LLM-diff.md]

作答文件格式（JSON）：{"LLM-ATTN-001": "B", "LLM-ATTN-002": ["A", "D"], "LLM-ATTN-003": false,
                      "LLM-ATTN-004": ["128", "1"], "LLM-ATTN-007": "第一行输出\\n第二行输出"}
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
OBJECTIVE = ("single", "multiple", "judge", "fill", "code_output")


def load(domain=None, subs=None):
    out = {}
    for f in sorted((ROOT / "questions").rglob("*.yaml")):
        d = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        if domain and d.get("domain") != domain:
            continue
        if subs and d.get("subcategory") not in subs:
            continue
        for q in d.get("questions") or []:
            out[q["id"]] = q
    return out


def norm(s) -> str:
    s = str(s).strip().lower()
    s = re.sub(r"[\s`$，,。]", "", s)
    return s


def same(q, given) -> bool:
    t, key = q["type"], q["answer"]
    if t == "single":
        return isinstance(given, str) and given.strip().upper() == key
    if t == "multiple":
        return isinstance(given, list) and sorted(x.strip().upper() for x in given) == sorted(key)
    if t == "judge":
        if isinstance(given, str):
            given = given.strip() in ("true", "对", "正确", "T", "√")
        return bool(given) == key
    if t == "fill":
        if not isinstance(given, list) or len(given) != len(key):
            return False
        alts = [{norm(a) for a in (k if isinstance(k, list) else [k])} for k in key]
        if q.get("unordered"):                      # 各空顺序可互换：逐个找未用过的匹配空位
            left = list(range(len(alts)))
            for g in given:
                hit = next((i for i in left if norm(g) in alts[i]), None)
                if hit is None:
                    return False
                left.remove(hit)
            return True
        return all(norm(g) in a for g, a in zip(given, alts))
    if t == "code_output":
        clean = lambda s: "\n".join(l.rstrip() for l in str(s).strip().splitlines())  # noqa: E731
        return clean(given) == clean(key)
    return True


def export(args):
    qs = load(args.domain, set(args.sub.split(",")) if args.sub else None)
    types = set(args.types.split(","))
    lines = [f"# 盲答复核：{args.domain}", "",
             "请独立作答下列题目，把答案写成 JSON：单选写字母，多选写字母列表，判断写 true/false，"
             "填空写字符串列表，代码输出题写完整输出字符串。", ""]
    n = 0
    for qid, q in qs.items():
        if q["type"] not in OBJECTIVE or q["type"] not in types:
            continue
        n += 1
        extra = ""
        if q["type"] == "fill":
            extra = f"，共 {len(q['answer'])} 空" + ("，各空顺序不限" if q.get("unordered") else "")
        lines += [f"## {qid}（{q['type']}{extra}）", "", q["question"].strip(), ""]
        if q.get("options"):
            lines += [f"- {k}. {v}" for k, v in q["options"].items()] + [""]
        if q.get("code"):
            lines += ["```python", q["code"].rstrip(), "```", ""]
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"导出 {n} 道客观题到 {args.out}")


def compare(args):
    given = json.loads(Path(args.answers).read_text(encoding="utf-8"))
    qs = load()
    diff, ok, missing = [], 0, []
    for qid, g in given.items():
        q = qs.get(qid)
        if not q:
            missing.append(qid)
            continue
        if same(q, g):
            ok += 1
        else:
            diff.append((qid, q, g))
    out = [f"# 盲答不一致清单（{len(diff)} / {len(given)}）", ""]
    for qid, q, g in diff:
        out += [f"## {qid}（{q['type']}）", "", q["question"].strip(), ""]
        if q.get("options"):
            out += [f"- {k}. {v}" for k, v in q["options"].items()] + [""]
        out += [f"- **答案键**：{json.dumps(q['answer'], ensure_ascii=False)}",
                f"- **盲答**：{json.dumps(g, ensure_ascii=False)}", "", "**原讲解**：", "", q["explanation"].strip(), ""]
    if args.out:
        Path(args.out).write_text("\n".join(out), encoding="utf-8", newline="\n")
    print(f"一致 {ok}，不一致 {len(diff)}，未找到 {len(missing)}" + (f"；清单写入 {args.out}" if args.out else ""))
    for qid, q, g in diff:
        print(f"  {qid}: 答案键 {json.dumps(q['answer'], ensure_ascii=False)}  盲答 {json.dumps(g, ensure_ascii=False)}")


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    e = sp.add_parser("export")
    e.add_argument("domain")
    e.add_argument("--sub")
    e.add_argument("--out", required=True)
    e.add_argument("--types", default="single,multiple,judge,fill",
                   help="导出的题型，逗号分隔（代码输出题已由 validate.py 实际运行核对，默认不导出）")
    c = sp.add_parser("compare")
    c.add_argument("answers")
    c.add_argument("--out")
    args = ap.parse_args()
    export(args) if args.cmd == "export" else compare(args)


if __name__ == "__main__":
    main()
