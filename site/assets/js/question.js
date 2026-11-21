// 单道题的展示、作答与判分
//   mode = "practice"：作答后立即判分并给出反馈
//   mode = "exam"    ：只记录作答，不给反馈
//   mode = "review"  ：展示作答结果、正确答案与解析（考试交卷后回顾）
import { renderMd, renderInline, renderCode, enhance } from "./render.js";
import { icon } from "./icons.js";
import { esc, gradeBlanks, answerText, rubricPoints } from "./util.js";
import { burstFrom, ripple, sound, haptic, toast } from "./effects.js";
import { store } from "./store.js";

export const TYPE_NAME = {
  single: "单选题", multiple: "多选题", judge: "判断题", fill: "填空题", calc: "计算题",
  code_output: "代码输出题", code_fill: "代码填空题", code_debug: "代码改错题", coding: "编程题",
  short: "简答题", scenario: "场景分析题", design: "系统设计题",
};
const SELF_GRADED = new Set(["calc", "short", "scenario", "design", "coding", "code_debug"]);
const DIFF = { 1: "基础", 2: "进阶", 3: "挑战" };

export function isSelfGraded(t) { return SELF_GRADED.has(t); }

// 客观判分；主观题由自评决定
export function gradeAnswer(q, ans) {
  if (ans === undefined || ans === null) return { correct: false, empty: true };
  switch (q.type) {
    case "single": return { correct: ans === q.answer };
    case "judge": return { correct: ans === q.answer };
    case "multiple": {
      const a = [...ans].sort().join(""), k = [...q.answer].sort().join("");
      return { correct: a === k, empty: !ans.length };
    }
    case "fill":
    case "code_fill": {
      const vals = ans || [];
      const r = gradeBlanks(vals, q.answer, q.unordered);
      return { correct: r.all, per: r.per, empty: vals.every((v) => !String(v || "").trim()) };
    }
    case "code_output": {
      if (ans && ans.self !== undefined) return { correct: !!ans.self };
      const clean = (s) => String(s || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim();
      return { correct: clean(ans.text) === clean(q.answer), empty: !String(ans.text || "").trim() };
    }
    default:
      return { correct: !!(ans && ans.self), score: ans && ans.score, empty: !ans || ans.self === undefined };
  }
}

function metaHTML(q, index, total) {
  const freq = "★".repeat(q.frequency || 1) + "☆".repeat(3 - (q.frequency || 1));
  return `<div class="q-meta">
    <span class="chip primary">${TYPE_NAME[q.type] || q.type}</span>
    <span class="chip">${DIFF[q.difficulty] || ""}</span>
    <span class="chip" title="考频"><span class="stars">${freq}</span></span>
    ${index !== undefined ? `<span class="chip">第 ${index + 1}${total ? ` / ${total}` : ""} 题</span>` : ""}
    <span class="qid" title="点击复制题号">${esc(q.id)}</span>
  </div>`;
}

function optionHTML(letter, text, cls = "") {
  return `<button class="option ${cls}" data-k="${letter}" aria-pressed="false">
    <span class="letter">${letter}</span><span class="text">${renderInline(text)}</span>
    <span class="state">${icon("check")}</span></button>`;
}

function judgeHTML() {
  return `<div class="judge-options options">
    <button class="option" data-k="true" aria-pressed="false"><span class="jicon">${icon("checkPlain")}</span>正确</button>
    <button class="option" data-k="false" aria-pressed="false"><span class="jicon">${icon("xPlain")}</span>错误</button>
  </div>`;
}

function refAnswerHTML(q) {
  const parts = [];
  const t = q.type;
  if (t === "single") parts.push(`<div class="answer-line">正确答案：${esc(q.answer)}</div>`);
  else if (t === "multiple") parts.push(`<div class="answer-line">正确答案：${esc(q.answer.join("、"))}</div>`);
  else if (t === "judge") parts.push(`<div class="answer-line">正确答案：${q.answer ? "正确" : "错误"}</div>`);
  else if (t === "fill" || t === "code_fill") {
    parts.push(`<div class="answer-line">参考答案：${q.answer.map((a, i) => `第 ${i + 1} 空 ${esc(answerText(a))}`).join("；")}${q.unordered ? "（各空顺序不限）" : ""}</div>`);
  } else if (t === "code_output") {
    parts.push(`<div class="ref-block"><h4>${icon("code2")}程序输出</h4>${renderCode(String(q.answer), "plaintext")}</div>`);
  } else if (t === "coding") {
    parts.push(`<div class="ref-block"><h4>${icon("code2")}参考实现</h4>${renderCode(String(q.answer), "python")}</div>`);
  } else {
    parts.push(`<div class="ref-block"><h4>${icon("pen")}参考答案</h4><div class="md">${renderMd(String(q.answer))}</div></div>`);
  }
  if (t === "code_debug" && q.fixed_code) {
    parts.push(`<div class="ref-block"><h4>${icon("code2")}修正后的代码</h4>${renderCode(q.fixed_code, "python")}</div>`);
  }
  return parts.join("");
}

function explainHTML(q, open) {
  const test = q.test && ["coding", "code_debug", "code_fill"].includes(q.type)
    ? `<details class="ref-block"><summary class="small muted" style="cursor:pointer">查看测试用例</summary>${renderCode(q.test, "python")}</details>` : "";
  const pts = (q.points || []).map((p) => `<span class="chip">${esc(p)}</span>`).join(" ");
  const src = q.source ? `<div class="meta-line">出处：${renderInline(q.source)}</div>` : "";
  return `<details class="explain" ${open ? "open" : ""}>
    <summary>${icon("bulb")}答案与解析${icon("chevron")}</summary>
    <div class="body">
      ${refAnswerHTML(q)}
      <div class="md" style="margin-top:12px">${renderMd(q.explanation || "")}</div>
      ${test}
      <div class="meta-line">考点：${pts || "—"}</div>${src}
    </div></details>`;
}

function rubricHTML(q) {
  if (!q.rubric || !q.rubric.length) return "";
  return `<div class="ref-block"><h4>${icon("list")}对照评分要点自评（勾选你答到的点）</h4>
    <div class="rubric">${q.rubric.map((r, i) => `<label><input type="checkbox" data-r="${i}"><span>${renderInline(r)}</span></label>`).join("")}</div>
    <div class="self-score"><span>自评</span><div class="progress"><i style="width:0%"></i></div><span class="ss-num">0 / 10</span></div></div>`;
}

/**
 * 在 container 中渲染一道题。
 * opts: { mode, index, total, saved, onAnswered(result, ans), onChange(ans) }
 */
export function mountQuestion(container, q, opts = {}) {
  const mode = opts.mode || "practice";
  const t = q.type;
  let answer = opts.saved !== undefined ? structuredClone(opts.saved) : undefined;
  let done = false;

  const stem = renderMd(q.question, { blanks: t === "fill" });
  const stemHTML = typeof stem === "string" ? stem : stem.html;
  const nInline = typeof stem === "string" ? 0 : stem.nBlank;
  const fillCount = (t === "fill" || t === "code_fill") ? q.answer.length : 0;
  const inlineBlanks = t === "fill" && nInline === fillCount;

  let body = `<div class="q-stem md">${inlineBlanks ? stemHTML : (typeof stem === "string" ? stem : stem.html.replace(/<input class="blank"[^>]*>/g, "____"))}</div>`;
  if (q.code && ["code_output", "code_fill", "code_debug"].includes(t)) body += `<div style="margin-top:14px">${renderCode(q.code, "python")}</div>`;
  if (t === "single" || t === "multiple") {
    body += `<div class="options">${Object.entries(q.options || {}).map(([k, v]) => optionHTML(k, v)).join("")}</div>`;
    if (t === "multiple" && mode !== "review") body += `<div class="hint">多选题：选出全部正确的选项，至少两项</div>`;
  }
  if (t === "judge") body += judgeHTML();
  if ((t === "fill" && !inlineBlanks) || t === "code_fill") {
    body += `<div class="blank-list">${Array.from({ length: fillCount }, (_, i) =>
      `<label>第 ${i + 1} 空<input class="blank" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`).join("")}</div>`;
  }
  if (t === "code_output") body += `<textarea class="answer-box mono" placeholder="在这里写出你认为的输出（可选）。不确定时可以直接查看答案。"></textarea>`;
  if (SELF_GRADED.has(t)) body += `<textarea class="answer-box" placeholder="写下你的思路或答案（可选，只保存在本机）"></textarea>`;
  body += `<div class="q-actions"></div><div class="q-result"></div>`;

  container.innerHTML = `<article class="q-card card">${metaHTML(q, opts.index, opts.total)}${body}</article>`;
  const card = container.firstElementChild;
  const actions = card.querySelector(".q-actions");
  const result = card.querySelector(".q-result");
  enhance(card, toast);

  card.querySelector(".qid").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(q.id); toast(`已复制题号 ${q.id}`, "checkPlain"); } catch { /* 忽略 */ }
  });

  const blanks = Array.from(card.querySelectorAll("input.blank"));
  const textBox = card.querySelector("textarea.answer-box");
  const options = Array.from(card.querySelectorAll(".option"));
  const optWrap = card.querySelector(".options");

  // ---------- 恢复已保存的作答 ----------
  function paintSelection() {
    for (const o of options) {
      const k = o.dataset.k;
      const on = t === "multiple" ? (answer || []).includes(k) : String(answer) === k;
      o.classList.toggle("selected", on);
      o.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  if (answer !== undefined) {
    if (t === "single" || t === "multiple" || t === "judge") paintSelection();
    if (t === "fill" || t === "code_fill") blanks.forEach((b, i) => { b.value = (answer || [])[i] || ""; });
    if (textBox && answer && answer.text) textBox.value = answer.text;
  }

  const emit = () => opts.onChange && opts.onChange(structuredClone(answer));

  // ---------- 作答交互 ----------
  options.forEach((o) => o.addEventListener("click", (ev) => {
    if (done || mode === "review") return;
    ripple(o, ev);
    sound("tap");
    const k = o.dataset.k;
    if (t === "multiple") {
      const set = new Set(answer || []);
      set.has(k) ? set.delete(k) : set.add(k);
      answer = [...set].sort();
      paintSelection();
      updateSubmit();
      emit();
      return;
    }
    answer = t === "judge" ? k === "true" : k;
    paintSelection();
    emit();
    if (mode === "practice" && store.settings.instant) submit();
    else updateSubmit();
  }));

  blanks.forEach((b) => {
    b.addEventListener("input", () => { answer = blanks.map((x) => x.value); updateSubmit(); emit(); });
    b.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const i = blanks.indexOf(b);
        if (i < blanks.length - 1) blanks[i + 1].focus(); else if (mode === "practice") submit();
      }
    });
  });

  if (textBox) textBox.addEventListener("input", () => {
    answer = { ...(answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {}), text: textBox.value };
    emit();
  });

  // ---------- 按钮 ----------
  let submitBtn = null;
  function updateSubmit() {
    if (!submitBtn) return;
    let ok = false;
    if (t === "multiple") ok = (answer || []).length > 0;
    else if (t === "fill" || t === "code_fill") ok = blanks.some((b) => b.value.trim());
    else if (t === "single" || t === "judge") ok = answer !== undefined;
    else if (t === "code_output") ok = true;
    submitBtn.disabled = !ok;
  }
  function addBtn(label, cls, onClick, ic) {
    const b = document.createElement("button");
    b.className = `btn ${cls}`;
    b.innerHTML = (ic ? icon(ic) : "") + `<span>${label}</span>`;
    b.addEventListener("click", (ev) => { ripple(b, ev); onClick(); });
    actions.appendChild(b);
    return b;
  }

  if (mode === "practice") {
    if (t === "multiple" || t === "fill" || t === "code_fill" || ((t === "single" || t === "judge") && !store.settings.instant)) {
      submitBtn = addBtn("提交答案", "primary", () => submit(), "checkPlain");
    }
    if (t === "code_output") {
      submitBtn = addBtn("提交比对", "primary", () => {
        if (!textBox.value.trim()) { revealSelf(); return; }
        submit();
      }, "checkPlain");
      addBtn("不确定，直接看答案", "ghost", () => revealSelf(), "bulb");
    }
    if (SELF_GRADED.has(t)) addBtn("查看参考答案", "primary", () => revealSelf(), "bulb");
    updateSubmit();
  }

  // ---------- 判分与反馈 ----------
  function feedback(kind, title, sub = "") {
    const ic = kind === "ok" ? "check" : kind === "bad" ? "x" : "bulb";
    result.innerHTML = `<div class="feedback ${kind}" role="status" aria-live="polite"><span class="fb-icon">${icon(ic)}</span>
      <div><div>${title}</div>${sub ? `<div class="fb-sub">${sub}</div>` : ""}</div></div>`;
  }

  function paintObjective(r) {
    if (optWrap) optWrap.classList.add("locked");
    if (t === "single" || t === "judge") {
      const key = t === "judge" ? String(q.answer) : q.answer;
      for (const o of options) {
        const k = o.dataset.k;
        const picked = String(answer) === k;
        o.classList.remove("selected");
        if (k === key) o.classList.add(picked ? "correct" : "reveal");
        if (k === key && picked) o.classList.add("pop");
        if (picked && k !== key) { o.classList.add("wrong"); o.querySelector(".state") && (o.querySelector(".state").innerHTML = icon("x")); }
        if (k !== key && !picked) o.classList.add("dim");
      }
    } else if (t === "multiple") {
      for (const o of options) {
        const k = o.dataset.k;
        const picked = (answer || []).includes(k);
        const right = q.answer.includes(k);
        o.classList.remove("selected");
        if (picked && right) o.classList.add("correct", "pop");
        else if (picked && !right) { o.classList.add("wrong"); o.querySelector(".state").innerHTML = icon("x"); }
        else if (!picked && right) { o.classList.add("missed"); o.querySelector(".state").innerHTML = icon("check"); }
        else o.classList.add("dim");
      }
    } else if (t === "fill" || t === "code_fill") {
      blanks.forEach((b, i) => { b.classList.add(r.per && r.per[i] ? "ok" : "bad"); b.readOnly = true; });
    }
  }

  function showExplain() {
    if (card.querySelector(".explain")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = explainHTML(q, mode === "review" || store.settings.openExplain);
    card.appendChild(wrap.firstElementChild);
    enhance(card, toast);
  }

  function celebrateCorrect() {
    const target = card.querySelector(".option.correct") || card.querySelector(".feedback") || card;
    burstFrom(target, { count: 30, power: 8 });
    sound("ok");
    haptic(18);
  }

  function submit() {
    if (done) return;
    const r = gradeAnswer(q, answer);
    if (r.empty && t !== "single" && t !== "judge") { toast("请先作答", "info"); return; }
    if (answer === undefined) return;
    done = true;
    actions.innerHTML = "";
    paintObjective(r);
    if (r.correct) {
      feedback("ok", "回答正确", t === "multiple" ? "全部选对，没有漏选" : "");
      requestAnimationFrame(celebrateCorrect);
    } else {
      let sub = "";
      if (t === "single") sub = `正确答案是 ${q.answer}`;
      if (t === "judge") sub = `这个说法是${q.answer ? "正确" : "错误"}的`;
      if (t === "multiple") sub = `正确答案是 ${q.answer.join("、")}`;
      if (t === "fill" || t === "code_fill") sub = `参考答案：${q.answer.map((a) => answerText(a)).join("；")}`;
      if (t === "code_output") sub = "对照下方的程序输出，看看哪里想错了";
      feedback("bad", "回答错误", esc(sub));
      sound("bad");
      haptic([28, 40, 28]);
    }
    showExplain();
    opts.onAnswered && opts.onAnswered({ correct: r.correct }, structuredClone(answer));
  }

  // 主观题 / 代码输出题：先展示参考答案，再自评
  function revealSelf() {
    if (done) return;
    done = true;
    actions.innerHTML = "";
    if (textBox) textBox.readOnly = true;
    feedback("info", "先读参考答案，再自评", q.rubric ? "答案与解析下方可以逐条勾选评分要点" : "判断你的答案与参考答案是否一致");
    showExplain();
    const explain = card.querySelector(".explain");
    explain.open = true;
    const box = document.createElement("div");
    box.className = "self-box";
    box.innerHTML = rubricHTML(q) + `<div class="q-actions self-actions">
      <button class="btn ok" data-self="1">${icon("checkPlain")}<span>我答对了</span></button>
      <button class="btn bad" data-self="0">${icon("xPlain")}<span>还没掌握</span></button></div>`;
    explain.after(box);
    const checks = Array.from(box.querySelectorAll(".rubric input"));
    const total = (q.rubric || []).reduce((s, x) => s + rubricPoints(x), 0) || 10;
    const updateScore = () => {
      const got = checks.reduce((s, c, i) => s + (c.checked ? rubricPoints(q.rubric[i]) : 0), 0);
      checks.forEach((c) => c.parentElement.classList.toggle("on", c.checked));
      const bar = box.querySelector(".self-score .progress > i");
      if (bar) bar.style.width = `${(got / total) * 100}%`;
      const num = box.querySelector(".ss-num");
      if (num) num.textContent = `${got} / ${total}`;
      answer = { ...(answer || {}), rubric: checks.map((c) => c.checked), score: got / total };
      const hint = got / total >= 0.6 ? "1" : "0";
      box.querySelectorAll("[data-self]").forEach((b) => b.classList.toggle("primary", b.dataset.self === hint && checks.some((c) => c.checked)));
    };
    checks.forEach((c) => c.addEventListener("change", updateScore));
    box.querySelectorAll("[data-self]").forEach((b) => b.addEventListener("click", (ev) => {
      ripple(b, ev);
      const ok = b.dataset.self === "1";
      answer = { ...(answer || {}), text: textBox ? textBox.value : undefined, self: ok };
      box.querySelectorAll("input").forEach((c) => { c.disabled = true; });
      const slot = box.querySelector(".self-actions");
      if (ok) feedback("ok", "太棒了，记为答对", q.rubric ? `自评 ${Math.round((answer.score || 0) * 10)} / 10 分` : "");
      else feedback("bad", "已加入错题本，过几天再来复习", "建议先把参考答案的要点复述一遍");
      slot.replaceWith(result.firstElementChild.cloneNode(true));   // 结果也显示在自评区，不用回到顶部看
      if (ok) {
        requestAnimationFrame(() => { burstFrom(box.querySelector(".feedback"), { count: 30, power: 8 }); sound("ok"); haptic(18); });
      } else {
        sound("bad");
        haptic([28, 40, 28]);
      }
      opts.onAnswered && opts.onAnswered({ correct: ok }, structuredClone(answer));
    }));
  }

  // ---------- 回顾模式：直接展示结果 ----------
  if (mode === "review") {
    done = true;
    if (optWrap) optWrap.classList.add("locked");
    blanks.forEach((b) => { b.readOnly = true; });
    if (textBox) textBox.readOnly = true;
    if (SELF_GRADED.has(t)) {
      const ok = answer && answer.self;
      if (answer && answer.self !== undefined) feedback(ok ? "ok" : "bad", ok ? "自评：答对" : "自评：未掌握", answer.score !== undefined ? `自评 ${Math.round(answer.score * 10)} / 10 分` : "");
      else feedback("info", "未作答");
    } else {
      const r = gradeAnswer(q, answer);
      if (answer === undefined || r.empty) feedback("bad", "未作答");
      else feedback(r.correct ? "ok" : "bad", r.correct ? "回答正确" : "回答错误");
      if (answer !== undefined) paintObjective(r);
      else if (t === "single" || t === "judge" || t === "multiple") {
        const keys = t === "judge" ? [String(q.answer)] : [].concat(q.answer);
        options.forEach((o) => o.classList.add(keys.includes(o.dataset.k) ? "reveal" : "dim"));
      }
    }
    showExplain();
  }

  return {
    card,
    get answer() { return answer; },
    get done() { return done; },
    submit,
    revealSelf,
    // 键盘：按字母或数字选择选项
    pick(key) {
      if (done || mode === "review") return false;
      const k = /^[1-5]$/.test(key) ? "ABCDE"[+key - 1] : key.toUpperCase();
      const target = t === "judge"
        ? options.find((o) => (o.dataset.k === "true" && (k === "A" || k === "T")) || (o.dataset.k === "false" && (k === "B" || k === "F")))
        : options.find((o) => o.dataset.k === k);
      if (target) { target.click(); return true; }
      return false;
    },
    primary() {
      if (done) return false;
      const b = actions.querySelector(".btn.primary:not([disabled])");
      if (b) { b.click(); return true; }
      return false;
    },
    focusInput() { (blanks[0] || textBox)?.focus(); },
  };
}
