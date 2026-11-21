// 通用工具函数

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 可复现的伪随机数（mulberry32）
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function dayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  const params = Object.fromEntries(new URLSearchParams(qs));
  const parts = path.split("/").filter(Boolean);
  return { path: "/" + parts.join("/"), parts, params };
}

export function buildHash(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
  return "#" + path + (qs ? "?" + qs : "");
}

// 填空、代码填空的宽松比对：忽略大小写、空白、反引号、美元符号、中英文标点差异
export function normAnswer(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[\s`$，,。；;：:]/g, "")
    .replace(/[（）]/g, (c) => (c === "（" ? "(" : ")"))
    .replace(/×/g, "x")
    .replace(/\\times/g, "x");
}

function asNumber(s) {
  const t = String(s ?? "").trim().replace(/,/g, "").replace(/×10\^?/i, "e").replace(/\s+/g, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?%?$/i.test(t)) return null;
  const v = parseFloat(t);
  return Number.isFinite(v) ? (t.endsWith("%") ? v / 100 : v) : null;
}

export function blankMatches(given, alts) {
  const g = normAnswer(given);
  if (!g) return false;
  const list = Array.isArray(alts) ? alts : [alts];
  for (const a of list) {
    if (normAnswer(a) === g) return true;
    const x = asNumber(given), y = asNumber(a);
    if (x !== null && y !== null && Math.abs(x - y) <= Math.max(1e-9, Math.abs(y) * 1e-4)) return true;
  }
  return false;
}

// 判定一组填空是否全部正确；unordered 时各空可交换
export function gradeBlanks(values, answer, unordered = false) {
  const per = values.map(() => false);
  if (!unordered) {
    answer.forEach((alts, i) => { per[i] = blankMatches(values[i], alts); });
  } else {
    const left = answer.map((_, i) => i);
    values.forEach((v, i) => {
      const hit = left.find((j) => blankMatches(v, answer[j]));
      if (hit !== undefined) { per[i] = true; left.splice(left.indexOf(hit), 1); }
    });
  }
  return { per, all: per.length > 0 && per.every(Boolean) };
}

export function answerText(alts) {
  return (Array.isArray(alts) ? alts : [alts]).map(String).join(" / ");
}

// 从评分要点中解析分值，如「……（3 分）」
export function rubricPoints(item) {
  const m = String(item).match(/[（(]\s*(\d+(?:\.\d+)?)\s*分\s*[）)]/);
  return m ? parseFloat(m[1]) : 0;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function hashCode(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
