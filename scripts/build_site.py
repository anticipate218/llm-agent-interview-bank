"""生成在线刷题网站（site/）所需的数据文件。

    python scripts/build_site.py          # 输出到 site/data/
    python -m http.server -d site 8000    # 本地预览：打开 http://localhost:8000

产物（不提交到仓库，由 GitHub Actions 在部署时生成）：
  site/data/index.json       分类体系、每道题的元信息（题型 / 难度 / 考频）、组卷预设、备考路线
  site/data/q/<ID>.json      单道题的完整内容（按需加载）
  site/data/search.json      搜索索引（题干摘要与考点）
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import shutil
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "data"

TYPE_NAME = {
    "single": "单选题", "multiple": "多选题", "judge": "判断题", "fill": "填空题", "calc": "计算题",
    "code_output": "代码输出题", "code_fill": "代码填空题", "code_debug": "代码改错题", "coding": "编程题",
    "short": "简答题", "scenario": "场景分析题", "design": "系统设计题",
}
FIELDS = ["id", "type", "difficulty", "frequency", "points", "tags", "question", "code", "options", "answer",
          "unordered", "explanation", "rubric", "fixed_code", "test", "source"]

# 每个大类的主题色与图标名（图标在前端以内联 SVG 绘制）
DOMAIN_STYLE = {
    "FND": ("#0ea5e9", "sigma"), "LLM": ("#6366f1", "layers"), "TRN": ("#8b5cf6", "flask"),
    "ALN": ("#ec4899", "target"), "INF": ("#f97316", "bolt"), "RAG": ("#14b8a6", "search"),
    "AGT": ("#10b981", "robot"), "EVL": ("#eab308", "chart"), "ENG": ("#64748b", "gear"),
    "SEC": ("#ef4444", "shield"), "CS": ("#3b82f6", "code"),
}

# 备考路线：按岗位方向与难度、考频筛题（前端据此从 index.q 中挑题）
TRACKS = [
    {"id": "intern", "name": "实习必刷", "icon": "spark",
     "desc": "高频必考（★★★）且难度为基础或进阶的题，覆盖全部方向，适合实习与校招的第一轮准备。",
     "filter": {"minFreq": 3, "maxDiff": 2}},
    {"id": "algo", "name": "大模型算法岗", "icon": "layers",
     "desc": "机器学习基础、Transformer 原理、预训练与微调、对齐与强化学习、大模型评测。",
     "filter": {"domains": ["FND", "LLM", "TRN", "ALN"], "subs": ["EVL-LLM"], "minFreq": 2}},
    {"id": "agent", "name": "Agent 应用开发岗", "icon": "robot",
     "desc": "Agent 范式、工具调用与协议、记忆与上下文工程、RAG、工程化、安全与 Agent 评测。",
     "filter": {"domains": ["AGT", "RAG", "ENG", "SEC"], "subs": ["EVL-AGENT"], "minFreq": 2}},
    {"id": "infra", "name": "推理与工程岗", "icon": "bolt",
     "desc": "推理优化与部署、分布式训练与显存、成本与性能、操作系统与分布式系统。",
     "filter": {"domains": ["INF"], "subs": ["TRN-DIST", "TRN-MEM", "ENG-PERF", "ENG-STAB", "CS-OS", "CS-DIST"],
                "minFreq": 2}},
    {"id": "coding", "name": "手撕代码", "icon": "code",
     "desc": "代码输出、填空、改错与编程题，面试「手撕」环节的高频实现。",
     "filter": {"types": ["code_output", "code_fill", "code_debug", "coding"]}},
    {"id": "challenge", "name": "挑战题", "icon": "flame",
     "desc": "难度为「挑战」的推导、多步计算、细节陷阱与复杂场景，冲刺高阶岗位。",
     "filter": {"minDiff": 3}},
]


def load_make_exam():
    spec = importlib.util.spec_from_file_location("make_exam", ROOT / "scripts" / "make_exam.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


TEX_UNICODE = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε", "varepsilon": "ε", "eta": "η", "theta": "θ",
    "lambda": "λ", "mu": "μ", "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "phi": "φ", "omega": "ω", "Delta": "Δ",
    "Sigma": "Σ", "sum": "Σ", "prod": "Π", "sqrt": "√", "times": "×", "cdot": "·", "le": "≤", "leq": "≤", "ge": "≥",
    "geq": "≥", "approx": "≈", "neq": "≠", "infty": "∞", "top": "ᵀ", "to": "→", "in": "∈", "log": "log", "exp": "exp",
    "min": "min", "max": "max", "frac": "", "left": "", "right": "", "quad": " ",
}


def plain(text: str, limit: int = 160) -> str:
    """把 Markdown / LaTeX 粗略转成纯文本，用于搜索与摘要。"""
    def math(m):  # 公式：常用命令转成 Unicode，其余命令与上下标符号去掉（代码里的下划线不受影响）
        x = re.sub(r"\\(?:text|mathrm|operatorname|mathbf|mathcal)\{([^}]*)\}", r"\1", m.group(1))
        x = re.sub(r"\\([a-zA-Z]+)", lambda c: TEX_UNICODE.get(c.group(1), " " if len(c.group(1)) > 3 else c.group(1)), x)
        return re.sub(r"[{}^_\\]", "", x)

    s = re.sub(r"```.*?```", " ", text, flags=re.S)
    s = re.sub(r"\$\$(.*?)\$\$", math, s, flags=re.S)
    s = re.sub(r"\$([^$\n]+)\$", math, s)
    s = re.sub(r"[*`#>]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s[:limit]


def main():
    tax = yaml.safe_load((ROOT / "taxonomy.yaml").read_text(encoding="utf-8"))
    qs_by_sub: dict[tuple[str, str], list[dict]] = {}
    for f in sorted((ROOT / "questions").glob("*/*.yaml")):
        data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        qs_by_sub[(data["domain"], data["subcategory"])] = data.get("questions") or []

    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "q").mkdir(parents=True)

    digest = hashlib.md5()
    domains, compact, search = [], [], []
    type_counts: dict[str, int] = {}
    diff_counts = {"1": 0, "2": 0, "3": 0}
    for d in tax["domains"]:
        color, icon = DOMAIN_STYLE.get(d["code"], ("#6366f1", "layers"))
        subs = []
        for s in d["subcategories"]:
            qs = qs_by_sub.get((d["code"], s["code"]), [])
            subs.append({"code": s["code"], "name": s["name"], "description": s.get("description", ""),
                         "count": len(qs), "points": s.get("points", [])})
            for q in qs:
                rec = {k: q[k] for k in FIELDS if k in q and q[k] not in (None, "", [])}
                if q.get("unordered"):
                    rec["unordered"] = True
                text = json.dumps(rec, ensure_ascii=False, separators=(",", ":"))
                digest.update(text.encode("utf-8"))
                (OUT / "q" / f"{q['id']}.json").write_text(text + "\n", encoding="utf-8", newline="\n")
                compact.append([q["id"], q["type"], q.get("difficulty", 2), q.get("frequency", 2)])
                type_counts[q["type"]] = type_counts.get(q["type"], 0) + 1
                diff_counts[str(q.get("difficulty", 2))] += 1
                search.append([q["id"], plain(q["question"]),
                               " ".join((q.get("points") or []) + (q.get("tags") or []))])
        domains.append({"code": d["code"], "name": d["name"], "description": d.get("description", ""),
                        "color": color, "icon": icon, "count": sum(x["count"] for x in subs), "subs": subs})

    me = load_make_exam()
    index = {
        "version": digest.hexdigest()[:12],
        "total": len(compact),
        "typeNames": TYPE_NAME,
        "typeCounts": type_counts,
        "difficultyCounts": diff_counts,
        "points": sum(len(s["points"]) for d in domains for s in d["subs"]),
        "domains": domains,
        "q": compact,
        "score": me.SCORE,
        "presets": me.PRESETS,
        "tracks": TRACKS,
    }
    (OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n",
                                    encoding="utf-8", newline="\n")
    (OUT / "search.json").write_text(json.dumps(search, ensure_ascii=False, separators=(",", ":")) + "\n",
                                     encoding="utf-8", newline="\n")
    size = sum(p.stat().st_size for p in OUT.rglob("*.json"))
    print(f"网站数据已生成：{len(compact)} 道题，{len(domains)} 个大类，版本 {index['version']}，"
          f"共 {size / 1024 / 1024:.1f} MB → {OUT.relative_to(ROOT).as_posix()}/")


if __name__ == "__main__":
    main()
