// 页面：首页、题库、大类、备考路线、错题本 / 收藏、我的、搜索、关于
import { loadIndex, filterIds, loadSearch } from "./data.js";
import { store } from "./store.js";
import { icon, LOGO } from "./icons.js";
import { esc, debounce, dayKey, buildHash } from "./util.js";
import { countUp, toast, confirmDialog } from "./effects.js";
import { startPractice } from "./practice.js";
import { TYPE_NAME } from "./question.js";
import { settingsHTML, bindSettings } from "./settings.js";

export const REPO_URL = "https://github.com/anticipate218/llm-agent-interview-bank";

const HONEST_NOTE = "题目均为原创，考点参考了字节跳动、阿里巴巴、腾讯、华为、美团等公司大模型与 Agent 岗位的公开面经整理，<b>不是任何公司的真题</b>。";

function ring(pct, color, size = 54) {
  const r = 22, C = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 54 54" style="width:${size}px;height:${size}px"><circle class="bg" cx="27" cy="27" r="${r}"/>
    <circle class="fg" cx="27" cy="27" r="${r}" stroke="${color}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>`;
}

function domainCard(idx, d) {
  const ids = filterIds(idx, { domains: [d.code] });
  const s = store.summary(ids);
  const pct = ids.length ? s.answered / ids.length : 0;
  return `<a class="domain-card" href="#/d/${d.code}" style="--c:${d.color}">
    <div class="top"><div class="domain-icon">${icon(d.icon)}</div><div><div class="code">${d.code}</div><h3>${esc(d.name)}</h3></div></div>
    <p>${esc(d.description)}</p>
    <div class="foot"><span>${d.subs.length} 个小类 · ${d.count} 题</span></div>
    <div class="foot"><div class="progress"><i style="width:${(pct * 100).toFixed(1)}%"></i></div><span>${Math.round(pct * 100)}%</span></div></a>`;
}

function trackCard(idx, t) {
  const n = filterIds(idx, t.filter).length;
  return `<a class="track-card" href="#/tracks?t=${t.id}"><div class="ico">${icon(t.icon)}</div>
    <div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="meta">${n} 题</div></div></a>`;
}

// ---------------- 首页 ----------------
export async function homeView(root) {
  const idx = await loadIndex();
  const sum = store.summary();
  const acc = sum.answered ? Math.round((sum.correct / sum.answered) * 100) : 0;
  const last = store.last;
  root.innerHTML = `<div class="container">
    <section class="hero">
      <div class="hero-bg"><div class="hero-blob a"></div><div class="hero-blob b"></div><div class="hero-blob c"></div></div>
      <span class="hero-badge">${icon("spark")} 开源免费 · 每题都有讲解 · 代码题全部实测</span>
      <h1><span class="grad-text">大模型 &amp; Agent</span><br>面试题库</h1>
      <p class="lead">覆盖机器学习基础、Transformer、预训练与对齐、推理部署、RAG、Agent 与工程化。选择题即时判分，主观题对照评分要点自评，随时随地刷题备战实习与校招。</p>
      <div class="hero-cta">
        <a class="btn primary lg" href="#/bank">${icon("play")}<span>开始刷题</span></a>
        <button class="btn soft lg intern">${icon("spark")}<span>实习必刷</span></button>
        <a class="btn lg" href="#/exam">${icon("exam")}<span>模拟考试</span></a>
      </div>
      <div class="stats-strip">
        <div class="stat"><b data-n="${idx.total}">0</b><span>道题目</span></div>
        <div class="stat"><b data-n="${idx.points}">0</b><span>个考点</span></div>
        <div class="stat"><b data-n="${idx.domains.reduce((a, d) => a + d.subs.length, 0)}">0</b><span>个小类</span></div>
        <div class="stat"><b data-n="12">0</b><span>种题型</span></div>
        <div class="stat"><b data-n="${idx.domains.length}">0</b><span>个大类</span></div>
      </div>
    </section>
    ${last ? `<a class="card continue-card" href="${esc(last.hash)}"><div class="ico">${icon("play")}</div>
      <div style="flex:1;min-width:0"><div style="font-weight:700">继续练习：${esc(last.title)}</div><div class="small muted">做到第 ${Math.min(last.i + 1, last.n)} / ${last.n} 题</div></div>${icon("right")}</a>` : ""}
    <section class="section"><div class="today">
      <div class="cell"><b>${store.today()}</b><span>今日做题</span></div>
      <div class="cell"><b>${sum.answered}</b><span>累计做过</span></div>
      <div class="cell"><b>${acc}%</b><span>正确率</span></div>
      <div class="cell"><b>${store.streakDays()}</b><span>连续打卡（天）</span></div>
    </div></section>
    <section class="section"><div class="section-head"><div><h2 class="section-title">实习与岗位备考路线</h2><p class="section-desc">按岗位方向与考频组织，从高频基础题开始</p></div><a class="btn sm ghost" href="#/tracks">全部路线 ${icon("right")}</a></div>
      <div class="grid grid-3">${idx.tracks.slice(0, 3).map((t) => trackCard(idx, t)).join("")}</div></section>
    <section class="section"><div class="section-head"><div><h2 class="section-title">知识领域</h2><p class="section-desc">11 个大类、70 个小类，点击进入按小类练习</p></div></div>
      <div class="grid grid-3">${idx.domains.map((d) => domainCard(idx, d)).join("")}</div></section>
    <div class="section notice">${icon("info")}<div>${HONEST_NOTE}发现错误欢迎到 <a href="${REPO_URL}/issues" target="_blank" rel="noopener">GitHub</a> 反馈。</div></div>
  </div>`;
  root.querySelectorAll(".stat b").forEach((b) => countUp(b, +b.dataset.n, { duration: 1100 }));
  root.querySelector(".intern").onclick = () => startPractice({ track: "intern", order: "rand" });
}

// ---------------- 题库（全部大类） ----------------
export async function bankView(root) {
  const idx = await loadIndex();
  root.innerHTML = `<div class="container">
    <div class="page-head"><div class="domain-icon" style="--c:#6366f1">${icon("book")}</div>
      <div><h1>题库</h1><p class="section-desc">共 ${idx.total} 题。选择一个大类，再按小类练习；也可以全库随机刷题。</p></div></div>
    <div class="row"><button class="btn primary rand">${icon("shuffle")}<span>全库随机 20 题</span></button>
      <button class="btn soft newq">${icon("spark")}<span>只做没做过的题</span></button>
      <a class="btn ghost" href="#/search">${icon("search")}<span>搜索题目</span></a></div>
    <div class="grid grid-3 section">${idx.domains.map((d) => domainCard(idx, d)).join("")}</div></div>`;
  root.querySelector(".rand").onclick = () => startPractice({ all: 1, order: "rand", limit: 20 });
  root.querySelector(".newq").onclick = () => startPractice({ all: 1, order: "rand", only: "new", limit: 30 });
}

// ---------------- 大类页 ----------------
const filters = { types: new Set(), diff: new Set(), order: "seq", only: "" };

export async function domainView(root, code) {
  const idx = await loadIndex();
  const d = idx.byDomain[code];
  if (!d) { location.hash = "#/bank"; return; }
  const types = [...new Set(filterIds(idx, { domains: [code] }).map((id) => idx.meta[id].type))];
  const params = (extra) => ({
    ...extra,
    types: filters.types.size ? [...filters.types].join(",") : undefined,
    diff: filters.diff.size ? [...filters.diff].join(",") : undefined,
    order: filters.order === "rand" ? "rand" : undefined,
    only: filters.only || undefined,
  });
  const chip = (group, val, label, on) => `<button class="chip btnlike ${on ? "active" : ""}" data-g="${group}" data-v="${val}">${label}</button>`;
  root.innerHTML = `<div class="container narrow">
    <a class="back-link" href="#/bank">${icon("left")}题库</a>
    <div class="page-head" style="--c:${d.color}"><div class="domain-icon">${icon(d.icon)}</div>
      <div><h1>${esc(d.name)}</h1><p class="section-desc">${esc(d.description)} · ${d.count} 题</p></div></div>
    <div class="card filter-bar">
      <div class="row"><span class="label">题型</span>${types.map((t) => chip("types", t, TYPE_NAME[t], filters.types.has(t))).join("")}</div>
      <div class="row" style="margin-top:8px"><span class="label">难度</span>${[[1, "基础"], [2, "进阶"], [3, "挑战"]].map(([v, l]) => chip("diff", v, l, filters.diff.has(String(v)))).join("")}
        <span class="label" style="margin-left:10px">顺序</span>${chip("order", "seq", "顺序", filters.order === "seq")}${chip("order", "rand", "随机", filters.order === "rand")}</div>
      <div class="row" style="margin-top:8px"><span class="label">范围</span>${chip("only", "", "全部", !filters.only)}${chip("only", "new", "只做新题", filters.only === "new")}${chip("only", "bad", "只做错过的", filters.only === "bad")}</div>
    </div>
    <button class="btn primary block all" style="margin-bottom:14px">${icon("play")}<span>练习整个大类</span></button>
    <div class="grid">${d.subs.map((s) => {
      const ids = idx.idsBySub[s.key] || [];
      const sm = store.summary(ids);
      const pct = ids.length ? sm.answered / ids.length : 0;
      return `<div class="sub-item"><div><h3>${esc(s.name)}</h3></div>
        <div class="actions"><button class="btn sm primary go" data-sub="${s.key}">${icon("play")}<span>练习</span></button></div>
        <p class="desc">${esc(s.description)}</p>
        <div class="stats"><span>${s.count} 题</span><div class="progress"><i style="width:${(pct * 100).toFixed(1)}%;background:${d.color}"></i></div>
          <span>做过 ${sm.answered}</span>${sm.answered ? `<span>正确率 ${Math.round((sm.correct / sm.answered) * 100)}%</span>` : ""}</div></div>`;
    }).join("")}</div></div>`;
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
    const g = b.dataset.g, v = b.dataset.v;
    if (g === "types" || g === "diff") { filters[g].has(v) ? filters[g].delete(v) : filters[g].add(v); b.classList.toggle("active"); }
    else { filters[g] = v; root.querySelectorAll(`[data-g="${g}"]`).forEach((x) => x.classList.toggle("active", x.dataset.v === v)); }
  }));
  root.querySelector(".all").onclick = () => startPractice(params({ domain: code }));
  root.querySelectorAll(".go").forEach((b) => (b.onclick = () => startPractice(params({ sub: b.dataset.sub }))));
}

// ---------------- 备考路线 ----------------
export async function tracksView(root, p = {}) {
  const idx = await loadIndex();
  const sel = p.t && idx.tracks.find((t) => t.id === p.t);
  if (sel) {
    const ids = filterIds(idx, sel.filter);
    const sm = store.summary(ids);
    const byType = {};
    ids.forEach((id) => { const t = idx.meta[id].type; byType[t] = (byType[t] || 0) + 1; });
    root.innerHTML = `<div class="container narrow"><a class="back-link" href="#/tracks">${icon("left")}全部路线</a>
      <div class="page-head"><div class="domain-icon" style="--c:#8b5cf6">${icon(sel.icon)}</div><div><h1>${esc(sel.name)}</h1><p class="section-desc">${esc(sel.desc)}</p></div></div>
      <div class="card pad"><div class="row"><b style="font-size:28px">${ids.length}</b><span class="muted">题</span><span class="spacer"></span><span class="muted">做过 ${sm.answered} · 正确率 ${sm.answered ? Math.round((sm.correct / sm.answered) * 100) : 0}%</span></div>
        <div class="progress" style="margin:12px 0 16px"><i style="width:${ids.length ? (sm.answered / ids.length) * 100 : 0}%"></i></div>
        <div class="row">${Object.entries(byType).map(([t, c]) => `<span class="chip">${TYPE_NAME[t]} ${c}</span>`).join("")}</div>
        <div class="grid grid-3" style="margin-top:18px">
          <button class="btn primary" data-m="seq">${icon("list")}<span>按顺序练习</span></button>
          <button class="btn soft" data-m="rand">${icon("shuffle")}<span>随机 20 题</span></button>
          <button class="btn" data-m="new">${icon("spark")}<span>只做新题</span></button></div></div>
      <div class="section notice">${icon("info")}<div>${HONEST_NOTE}</div></div></div>`;
    root.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => {
      const m = b.dataset.m;
      startPractice(m === "seq" ? { track: sel.id } : m === "rand" ? { track: sel.id, order: "rand", limit: 20 } : { track: sel.id, only: "new", order: "rand" });
    }));
    return;
  }
  root.innerHTML = `<div class="container">
    <div class="page-head"><div class="domain-icon" style="--c:#8b5cf6">${icon("route")}</div>
      <div><h1>实习与岗位备考路线</h1><p class="section-desc">按岗位方向、考频与难度组织，适合不同阶段的准备</p></div></div>
    <div class="notice">${icon("info")}<div>${HONEST_NOTE}「实习必刷」选取高频必考（★★★）且难度为基础或进阶的题，适合实习与校招的第一轮准备。</div></div>
    <div class="grid grid-2 section">${idx.tracks.map((t) => trackCard(idx, t)).join("")}</div></div>`;
}

// ---------------- 错题本 / 收藏 ----------------
export async function listView(root, kind) {
  const idx = await loadIndex();
  const isWrong = kind === "wrong";
  const ids = (isWrong ? store.wrong : store.fav).filter((id) => idx.meta[id]);
  root.innerHTML = `<div class="container narrow">
    <div class="page-head"><div class="domain-icon" style="--c:${isWrong ? "#f43f5e" : "#f59e0b"}">${icon(isWrong ? "wrong" : "starFill")}</div>
      <div><h1>${isWrong ? "错题本" : "我的收藏"}</h1><p class="section-desc">${isWrong ? "答错的题会自动收进这里，答对后自动移出（可在设置中关闭）" : "做题时点击右上角的星标即可收藏"}</p></div></div>
    ${ids.length ? `<div class="row" style="margin-bottom:16px"><button class="btn primary go">${icon("play")}<span>开始练习（${ids.length} 题）</span></button>
      <button class="btn soft rand">${icon("shuffle")}<span>随机顺序</span></button><span class="spacer"></span>
      ${isWrong ? `<button class="btn ghost clear">${icon("trash")}<span>清空</span></button>` : ""}</div>
      <div class="list items"><div class="skeleton" style="height:120px"></div></div>`
    : `<div class="card empty">${icon(isWrong ? "trophy" : "star")}<h3>${isWrong ? "错题本是空的" : "还没有收藏"}</h3><p class="muted">${isWrong ? "继续保持！" : "遇到值得反复看的题，就点一下星标"}</p><a class="btn primary" href="#/bank">去刷题</a></div>`}</div>`;
  if (!ids.length) return;
  const list = isWrong ? "wrong" : "fav";
  root.querySelector(".go").onclick = () => startPractice({ list });
  root.querySelector(".rand").onclick = () => startPractice({ list, order: "rand" });
  const clr = root.querySelector(".clear");
  if (clr) clr.onclick = async () => { if (await confirmDialog({ title: "清空错题本？", body: "做题记录会保留，只是不再出现在错题本中。", ok: "清空", danger: true })) { store.clearWrong(); listView(root, kind); } };
  const search = await loadSearch().catch(() => []);
  const snip = Object.fromEntries(search.map((r) => [r[0], r[1]]));
  root.querySelector(".items").innerHTML = ids.map((id) => {
    const m = idx.meta[id];
    return `<a href="${buildHash("/practice", { q: id, from: `#/${kind}` })}"><span class="qid">${id}</span><span class="chip">${TYPE_NAME[m.type]}</span><span class="snippet">${esc(snip[id] || "")}</span></a>`;
  }).join("");
}

// ---------------- 我的（统计与设置） ----------------
export async function meView(root) {
  const idx = await loadIndex();
  const sum = store.summary();
  const acc = sum.answered ? Math.round((sum.correct / sum.answered) * 100) : 0;
  const days = store.days;
  const cells = [];
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (7 * 17 + end.getDay()));
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const n = days[dayKey(d)] || 0;
    const lv = n === 0 ? "" : n < 5 ? "l1" : n < 15 ? "l2" : n < 30 ? "l3" : "l4";
    cells.push(`<i class="${lv}" title="${dayKey(d)}：${n} 题"></i>`);
  }
  root.innerHTML = `<div class="container narrow">
    <div class="page-head"><div class="domain-icon" style="--c:#6366f1">${icon("user")}</div><div><h1>我的学习</h1><p class="section-desc">数据只保存在本机浏览器中，可导出备份</p></div></div>
    <div class="today"><div class="cell"><b>${sum.answered}</b><span>做过的题</span></div><div class="cell"><b>${acc}%</b><span>正确率</span></div>
      <div class="cell"><b>${store.streakDays()}</b><span>连续打卡（天）</span></div><div class="cell"><b>${store.best}</b><span>最佳连对</span></div></div>
    <div class="section card pad"><div class="section-head"><h2 class="section-title" style="font-size:16px">近 18 周做题热力图</h2><span class="small faint">今日 ${store.today()} 题</span></div><div class="heatmap">${cells.join("")}</div></div>
    <div class="section card pad"><div class="section-head"><h2 class="section-title" style="font-size:16px">各领域进度与正确率</h2></div>
      ${idx.domains.map((d) => {
        const ids = filterIds(idx, { domains: [d.code] });
        const s = store.summary(ids);
        return `<div class="bar-row"><a href="#/d/${d.code}">${esc(d.name)}</a><div class="progress"><i style="width:${(s.answered / ids.length) * 100}%;background:${d.color}"></i></div>
          <span class="num">${s.answered ? Math.round((s.correct / s.answered) * 100) + "%" : "—"}</span></div>`;
      }).join("")}<div class="small faint" style="margin-top:6px">进度条为做过的比例，右侧为正确率（以每题最近一次作答为准）</div></div>
    <div class="section grid grid-3">
      <a class="btn" href="#/wrong">${icon("wrong")}<span>错题本（${store.wrong.length}）</span></a>
      <a class="btn" href="#/fav">${icon("starFill")}<span>收藏（${store.fav.length}）</span></a>
      <a class="btn" href="#/exam">${icon("exam")}<span>考试记录（${store.exams.length}）</span></a></div>
    <div class="section card pad"><h2 class="section-title" style="font-size:16px">设置</h2><div class="settings">${settingsHTML()}</div></div>
    <div class="section card pad"><h2 class="section-title" style="font-size:16px">数据</h2>
      <p class="small muted">换浏览器或换设备前，先导出进度，再在新设备上导入。</p>
      <div class="row"><button class="btn soft exp">${icon("download")}<span>导出进度</span></button>
        <label class="btn soft">${icon("upload")}<span>导入进度</span><input type="file" accept="application/json" class="imp" hidden></label>
        <button class="btn ghost reset">${icon("trash")}<span>清除全部记录</span></button></div></div></div>`;
  bindSettings(root.querySelector(".settings"));
  root.querySelector(".exp").onclick = () => {
    const blob = new Blob([store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `llm-agent-bank-progress-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  root.querySelector(".imp").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { store.importJSON(await f.text()); toast("导入成功", "checkPlain"); meView(root); } catch (err) { toast("导入失败：" + err.message, "info", 2600); }
  };
  root.querySelector(".reset").onclick = async () => {
    if (await confirmDialog({ title: "清除全部做题记录？", body: "错题本、收藏、考试记录与进度都会被清空，且无法恢复。", ok: "清除", danger: true })) { store.reset(); toast("已清除"); meView(root); }
  };
}

// ---------------- 搜索 ----------------
export async function searchView(root, p = {}) {
  const idx = await loadIndex();
  root.innerHTML = `<div class="container narrow">
    <div class="page-head"><div class="domain-icon" style="--c:#14b8a6">${icon("search")}</div><div><h1>搜索题目</h1><p class="section-desc">支持题号（如 LLM-ATTN-004）、关键词与考点</p></div></div>
    <div class="search-box">${icon("search")}<input type="search" placeholder="例如：KV Cache、GRPO、MCP、LoRA、RRF……" value="${esc(p.q || "")}" autofocus></div>
    <div class="section results"></div></div>`;
  const input = root.querySelector("input");
  const out = root.querySelector(".results");
  out.innerHTML = `<div class="skeleton" style="height:80px"></div>`;
  const data = await loadSearch();
  const run = () => {
    const q = input.value.trim();
    history.replaceState(null, "", buildHash("/search", { q }));
    if (!q) {
      out.innerHTML = `<div class="row">${["KV Cache", "FlashAttention", "GRPO", "DPO", "LoRA", "MCP", "RAG 切块", "ReAct", "投机解码", "提示注入"].map((k) => `<button class="chip btnlike kw">${k}</button>`).join("")}</div>`;
      out.querySelectorAll(".kw").forEach((b) => (b.onclick = () => { input.value = b.textContent; run(); }));
      return;
    }
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = [];
    for (const [id, stem, pts] of data) {
      const hay = (id + " " + stem + " " + pts).toLowerCase();
      if (terms.every((t) => hay.includes(t))) hits.push([id, stem, pts]);
      if (hits.length >= 200) break;
    }
    const mark = (s) => {
      let h = esc(s);
      for (const t of terms) h = h.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark>${m}</mark>`);
      return h;
    };
    out.innerHTML = hits.length
      ? `<div class="small muted" style="margin-bottom:10px">找到 ${hits.length >= 200 ? "200+" : hits.length} 道题</div><div class="list">${hits.map(([id, stem]) => {
          const m = idx.meta[id];
          return `<a href="${buildHash("/practice", { q: id, from: buildHash("/search", { q }) })}"><span class="qid">${id}</span><span class="chip">${TYPE_NAME[m.type]}</span><span class="snippet">${mark(stem)}</span></a>`;
        }).join("")}</div>`
      : `<div class="card empty">${icon("search")}<div>没有找到相关题目，换个关键词试试</div></div>`;
  };
  input.addEventListener("input", debounce(run, 180));
  run();
}

// ---------------- 关于 ----------------
export async function aboutView(root) {
  const idx = await loadIndex();
  root.innerHTML = `<div class="container narrow">
    <div class="page-head"><div style="width:56px;height:56px">${LOGO}</div><div><h1>关于本项目</h1><p class="section-desc">开源、免费、可离线使用的大模型与 Agent 面试题库</p></div></div>
    <div class="card pad md">
      <p>这是一个面向<strong>大模型算法、Agent 应用开发、推理与工程</strong>岗位的开源题库，共 ${idx.total} 道题，覆盖 ${idx.domains.length} 个大类、${idx.points} 个考点、12 种题型。每道题都有讲解：选择题逐项点评，主观题给出参考答案与评分要点。</p>
      <h3>题目是怎么来的</h3>
      <ul><li>考点来自对公开面经、题单与课程的调研；${HONEST_NOTE}</li>
        <li>代码题全部实际运行验证；涉及产品、协议、版本与论文数字的题对照官方资料核实，并注明出处。</li>
        <li>每道客观题都经过独立的盲答复核；选项长度、正确答案的位置与个数都做了均衡，不能靠「选最长的」之类的规律猜对。</li>
        <li>题目的编写与复核大量借助了 AI 工具，仍可能存在错误。发现问题欢迎在 GitHub 提 Issue 或 PR。</li></ul>
      <h3>怎么用</h3>
      <ul><li>按大类、小类或备考路线刷题；选择题即时判分，答错自动进入错题本。</li>
        <li>模拟考试按岗位组卷、限时作答，交卷后自动判分，主观题对照评分要点自评。</li>
        <li>做题记录只保存在本机浏览器中，可在「我的」页面导出备份。</li>
        <li>电脑上可以用键盘刷题：<span class="kbd">A</span>–<span class="kbd">E</span> 选择、<span class="kbd">Enter</span> 提交或下一题、<span class="kbd">←</span> <span class="kbd">→</span> 翻题、<span class="kbd">F</span> 收藏、<span class="kbd">E</span> 展开解析；手机上左右滑动翻题。</li></ul>
      <h3>开源协议</h3>
      <p>题目与文档采用 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" target="_blank" rel="noopener">CC BY-SA 4.0</a>，代码采用 MIT 协议。转载或改编请注明出处并以相同协议共享。</p>
    </div>
    <div class="section row"><a class="btn primary" href="${REPO_URL}" target="_blank" rel="noopener">${icon("github")}<span>GitHub 仓库</span></a>
      <a class="btn soft" href="${REPO_URL}/issues" target="_blank" rel="noopener">${icon("info")}<span>反馈问题</span></a>
      <a class="btn ghost" href="${REPO_URL}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">${icon("pen")}<span>参与贡献</span></a></div></div>`;
}
