// 模拟考试：按岗位预设或自定义组卷、倒计时、答题卡、交卷判分、主观题自评、成绩与回顾
import { loadIndex, getMany } from "./data.js";
import { ensureRenderer } from "./render.js";
import { mountQuestion, gradeAnswer, isSelfGraded, TYPE_NAME } from "./question.js";
import { store } from "./store.js";
import { icon } from "./icons.js";
import { esc, rng, shuffle, fmtDuration, buildHash, rubricPoints } from "./util.js";
import { toast, confirmDialog, celebrate, sound, countUp } from "./effects.js";

const TYPE_ORDER = ["single", "multiple", "judge", "fill", "calc", "code_output", "code_fill", "code_debug", "coding", "short", "scenario", "design"];
const CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

function pick(pool, n, rand, ratio = [0.3, 0.5, 0.2]) {
  const byDiff = { 1: [], 2: [], 3: [] };
  pool.forEach((m) => (byDiff[m.diff] || byDiff[2]).push(m));
  const want = { 1: Math.round(n * ratio[0]), 3: Math.round(n * ratio[2]) };
  want[2] = n - want[1] - want[3];
  const chosen = [];
  for (const d of [1, 2, 3]) {
    const bySub = new Map();
    for (const m of shuffle(byDiff[d], rand)) {
      if (!bySub.has(m.sub)) bySub.set(m.sub, []);
      bySub.get(m.sub).push(m);
    }
    const subs = shuffle([...bySub.keys()], rand);
    let cnt = 0;
    while (cnt < want[d] && subs.some((s) => bySub.get(s).length)) {
      for (const s of subs) {
        const arr = bySub.get(s);
        if (arr.length && cnt < want[d]) { chosen.push(arr.pop()); cnt++; }
      }
    }
  }
  const got = new Set(chosen.map((m) => m.id));
  chosen.push(...shuffle(pool.filter((m) => !got.has(m.id)), rand).slice(0, Math.max(0, n - chosen.length)));
  return chosen.slice(0, n);
}

export function buildExam(idx, cfg, seed) {
  const rand = rng(seed);
  const doms = cfg.domains && cfg.domains.length ? new Set(cfg.domains) : null;
  const metas = Object.values(idx.meta).filter((m) => !doms || doms.has(m.dom));
  const sections = [];
  for (const t of TYPE_ORDER) {
    const k = cfg.mix[t] || 0;
    if (!k) continue;
    const got = pick(metas.filter((m) => m.type === t), k, rand);
    if (got.length) sections.push({ type: t, ids: got.map((m) => m.id) });
  }
  return sections;
}

function fullScore(idx, mix) {
  return Object.entries(mix).reduce((s, [t, k]) => s + (idx.score[t] || 0) * k, 0);
}

// 单题得分：多选少选得一半、填空按空给分、主观题按自评
export function scoreOf(q, ans, pts) {
  const t = q.type;
  if (isSelfGraded(t)) {
    if (!ans || ans.self === undefined) return 0;
    if (ans.rubric && ans.rubric.some(Boolean) && typeof ans.score === "number") return Math.round(pts * ans.score * 2) / 2;
    return ans.self ? pts : 0;
  }
  const r = gradeAnswer(q, ans);
  if (r.correct) return pts;
  if (t === "multiple" && Array.isArray(ans) && ans.length && ans.every((k) => q.answer.includes(k))) return pts / 2;
  if ((t === "fill" || t === "code_fill") && r.per) return Math.round((pts * r.per.filter(Boolean).length / r.per.length) * 2) / 2;
  return 0;
}

// ---------------- 选卷页 ----------------
export async function examHome(root) {
  const idx = await loadIndex();
  const presets = Object.entries(idx.presets);
  const hist = store.exams;
  root.innerHTML = `<div class="container">
    <div class="page-head"><div class="domain-icon" style="--c:#8b5cf6">${icon("exam")}</div>
      <div><h1>模拟考试</h1><p class="section-desc">按岗位预设一键组卷，限时作答，交卷后自动判分；主观题对照评分要点自评。</p></div></div>
    <div class="notice">${icon("info")}<div>计分规则：单选、判断、代码输出答对得分；多选全对得满分、少选得一半、错选不得分；填空按空给分；简答、场景、设计、计算与编程题交卷后对照参考答案和评分要点自评。</div></div>
    <div class="grid grid-3 section">${presets.map(([k, p]) => {
      const n = Object.values(p.mix).reduce((a, b) => a + b, 0);
      const doms = p.domains ? p.domains.map((d) => idx.byDomain[d]?.name).filter(Boolean).join("、") : "全部大类";
      return `<div class="card preset-card"><h3>${esc(p.title.replace(" · 模拟笔试卷", "").replace("模拟卷", ""))}</h3>
        <div class="row small muted"><span>${icon("clock").replace("<svg", '<svg style="width:15px;height:15px;display:inline"')} ${p.minutes} 分钟</span><span>${n} 题</span><span>满分 ${fullScore(idx, p.mix)}</span></div>
        <div class="small muted">范围：${esc(doms)}</div>
        <div class="mix">${Object.entries(p.mix).map(([t, c]) => `<span class="chip">${TYPE_NAME[t]} ${c}</span>`).join("")}</div>
        <a class="btn primary" href="${buildHash("/exam/run", { preset: k, seed: Math.floor(Math.random() * 1e6) })}">${icon("play")}<span>开始考试</span></a></div>`;
    }).join("")}</div>
    <div class="section card pad">
      <div class="section-head"><div><h2 class="section-title">自定义组卷</h2><p class="section-desc">选择范围与各题型数量</p></div></div>
      <div class="toggle-group doms">${idx.domains.map((d) => `<button class="chip btnlike active" data-d="${d.code}">${esc(d.name)}</button>`).join("")}</div>
      <div class="grid grid-4" style="margin-top:14px">${TYPE_ORDER.map((t) => `<label class="small muted">${TYPE_NAME[t]}
        <input class="answer-box" style="min-height:0;height:42px;margin-top:4px" type="number" min="0" max="50" value="${{ single: 10, multiple: 5, judge: 5, fill: 3, short: 1 }[t] || 0}" data-t="${t}"></label>`).join("")}</div>
      <div class="row" style="margin-top:14px"><label class="small muted">时长（分钟）<input class="answer-box mins" style="min-height:0;height:42px;width:110px;margin-top:4px" type="number" min="5" max="300" value="45"></label>
        <span class="spacer"></span><button class="btn primary custom-go">${icon("play")}<span>生成试卷</span></button></div>
    </div>
    <div class="section"><div class="section-head"><h2 class="section-title">考试记录</h2></div>
      ${hist.length ? `<div class="list">${hist.slice(0, 20).map((e) => `<div class="item"><span class="qid">${new Date(e.ts).toLocaleDateString()}</span>
        <span class="snippet">${esc(e.title)}</span><span class="spacer"></span><b>${e.score}</b><span class="faint">/ ${e.full}</span></div>`).join("")}</div>`
        : `<div class="card empty" style="padding:28px">${icon("trophy")}<div>还没有考试记录，选一套试卷开始吧</div></div>`}
    </div></div>`;
  root.querySelectorAll(".doms [data-d]").forEach((b) => b.addEventListener("click", () => b.classList.toggle("active")));
  root.querySelector(".custom-go").addEventListener("click", () => {
    const domains = [...root.querySelectorAll(".doms .active")].map((b) => b.dataset.d);
    const mix = {};
    root.querySelectorAll("[data-t]").forEach((i) => { const v = Math.max(0, Math.min(50, parseInt(i.value || "0", 10))); if (v) mix[i.dataset.t] = v; });
    if (!domains.length) return toast("请至少选择一个大类");
    if (!Object.keys(mix).length) return toast("请至少设置一种题型的数量");
    const minutes = Math.max(5, Math.min(300, parseInt(root.querySelector(".mins").value || "45", 10)));
    location.hash = buildHash("/exam/run", { custom: 1, domains: domains.join(","), mix: Object.entries(mix).map(([t, v]) => `${t}:${v}`).join(","), minutes, seed: Math.floor(Math.random() * 1e6) });
  });
}

// ---------------- 考试 ----------------
export async function examRun(root, params) {
  root.innerHTML = `<div class="container narrow"><div class="skeleton" style="height:42px;margin-bottom:16px"></div><div class="skeleton" style="height:360px"></div></div>`;
  const [idx] = await Promise.all([loadIndex(), ensureRenderer()]);
  let cfg;
  if (params.preset && idx.presets[params.preset]) cfg = { ...idx.presets[params.preset] };
  else if (params.custom) {
    const mix = Object.fromEntries((params.mix || "").split(",").filter(Boolean).map((x) => { const [t, v] = x.split(":"); return [t, +v]; }));
    cfg = { title: "自定义模拟卷", minutes: +params.minutes || 45, domains: (params.domains || "").split(",").filter(Boolean), mix };
  } else { location.hash = "#/exam"; return; }
  const seed = +params.seed || 1;
  const key = `exam-${params.preset || "custom"}-${seed}-${params.mix || ""}-${params.domains || ""}`;
  let st = store.session(key);
  if (!st) {
    const sections = buildExam(idx, cfg, seed);
    st = { sections, ans: {}, flags: {}, i: 0, t0: Date.now(), deadline: Date.now() + cfg.minutes * 60000, phase: "answer", ts: Date.now() };
  }
  const flat = st.sections.flatMap((s) => s.ids.map((id) => ({ id, type: s.type })));
  if (!flat.length) { root.innerHTML = `<div class="container narrow"><div class="card empty">没有可用的题目</div></div>`; return; }
  root.innerHTML = `<div class="container narrow"><div class="card empty" style="padding:40px">${icon("exam")}<div>正在准备试卷（${flat.length} 题）…</div></div></div>`;
  const qs = await getMany(flat.map((x) => x.id));
  const qmap = Object.fromEntries(qs.map((q) => [q.id, q]));
  const full = st.sections.reduce((s, sec) => s + (idx.score[sec.type] || 0) * sec.ids.length, 0);
  const save = () => { st.ts = Date.now(); store.saveSession(key, st); };
  save();

  let timer = null;
  let ctrl = null;
  const cleanup = () => { clearInterval(timer); document.removeEventListener("keydown", onKey); document.body.classList.remove("in-session"); };
  const onKey = (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || document.querySelector(".modal-mask")) return;
    if (e.key === "ArrowRight") go(st.i + 1);
    else if (e.key === "ArrowLeft") go(st.i - 1);
    else if (/^[a-eA-E1-5]$/.test(e.key) && ctrl && st.phase === "answer") ctrl.pick(e.key);
  };

  function secTitle(i) {
    let k = 0;
    for (let s = 0; s < st.sections.length; s++) {
      const sec = st.sections[s];
      if (i < k + sec.ids.length) return `${CN[s]}、${TYPE_NAME[sec.type]}（每题 ${idx.score[sec.type]} 分）`;
      k += sec.ids.length;
    }
    return "";
  }

  function answered(id) {
    const a = st.ans[id];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.some((v) => String(v || "").trim());
    if (typeof a === "object") return !!String(a.text || "").trim();
    return true;
  }

  // ---------- 作答阶段 ----------
  function renderAnswer() {
    document.body.classList.add("in-session");
    root.innerHTML = `<div class="container narrow">
      <div class="exam-bar"><a class="icon-btn" href="#/exam" title="退出（进度会保留）">${icon("left")}</a>
        <div style="min-width:0;flex:1"><div class="session-title">${esc(cfg.title)}</div><div class="small faint sec-title"></div></div>
        <span class="timer">${icon("clock")}<span class="tv">--:--</span></span>
        <button class="icon-btn sheet-btn" title="答题卡">${icon("grid")}</button>
        <button class="btn sm primary submit">交卷</button></div>
      <div class="card pad sheet" style="display:none;margin-bottom:14px"><div class="row small muted" style="margin-bottom:10px"><span>答题卡</span><span class="spacer"></span><span class="ans-count"></span></div><div class="navgrid"></div></div>
      <div class="q-stage"></div>
      <div class="q-nav"><button class="btn prev">${icon("left")}<span>上一题</span></button>
        <button class="btn flag-btn">${icon("flag")}<span>标记</span></button>
        <button class="btn primary next"><span>下一题</span>${icon("right")}</button></div></div>`;
    root.querySelector(".sheet-btn").onclick = () => { const s = root.querySelector(".sheet"); s.style.display = s.style.display === "none" ? "" : "none"; };
    root.querySelector(".prev").onclick = () => go(st.i - 1);
    root.querySelector(".next").onclick = () => (st.i >= flat.length - 1 ? submitExam() : go(st.i + 1));
    root.querySelector(".flag-btn").onclick = () => { const id = flat[st.i].id; st.flags[id] = !st.flags[id]; save(); paintSheet(); };
    root.querySelector(".submit").onclick = () => submitExam();
    const tick = () => {
      const left = (st.deadline - Date.now()) / 1000;
      const tv = root.querySelector(".tv");
      if (!tv) return;
      tv.textContent = fmtDuration(left);
      root.querySelector(".timer").classList.toggle("low", left <= 300);
      if (left <= 0) { clearInterval(timer); toast("时间到，已自动交卷", "clock", 2600); submitExam(true); }
    };
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    tick();
    go(st.i, true);
  }

  function paintSheet() {
    const grid = root.querySelector(".navgrid");
    if (!grid) return;
    grid.innerHTML = flat.map((x, i) => `<button class="${answered(x.id) ? "done" : ""} ${i === st.i ? "cur" : ""} ${st.flags[x.id] ? "flag" : ""}" data-i="${i}">${i + 1}</button>`).join("");
    grid.querySelectorAll("button").forEach((b) => (b.onclick = () => go(+b.dataset.i)));
    const done = flat.filter((x) => answered(x.id)).length;
    root.querySelector(".ans-count").textContent = `已答 ${done} / ${flat.length}`;
    const fb = root.querySelector(".flag-btn span");
    if (fb) fb.textContent = st.flags[flat[st.i].id] ? "取消标记" : "标记";
  }

  function go(i, first = false) {
    if (i < 0 || i >= flat.length) return;
    const dir = i < st.i ? "prev" : "next";
    st.i = i;
    save();
    const { id } = flat[i];
    const stage = root.querySelector(".q-stage");
    stage.innerHTML = "";
    ctrl = mountQuestion(stage, qmap[id], {
      mode: "exam", index: i, total: flat.length, saved: st.ans[id],
      onChange: (a) => { st.ans[id] = a; save(); paintSheet(); },
    });
    if (!first) ctrl.card.classList.add(dir === "prev" ? "enter-prev" : "enter-next");
    root.querySelector(".sec-title").textContent = secTitle(i);
    root.querySelector(".prev").disabled = i === 0;
    root.querySelector(".next span").textContent = i >= flat.length - 1 ? "交卷" : "下一题";
    paintSheet();
    if (!first) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitExam(force = false) {
    if (!force) {
      const left = flat.filter((x) => !answered(x.id)).length;
      const ok = await confirmDialog({ title: "确认交卷？", body: left ? `还有 <b>${left}</b> 题未作答。` : "全部题目都已作答。", ok: "交卷", cancel: "继续作答" });
      if (!ok) return;
    }
    clearInterval(timer);
    st.used = Math.min(Date.now(), st.deadline) - st.t0;
    st.phase = flat.some((x) => isSelfGraded(x.type)) ? "grade" : "result";
    st.gi = 0;
    save();
    if (st.phase === "grade") renderGrade(); else renderResult(true);
  }

  // ---------- 主观题自评 ----------
  function renderGrade() {
    const items = flat.filter((x) => isSelfGraded(x.type));
    if (st.gi >= items.length) { st.phase = "result"; save(); renderResult(true); return; }
    const { id } = items[st.gi];
    root.innerHTML = `<div class="container narrow">
      <div class="exam-bar"><div style="flex:1"><div class="session-title">批改主观题</div><div class="small faint">第 ${st.gi + 1} / ${items.length} 题 · 查看参考答案，对照评分要点自评</div></div>
        <button class="btn sm ghost skip">跳过自评</button></div>
      <div class="q-stage"></div><div class="q-nav"><button class="btn primary next" disabled><span>下一题</span>${icon("right")}</button></div></div>`;
    const stage = root.querySelector(".q-stage");
    const q = qmap[id];
    const c = mountQuestion(stage, q, {
      mode: "practice", saved: st.ans[id],
      onAnswered: (r, a) => { st.ans[id] = a; save(); root.querySelector(".next").disabled = false; },
    });
    c.card.classList.add("enter-next");
    const next = () => { st.gi += 1; save(); renderGrade(); };
    root.querySelector(".next").onclick = next;
    root.querySelector(".skip").onclick = () => { st.gi = items.length; save(); renderGrade(); };
  }

  // ---------- 成绩 ----------
  function renderResult(fresh) {
    document.body.classList.remove("in-session");
    let total = 0;
    const rows = st.sections.map((sec, si) => {
      const pts = idx.score[sec.type] || 0;
      let got = 0, right = 0;
      for (const id of sec.ids) {
        const s = scoreOf(qmap[id], st.ans[id], pts);
        got += s;
        if (s >= pts) right += 1;
      }
      total += got;
      return { name: `${CN[si]}、${TYPE_NAME[sec.type]}`, n: sec.ids.length, right, got, full: pts * sec.ids.length };
    });
    total = Math.round(total * 2) / 2;
    const pct = full ? Math.round((total / full) * 100) : 0;
    if (fresh && !st.recorded) {
      for (const x of flat) {
        const pts = idx.score[x.type] || 0;
        const a = st.ans[x.id];
        const attempted = a !== undefined && (!isSelfGraded(x.type) || (a && a.self !== undefined));
        if (attempted) store.record(x.id, scoreOf(qmap[x.id], a, pts) >= pts);
      }
      store.addExam({ title: cfg.title, score: total, full, ts: Date.now(), used: st.used });
      st.recorded = true;
      save();
    }
    root.innerHTML = `<div class="container narrow"><div class="card summary">
      <div class="faint small">${esc(cfg.title)} · 用时 ${fmtDuration((st.used || 0) / 1000)}</div>
      <div style="font-size:64px;font-weight:900;letter-spacing:-2px;line-height:1.1;margin-top:10px" class="grad-text"><span class="score">0</span></div>
      <div class="muted">满分 ${full} · 得分率 ${pct}%</div>
      <h2 style="margin-top:12px">${pct >= 85 ? "优秀！可以冲大厂了" : pct >= 70 ? "良好，再补补短板" : pct >= 60 ? "及格，继续努力" : "别灰心，先看解析查漏补缺"}</h2>
      <table class="score-table" style="margin-top:18px"><thead><tr><th>题型</th><th class="num">题数</th><th class="num">全对</th><th class="num">得分</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td>${r.name}</td><td class="num">${r.n}</td><td class="num">${r.right}</td><td class="num">${r.got} / ${r.full}</td></tr>`).join("")}</tbody></table>
      <div class="row" style="justify-content:center;margin-top:20px">
        <button class="btn primary review">${icon("list")}<span>逐题回顾</span></button>
        <a class="btn soft" href="${buildHash("/exam/run", { ...params, seed: Math.floor(Math.random() * 1e6) })}">${icon("shuffle")}<span>换一套</span></a>
        <a class="btn ghost" href="#/exam">返回</a></div></div>
      <div class="section card pad"><div class="section-head"><h2 class="section-title" style="font-size:16px">答题情况</h2></div><div class="navgrid result-grid"></div></div></div>`;
    countUp(root.querySelector(".score"), total, { duration: 1300, decimals: total % 1 ? 1 : 0 });
    if (fresh && pct >= 80) setTimeout(() => { celebrate(); sound("win"); }, 600);
    const grid = root.querySelector(".result-grid");
    grid.innerHTML = flat.map((x, i) => {
      const pts = idx.score[x.type] || 0;
      const s = scoreOf(qmap[x.id], st.ans[x.id], pts);
      return `<button class="${s >= pts ? "ok" : "bad"}" data-i="${i}">${i + 1}</button>`;
    }).join("");
    grid.querySelectorAll("button").forEach((b) => (b.onclick = () => renderReview(+b.dataset.i)));
    root.querySelector(".review").onclick = () => renderReview(0);
  }

  function renderReview(i) {
    const { id } = flat[i];
    root.innerHTML = `<div class="container narrow">
      <div class="exam-bar"><button class="icon-btn back">${icon("left")}</button><div style="flex:1"><div class="session-title">试卷回顾</div><div class="small faint">${secTitle(i)}</div></div></div>
      <div class="q-stage"></div>
      <div class="q-nav"><button class="btn prev">${icon("left")}<span>上一题</span></button><button class="btn primary next"><span>下一题</span>${icon("right")}</button></div></div>`;
    mountQuestion(root.querySelector(".q-stage"), qmap[id], { mode: "review", index: i, total: flat.length, saved: st.ans[id] });
    root.querySelector(".back").onclick = () => renderResult(false);
    root.querySelector(".prev").disabled = i === 0;
    root.querySelector(".prev").onclick = () => renderReview(i - 1);
    root.querySelector(".next").onclick = () => (i >= flat.length - 1 ? renderResult(false) : renderReview(i + 1));
    window.scrollTo({ top: 0 });
  }

  document.addEventListener("keydown", onKey);
  if (st.phase === "answer") {
    if (Date.now() >= st.deadline) { st.phase = flat.some((x) => isSelfGraded(x.type)) ? "grade" : "result"; st.used = st.deadline - st.t0; save(); }
  }
  if (st.phase === "answer") renderAnswer();
  else if (st.phase === "grade") renderGrade();
  else renderResult(!st.recorded);
  return cleanup;
}

export { rubricPoints };
