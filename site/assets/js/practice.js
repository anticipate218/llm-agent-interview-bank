// 练习会话：顺序 / 随机刷题、即时反馈、连对、滑动翻题、键盘快捷键、练习总结
import { loadIndex, getQuestion, prefetch, filterIds, loadSearch } from "./data.js";
import { ensureRenderer } from "./render.js";
import { mountQuestion } from "./question.js";
import { store } from "./store.js";
import { icon } from "./icons.js";
import { esc, rng, shuffle, hashCode, fmtDuration, buildHash } from "./util.js";
import { toast, milestone, celebrate, sound, countUp, confirmDialog } from "./effects.js";
import { openSettings } from "./settings.js";

const MILESTONES = new Set([5, 10, 20, 30, 50, 100]);

export function resolveSession(idx, p) {
  let ids = [], title = "全部题目", back = "#/bank";
  if (p.q) { ids = idx.meta[p.q] ? [p.q] : []; title = p.q; back = p.from || "#/bank"; }
  else if (p.ids) { ids = p.ids.split(",").filter((id) => idx.meta[id]); title = p.title || "自选练习"; back = p.from || "#/"; }
  else if (p.list === "wrong") { ids = store.wrong.filter((id) => idx.meta[id]); title = "错题重练"; back = "#/wrong"; }
  else if (p.list === "fav") { ids = store.fav.filter((id) => idx.meta[id]); title = "收藏练习"; back = "#/fav"; }
  else if (p.sub && idx.bySub[p.sub]) { ids = idx.idsBySub[p.sub].slice(); title = idx.bySub[p.sub].name; back = `#/d/${p.sub.split("-")[0]}`; }
  else if (p.domain && idx.byDomain[p.domain]) { ids = filterIds(idx, { domains: [p.domain] }); title = idx.byDomain[p.domain].name; back = `#/d/${p.domain}`; }
  else if (p.track) {
    const tr = idx.tracks.find((x) => x.id === p.track);
    if (tr) { ids = filterIds(idx, tr.filter); title = tr.name; back = "#/tracks"; }
  } else { ids = idx.allIds.slice(); }
  if (p.types) { const s = new Set(p.types.split(",")); ids = ids.filter((id) => s.has(idx.meta[id].type)); }
  if (p.diff) { const s = new Set(p.diff.split(",").map(Number)); ids = ids.filter((id) => s.has(idx.meta[id].diff)); }
  if (p.only === "new") ids = ids.filter((id) => store.status(id) === "new");
  if (p.only === "bad") ids = ids.filter((id) => store.status(id) === "bad");
  if (p.order === "rand") ids = shuffle(ids, rng(+p.seed || Date.now()));
  if (p.limit) ids = ids.slice(0, +p.limit);
  return { ids, title, back };
}

function sessionKey(p) {
  const q = { ...p };
  delete q.fresh;
  delete q.i;
  const s = Object.keys(q).sort().map((k) => `${k}=${q[k]}`).join("&");
  return "s" + hashCode(s).toString(36);
}

export async function practiceView(root, params) {
  root.innerHTML = `<div class="container narrow"><div class="skeleton" style="height:42px;margin-bottom:16px"></div><div class="skeleton" style="height:360px"></div></div>`;
  const [idx] = await Promise.all([loadIndex(), ensureRenderer()]);
  const key = sessionKey(params);
  let sess = params.fresh ? null : store.session(key);
  let title, back;
  if (sess && sess.ids && sess.ids.length) {
    ({ title, back } = sess);
  } else {
    const r = resolveSession(idx, params);
    if (!r.ids.length) {
      root.innerHTML = `<div class="container narrow"><div class="card empty">${icon("book")}<h3>没有符合条件的题目</h3>
        <p class="muted">${params.list === "wrong" ? "错题本是空的，继续保持！" : params.only === "new" ? "这一组的题都做过了，可以换个模式复习。" : "换个筛选条件试试。"}</p>
        <a class="btn primary" href="${r.back}">返回</a></div></div>`;
      return;
    }
    sess = { ids: r.ids, i: 0, res: {}, ans: {}, t0: Date.now(), title: r.title, back: r.back };
    title = r.title;
    back = r.back;
    if (params.fresh) history.replaceState(null, "", buildHash("/practice", { ...params, fresh: undefined }));
  }
  const n = sess.ids.length;
  let streak = 0;
  let ctrl = null;
  let busy = false;
  const persist = () => {
    sess.ts = Date.now();
    store.saveSession(key, sess);
    store.setLast({ hash: buildHash("/practice", { ...params, fresh: undefined }), title, i: sess.i, n, ts: Date.now() });
  };

  document.body.classList.add("in-session");
  root.innerHTML = `<div class="container narrow">
    <div class="session-top">
      <div class="row1">
        <a class="icon-btn" href="${esc(back)}" title="返回" aria-label="返回">${icon("left")}</a>
        <div style="min-width:0;flex:1"><div class="session-title">${esc(title)}</div>
          <div class="session-sub"><span class="score-pill"><span class="ok">✓ <b class="nok">0</b></span><span class="bad">✗ <b class="nbad">0</b></span></span></div></div>
        <span class="streak hidden">${icon("flame")}<span class="sn">0</span></span>
        <span class="session-count"><b class="ci">1</b> / ${n}</span>
        <button class="icon-btn fav" title="收藏（F）" aria-label="收藏">${icon("star")}</button>
        <button class="icon-btn gear" title="设置" aria-label="设置">${icon("gear")}</button>
      </div>
      <div class="progress"><i style="width:0%"></i></div>
    </div>
    <div class="q-stage"></div>
    <div class="q-nav">
      <button class="btn prev">${icon("left")}<span>上一题</span></button>
      <button class="btn primary next"><span>下一题</span>${icon("right")}</button>
    </div>
    <div class="kbd-hint"><span class="kbd">A</span>–<span class="kbd">E</span> 选择　<span class="kbd">Enter</span> 提交 / 下一题　<span class="kbd">←</span><span class="kbd">→</span> 翻题　<span class="kbd">F</span> 收藏　<span class="kbd">E</span> 解析</div>
  </div>`;
  const $ = (s) => root.querySelector(s);
  const stage = $(".q-stage");
  const favBtn = $(".fav");
  const nextBtn = $(".next");
  const prevBtn = $(".prev");

  function updateTop() {
    const vals = Object.values(sess.res);
    const ok = vals.filter(Boolean).length;
    $(".nok").textContent = ok;
    $(".nbad").textContent = vals.length - ok;
    $(".ci").textContent = Math.min(sess.i + 1, n);
    $(".session-top .progress > i").style.width = `${(vals.length / n) * 100}%`;
    const st = $(".streak");
    st.classList.toggle("hidden", streak < 2);
    st.querySelector(".sn").textContent = streak;
    const id = sess.ids[sess.i];
    const fav = id && store.isFav(id);
    favBtn.innerHTML = icon(fav ? "starFill" : "star");
    favBtn.classList.toggle("on", !!fav);
    prevBtn.disabled = sess.i === 0;
    const answered = id && sess.res[id] !== undefined;
    nextBtn.querySelector("span").textContent = sess.i >= n - 1 ? "完成练习" : answered ? "下一题" : "跳过";
  }

  async function show(i, dir = "next") {
    if (busy) return;
    busy = true;
    sess.i = Math.max(0, Math.min(i, n));
    if (sess.i >= n) { busy = false; persist(); summary(); return; }
    const id = sess.ids[sess.i];
    try {
      const q = await getQuestion(id);
      const answered = sess.res[id] !== undefined;
      stage.innerHTML = "";
      ctrl = mountQuestion(stage, q, {
        mode: answered ? "review" : "practice",
        saved: sess.ans[id],
        onAnswered: (r, ans) => onAnswered(id, r, ans),
      });
      ctrl.card.classList.add(dir === "prev" ? "enter-prev" : "enter-next");
      prefetch(sess.ids.slice(sess.i + 1, sess.i + 4));
      updateTop();
      persist();
      if (dir !== "init") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      stage.innerHTML = `<div class="card empty">${icon("info")}<h3>题目加载失败</h3><p class="muted">${esc(e.message)}</p><button class="btn primary retry">重试</button></div>`;
      stage.querySelector(".retry").onclick = () => show(sess.i);
    } finally {
      busy = false;
    }
  }

  function onAnswered(id, r, ans) {
    sess.res[id] = r.correct ? 1 : 0;
    sess.ans[id] = ans;
    store.record(id, r.correct);
    if (r.correct) {
      streak += 1;
      store.setBest(streak);
      if (streak >= 2) {
        const st = $(".streak");
        st.classList.remove("bump");
        void st.offsetWidth;
        st.classList.add("bump");
      }
      if (MILESTONES.has(streak)) {
        setTimeout(() => { milestone(`连对 ${streak} 题！`); celebrate(); sound("win"); }, 350);
      }
      if (store.settings.autoNext) setTimeout(() => { if (sess.ids[sess.i] === id) show(sess.i + 1); }, 1100);
    } else {
      streak = 0;
    }
    updateTop();
    persist();
  }

  async function summary() {
    document.body.classList.remove("in-session");
    store.setLast(null);
    window.scrollTo({ top: 0 });
    const vals = sess.ids.map((id) => sess.res[id]).filter((v) => v !== undefined);
    const ok = vals.filter(Boolean).length;
    const acc = vals.length ? Math.round((ok / vals.length) * 100) : 0;
    const wrongIds = sess.ids.filter((id) => sess.res[id] === 0);
    const dur = (Date.now() - (sess.t0 || Date.now())) / 1000;
    const C = 2 * Math.PI * 74;
    root.innerHTML = `<div class="container narrow"><div class="card summary">
      <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gradRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs></svg>
      <div class="big-ring"><svg viewBox="0 0 168 168"><circle class="bg" cx="84" cy="84" r="74"/><circle class="fg" cx="84" cy="84" r="74" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
        <div class="center"><b class="acc">0%</b><span>正确率</span></div></div>
      <h2>${acc >= 90 ? "太强了！" : acc >= 70 ? "表现不错！" : acc >= 50 ? "继续加油！" : "多练几遍就熟了"}</h2>
      <p class="muted">${esc(title)} · 共 ${n} 题，作答 ${vals.length} 题</p>
      <div class="kpis"><div><b class="k1">0</b><span>答对</span></div><div><b class="k2">0</b><span>答错</span></div><div><b>${fmtDuration(dur)}</b><span>用时</span></div></div>
      <div class="row" style="justify-content:center">
        ${wrongIds.length ? `<a class="btn primary" href="${buildHash("/practice", { ids: wrongIds.join(","), title: "本组错题", fresh: 1, from: location.hash })}">${icon("wrong")}<span>重做本组错题</span></a>` : ""}
        <button class="btn soft again">${icon("shuffle")}<span>再练一遍</span></button>
        <a class="btn ghost" href="${esc(back)}">返回</a>
      </div>
      ${wrongIds.length ? `<div class="section" style="text-align:left"><h3 class="section-title" style="font-size:16px;margin-bottom:10px">本组错题</h3><div class="list wl"></div></div>` : ""}
    </div></div>`;
    requestAnimationFrame(() => {
      root.querySelector(".big-ring .fg").style.strokeDashoffset = String(C * (1 - acc / 100));
      countUp(root.querySelector(".acc"), acc, { suffix: "%", duration: 1200 });
      countUp(root.querySelector(".k1"), ok);
      countUp(root.querySelector(".k2"), vals.length - ok);
    });
    if (acc >= 80 && vals.length >= 5) setTimeout(() => { celebrate(); sound("win"); }, 500);
    root.querySelector(".again").onclick = () => {
      store.dropSession(key);
      location.hash = buildHash("/practice", { ...params, fresh: 1 });
    };
    if (wrongIds.length) {
      const search = await loadSearch().catch(() => []);
      const snip = Object.fromEntries(search.map((r) => [r[0], r[1]]));
      root.querySelector(".wl").innerHTML = wrongIds.map((id) =>
        `<a href="${buildHash("/practice", { q: id, from: location.hash })}"><span class="qid">${id}</span><span class="snippet">${esc(snip[id] || "")}</span></a>`).join("");
    }
    store.dropSession(key);
  }

  // ---------- 交互 ----------
  nextBtn.addEventListener("click", () => show(sess.i + 1, "next"));
  prevBtn.addEventListener("click", () => show(sess.i - 1, "prev"));
  favBtn.addEventListener("click", () => {
    const id = sess.ids[sess.i];
    if (!id) return;
    const on = store.toggleFav(id);
    toast(on ? "已收藏" : "已取消收藏", on ? "starFill" : "star", 1200);
    updateTop();
  });
  $(".gear").addEventListener("click", () => openSettings());

  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (document.querySelector(".modal-mask")) return;
    const k = e.key;
    if (k === "ArrowRight") { e.preventDefault(); show(sess.i + 1, "next"); }
    else if (k === "ArrowLeft") { e.preventDefault(); show(sess.i - 1, "prev"); }
    else if (k === "Enter") {
      e.preventDefault();
      if (!(ctrl && ctrl.primary())) show(sess.i + 1, "next");
    } else if (k === "f" || k === "F") favBtn.click();
    else if (k === "e" && ctrl && ctrl.done) {
      const d = stage.querySelector(".explain");
      if (d) d.open = !d.open;
    } else if (/^[a-eA-E1-5]$/.test(k) && ctrl) {
      if (ctrl.pick(k)) e.preventDefault();
    }
  };
  document.addEventListener("keydown", onKey);

  // 手机左右滑动翻题
  let sx = 0, sy = 0, st = 0, track = false;
  const onStart = (e) => {
    if (e.touches.length !== 1) return;
    track = !e.target.closest("pre, .katex-display, table, input, textarea, .options, .judge-options");
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
  };
  const onEnd = (e) => {
    if (!track) return;
    track = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Date.now() - st < 650 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      if (dx < 0) show(sess.i + 1, "next"); else if (sess.i > 0) show(sess.i - 1, "prev");
    }
  };
  stage.addEventListener("touchstart", onStart, { passive: true });
  stage.addEventListener("touchend", onEnd, { passive: true });

  await show(sess.i, "init");

  return () => {
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("in-session");
  };
}

// 开始一组练习前的确认：已有进度时询问继续还是重新开始
export async function startPractice(params) {
  const key = sessionKey(params);
  const old = store.session(key);
  if (old && old.ids && old.i > 0 && old.i < old.ids.length) {
    const cont = await confirmDialog({
      title: "继续上次的进度？", body: `上次做到第 ${old.i + 1} / ${old.ids.length} 题。`, ok: "继续", cancel: "重新开始",
    });
    location.hash = buildHash("/practice", cont ? params : { ...params, fresh: 1 });
  } else {
    location.hash = buildHash("/practice", { ...params, fresh: 1 });
  }
}
