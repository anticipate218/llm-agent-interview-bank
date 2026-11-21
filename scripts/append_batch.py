"""把一批草稿题目追加到正式题目文件。

用法：python scripts/append_batch.py drafts/LLM-POS-1.yaml [--keep]

草稿文件与正式文件格式相同（含 domain、subcategory、questions 三个顶层字段）。
脚本会：解析检查 → 统一列表缩进 → 检查 ID 不与已有题目冲突 → 追加到 questions/<domain>/<sub>.yaml。
成功后默认删除草稿（--keep 保留）。追加后请运行 scripts/validate.py 校验。
"""
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    raw = src.read_text(encoding="utf-8").replace("\r\n", "\n")
    bad = [i + 1 for i, line in enumerate(raw.split("\n")) if chr(0xFFFD) in line]
    if bad:
        sys.exit(f"草稿含乱码字符 U+FFFD（第 {bad[:15]} 行），请重写这些句子后再追加")
    try:
        data = yaml.safe_load(raw)
    except yaml.YAMLError as e:
        sys.exit(f"草稿 YAML 解析失败：{e}")
    dom, sub = data.get("domain"), data.get("subcategory")
    qs = data.get("questions") or []
    if not dom or not sub or not qs:
        sys.exit("草稿必须包含 domain、subcategory 和非空的 questions")

    lines = raw.split("\n")
    idx = next(i for i, l in enumerate(lines) if l.strip() == "questions:")
    body = lines[idx + 1:]
    first = next(l for l in body if l.strip())
    m = re.match(r"^(\s*)- ", first)
    if not m:
        sys.exit("questions 下第一项必须以 '- ' 开头")
    shift = 2 - len(m.group(1))          # 正式文件统一用 2 个空格缩进列表项
    fixed = []
    for l in body:
        if not l.strip():
            fixed.append("")
        elif shift >= 0:
            fixed.append(" " * shift + l)
        else:
            if len(l) - len(l.lstrip(" ")) < -shift:
                sys.exit(f"缩进不一致，无法自动调整：{l!r}")
            fixed.append(l[-shift:])
    text = "\n".join(fixed).strip("\n") + "\n"

    target = ROOT / "questions" / dom / f"{sub}.yaml"
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(f"domain: {dom}\nsubcategory: {sub}\nquestions:\n", encoding="utf-8", newline="\n")
    existing = yaml.safe_load(target.read_text(encoding="utf-8")) or {}
    have = {q.get("id") for q in (existing.get("questions") or [])}
    dup = [q.get("id") for q in qs if q.get("id") in have]
    if dup:
        sys.exit(f"这些 ID 已存在于 {target.name}：{dup}")
    old = target.read_text(encoding="utf-8").rstrip("\n") + "\n"
    new = old + "\n" + text
    try:
        merged = yaml.safe_load(new)
        assert len(merged["questions"]) == len(have) + len(qs)
    except Exception as e:  # noqa: BLE001
        sys.exit(f"合并后的文件无法解析，未写入：{e}")
    target.write_text(new, encoding="utf-8", newline="\n")
    print(f"已追加 {len(qs)} 题到 {target.relative_to(ROOT).as_posix()}（现共 {len(merged['questions'])} 题）")
    if "--keep" not in sys.argv:
        src.unlink()


if __name__ == "__main__":
    main()
