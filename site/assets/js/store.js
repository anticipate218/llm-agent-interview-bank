// 本地学习数据（只保存在浏览器的 localStorage 中，不会上传）
import { dayKey } from "./util.js";

const KEY = "llm-agent-bank.v1";
const DEFAULT_SETTINGS = {
  theme: "auto",          // auto | light | dark
  instant: true,          // 单选、判断题点击即提交
  sound: false,           // 答题音效
  haptic: true,           // 手机震动反馈
  openExplain: true,      // 作答后自动展开解析
  autoNext: false,        // 答对后自动进入下一题
  removeOnCorrect: true,  // 错题答对后自动移出错题本
};

let state = load();
let saveTimer = null;

function blank() {
  return { rec: {}, wrong: [], fav: [], days: {}, exams: [], sessions: {}, last: null, best: 0, settings: { ...DEFAULT_SETTINGS } };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw) return blank();
    const s = { ...blank(), ...raw };
    s.settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
    return s;
  } catch {
    return blank();
  }
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 存储已满或被禁用时忽略 */ }
  }, 120);
}

export const store = {
  get settings() { return state.settings; },
  setSetting(k, v) { state.settings[k] = v; save(); },

  // ---- 作答记录 ----
  record(id, correct) {
    const r = state.rec[id] || [0, 0, 0, 0];   // [作答次数, 答对次数, 最近一次是否答对, 时间戳]
    r[0] += 1;
    if (correct) r[1] += 1;
    r[2] = correct ? 1 : 0;
    r[3] = Date.now();
    state.rec[id] = r;
    const d = dayKey();
    state.days[d] = (state.days[d] || 0) + 1;
    const i = state.wrong.indexOf(id);
    if (!correct && i < 0) state.wrong.unshift(id);
    if (!correct && i > 0) { state.wrong.splice(i, 1); state.wrong.unshift(id); }
    if (correct && i >= 0 && state.settings.removeOnCorrect) state.wrong.splice(i, 1);
    save();
  },
  rec(id) { return state.rec[id] || null; },
  status(id) {               // "new" | "ok" | "bad"
    const r = state.rec[id];
    return !r ? "new" : r[2] ? "ok" : "bad";
  },
  setBest(n) { if (n > state.best) { state.best = n; save(); } },
  get best() { return state.best; },

  // ---- 错题本 / 收藏 ----
  get wrong() { return state.wrong.slice(); },
  removeWrong(id) { state.wrong = state.wrong.filter((x) => x !== id); save(); },
  clearWrong() { state.wrong = []; save(); },
  get fav() { return state.fav.slice(); },
  isFav(id) { return state.fav.includes(id); },
  toggleFav(id) {
    const i = state.fav.indexOf(id);
    if (i >= 0) state.fav.splice(i, 1); else state.fav.unshift(id);
    save();
    return i < 0;
  },

  // ---- 统计 ----
  summary(ids = null) {
    let answered = 0, correct = 0, attempts = 0, okAttempts = 0;
    const keys = ids || Object.keys(state.rec);
    for (const id of keys) {
      const r = state.rec[id];
      if (!r) continue;
      answered += 1;
      if (r[2]) correct += 1;
      attempts += r[0];
      okAttempts += r[1];
    }
    return { answered, correct, attempts, okAttempts };
  },
  get days() { return { ...state.days }; },
  today() { return state.days[dayKey()] || 0; },
  streakDays() {
    let n = 0;
    const d = new Date();
    if (!state.days[dayKey(d)]) d.setDate(d.getDate() - 1);   // 今天还没做题时，从昨天开始算
    while (state.days[dayKey(d)]) { n += 1; d.setDate(d.getDate() - 1); }
    return n;
  },

  // ---- 练习会话（刷新页面后可继续） ----
  session(key) { return state.sessions[key] || null; },
  saveSession(key, sess) {
    state.sessions[key] = sess;
    const keys = Object.keys(state.sessions).sort((a, b) => (state.sessions[b].ts || 0) - (state.sessions[a].ts || 0));
    for (const k of keys.slice(12)) delete state.sessions[k];
    save();
  },
  dropSession(key) { delete state.sessions[key]; save(); },
  setLast(info) { state.last = info; save(); },
  get last() { return state.last; },

  // ---- 考试记录 ----
  addExam(e) { state.exams.unshift(e); state.exams = state.exams.slice(0, 50); save(); },
  get exams() { return state.exams.slice(); },

  // ---- 导入导出 ----
  exportJSON() { return JSON.stringify({ app: "llm-agent-interview-bank", version: 1, data: state }, null, 1); },
  importJSON(text) {
    const obj = JSON.parse(text);
    const data = obj && obj.data ? obj.data : obj;
    if (!data || typeof data !== "object" || !data.rec) throw new Error("文件格式不正确");
    state = { ...blank(), ...data, settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) } };
    save();
  },
  reset() { const settings = state.settings; state = blank(); state.settings = settings; save(); },
};
