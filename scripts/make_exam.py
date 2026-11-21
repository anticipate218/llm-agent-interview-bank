"""按预设或自定义条件组一套模拟卷（试卷与答案分开输出）。

用法：
    python scripts/make_exam.py --list                          # 查看预设
    python scripts/make_exam.py --preset agent-app --seed 1     # 生成 exams/agent-app-s1.md 与答案
    python scripts/make_exam.py --domains LLM,INF --single 20 --short 3 --seed 7 --title "自定义卷"
"""
from __future__ import annotations

import argparse
import random
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
TYPE_NAME = {"single": "单选题", "multiple": "多选题", "judge": "判断题", "fill": "填空题", "calc": "计算题",
             "code_output": "代码输出题", "code_fill": "代码填空题", "code_debug": "代码改错题", "coding": "编程题",
             "short": "简答题", "scenario": "场景分析题", "design": "系统设计题"}
SCORE = {"single": 2, "multiple": 3, "judge": 1, "fill": 2, "calc": 5, "code_output": 3, "code_fill": 4,
         "code_debug": 6, "coding": 12, "short": 8, "scenario": 12, "design": 15}
CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]   # 题型最多 12 种

PRESETS = {
    "llm-algo": {
        "title": "大模型算法岗 · 模拟笔试卷", "minutes": 120,
        "domains": ["FND", "LLM", "TRN", "ALN", "INF"],
        "mix": {"single": 15, "multiple": 6, "judge": 10, "fill": 5, "calc": 3, "code_fill": 1, "coding": 1, "short": 3},
    },
    "agent-app": {
        "title": "Agent 应用开发岗 · 模拟笔试卷", "minutes": 120,
        "domains": ["AGT", "RAG", "EVL", "SEC", "ENG"],
        "mix": {"single": 15, "multiple": 6, "judge": 10, "fill": 3, "code_output": 1, "coding": 1, "short": 3, "scenario": 1, "design": 1},
    },
    "llm-infra": {
        "title": "大模型工程 / 推理优化岗 · 模拟笔试卷", "minutes": 120,
        "domains": ["INF", "TRN", "ENG", "CS"],
        "mix": {"single": 15, "multiple": 6, "judge": 10, "fill": 4, "calc": 4, "code_debug": 1, "coding": 1, "short": 2, "scenario": 1},
    },
    "cs-basic": {
        "title": "编程与计算机基础 · 模拟笔试卷", "minutes": 90,
        "domains": ["CS"],
        "mix": {"single": 15, "multiple": 5, "judge": 10, "code_output": 3, "code_debug": 1, "coding": 2, "short": 2},
    },
    "full": {
        "title": "大模型与 Agent 综合模拟卷", "minutes": 150,
        "domains": None,
        "mix": {"single": 20, "multiple": 8, "judge": 10, "fill": 5, "calc": 2, "code_output": 1, "code_fill": 1, "coding": 1, "short": 3, "scenario": 1, "design": 1},
    },
}


def load_bank():
    bank = []
    for f in sorted((ROOT / "questions").rglob("*.yaml")):
        data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        for q in data.get("questions") or []:
            bank.append({**q, "_dom": data["domain"], "_sub": data["subcategory"]})
    return bank


def pick(pool, n, rng, diff_ratio=(0.3, 0.5, 0.2)):
    """按难度配比抽题，并在小类之间轮转，避免集中在同一个小类。"""
    by_diff = defaultdict(list)
    for q in pool:
        by_diff[q.get("difficulty", 2)].append(q)
    want = {1: round(n * diff_ratio[0]), 3: round(n * diff_ratio[2])}
    want[2] = n - want[1] - want[3]
    chosen = []
    for d in (1, 2, 3):
        cand = by_diff[d][:]
        rng.shuffle(cand)
        by_sub = defaultdict(list)
        for q in cand:
            by_sub[q["_sub"] + q["_dom"]].append(q)
        subs = list(by_sub)
        rng.shuffle(subs)
        while len([c for c in chosen if c.get("difficulty", 2) == d]) < want[d] and any(by_sub.values()):
            for s in subs:
                if by_sub[s] and len([c for c in chosen if c.get("difficulty", 2) == d]) < want[d]:
                    chosen.append(by_sub[s].pop())
    rest = [q for q in pool if q not in chosen]
    rng.shuffle(rest)
    chosen += rest[: n - len(chosen)]              # 某个难度不够时用其他难度补齐
    return chosen[:n]


def render_stem(q, i):
    lines = [f"**{i}.** " + q["question"].strip(), ""]
    if q["type"] in ("single", "multiple"):
        lines += [f"- {k}. {v}" for k, v in q["options"].items()] + [""]
    if q.get("code") and q["type"] in ("code_output", "code_debug", "code_fill"):
        lines += ["```python", q["code"].rstrip(), "```", ""]
    if q["type"] == "judge":
        lines += ["（　　）", ""]
    return "\n".join(lines)


def render_answer(q, i):
    t, a = q["type"], q["answer"]
    if t == "single":
        head = f"**{i}. {a}**"
    elif t == "multiple":
        head = f"**{i}. {''.join(a)}**"
    elif t == "judge":
        head = f"**{i}. {'正确' if a else '错误'}**"
    elif t in ("fill", "code_fill"):
        head = f"**{i}.** " + "；".join(" / ".join(map(str, x)) if isinstance(x, list) else str(x) for x in a)
    elif t == "code_output":
        head = f"**{i}.** 输出：\n\n```text\n{str(a).rstrip()}\n```"
    elif t == "coding":
        head = f"**{i}.** 参考实现：\n\n```python\n{str(a).rstrip()}\n```"
    else:
        head = f"**{i}.** 参考答案：\n\n{str(a).strip()}"
        if q.get("rubric"):
            head += "\n\n评分要点：\n\n" + "\n".join(f"- {r}" for r in q["rubric"])
    return f"{head}\n\n<sub>{q['id']}</sub>　{q['explanation'].strip()}\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--domains")
    ap.add_argument("--title", default="自定义模拟卷")
    ap.add_argument("--minutes", type=int, default=90)
    ap.add_argument("--out", default=str(ROOT / "exams"))
    for t in TYPE_NAME:
        ap.add_argument(f"--{t}", type=int, default=0)
    args = ap.parse_args()
    if args.list:
        for k, v in PRESETS.items():
            print(f"{k:10s} {v['title']}（{v['minutes']} 分钟）")
        return
    if args.preset:
        cfg = PRESETS[args.preset]
        name = args.preset
    else:
        cfg = {"title": args.title, "minutes": args.minutes,
               "domains": args.domains.split(",") if args.domains else None,
               "mix": {t: getattr(args, t) for t in TYPE_NAME if getattr(args, t)}}
        name = "custom"
    rng = random.Random(args.seed)
    bank = load_bank()
    if cfg["domains"]:
        bank = [q for q in bank if q["_dom"] in cfg["domains"]]

    sections, total = [], 0
    for t in TYPE_NAME:
        n = cfg["mix"].get(t, 0)
        if not n:
            continue
        pool = [q for q in bank if q["type"] == t]
        if not pool:
            continue
        qs = pick(pool, min(n, len(pool)), rng)
        sections.append((t, qs))
        total += SCORE[t] * len(qs)

    paper = [f"# {cfg['title']}", "",
             f"> 满分 {total} 分　｜　建议用时 {cfg['minutes']} 分钟　｜　随机种子 {args.seed}　｜　答案见同目录 `{name}-s{args.seed}-answers.md`", ""]
    answers = [f"# {cfg['title']} · 参考答案与解析", ""]
    no = 0
    for si, (t, qs) in enumerate(sections):
        head = f"## {CN_NUM[si]}、{TYPE_NAME[t]}（每题 {SCORE[t]} 分，共 {SCORE[t] * len(qs)} 分）"
        paper += [head, ""]
        answers += [head, ""]
        for q in qs:
            no += 1
            paper.append(render_stem(q, no))
            answers.append(render_answer(q, no))
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{name}-s{args.seed}.md").write_text("\n".join(paper).rstrip("\n") + "\n", encoding="utf-8", newline="\n")
    (out / f"{name}-s{args.seed}-answers.md").write_text("\n".join(answers).rstrip("\n") + "\n", encoding="utf-8", newline="\n")
    print(f"已生成 {out / (name + f'-s{args.seed}.md')}：{no} 题，满分 {total} 分")


if __name__ == "__main__":
    main()
