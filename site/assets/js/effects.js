// 交互特效：彩带粒子、点击涟漪、音效、震动、提示、数字滚动
import { store } from "./store.js";
import { icon } from "./icons.js";
import { esc, prefersReducedMotion } from "./util.js";

// ---------------- 彩带粒子 ----------------
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#f43f5e"];
let canvas, ctx, parts = [], running = false, dpr = 1;

function setup() {
  if (canvas) return;
  canvas = document.getElementById("fx");
  ctx = canvas.getContext("2d");
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  };
  resize();
  addEventListener("resize", resize, { passive: true });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const now = performance.now();
  parts = parts.filter((p) => now - p.born < p.life);
  for (const p of parts) {
    const t = (now - p.born) / p.life;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.globalAlpha = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
    ctx.translate(p.x * dpr, p.y * dpr);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 0) ctx.fillRect(-p.w * dpr / 2, -p.h * dpr / 2, p.w * dpr, p.h * dpr);
    else { ctx.beginPath(); ctx.arc(0, 0, (p.w * dpr) / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  if (parts.length) requestAnimationFrame(loop);
  else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

export function burst(x, y, { count = 34, power = 9, spread = Math.PI * 2, angle = -Math.PI / 2, life = 1300 } = {}) {
  if (prefersReducedMotion()) return;
  setup();
  const now = performance.now();
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const v = power * (0.45 + Math.random() * 0.75);
    parts.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.22 + Math.random() * 0.12,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
      w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, shape: Math.random() < 0.7 ? 0 : 1,
      color: COLORS[(Math.random() * COLORS.length) | 0], born: now, life: life * (0.7 + Math.random() * 0.5),
    });
  }
  if (!running) { running = true; requestAnimationFrame(loop); }
}

export function burstFrom(el, opts = {}) {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, opts);
}

export function celebrate() {
  burst(innerWidth * 0.2, innerHeight * 0.9, { count: 70, power: 18, angle: -Math.PI / 2.6, spread: 0.9, life: 2000 });
  burst(innerWidth * 0.8, innerHeight * 0.9, { count: 70, power: 18, angle: -Math.PI / 1.6, spread: 0.9, life: 2000 });
}

// ---------------- 点击涟漪 ----------------
export function ripple(el, ev) {
  if (prefersReducedMotion()) return;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const x = (ev && ev.clientX !== undefined && ev.clientX !== 0 ? ev.clientX : r.left + r.width / 2) - r.left - size / 2;
  const y = (ev && ev.clientY !== undefined && ev.clientY !== 0 ? ev.clientY : r.top + r.height / 2) - r.top - size / 2;
  const s = document.createElement("span");
  s.className = "ripple";
  s.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
  el.appendChild(s);
  setTimeout(() => s.remove(), 650);
}

// ---------------- 音效（WebAudio 合成，无需音频文件） ----------------
let actx = null;
function tone(freq, start, dur, type = "sine", gain = 0.12, slideTo = null) {
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, actx.currentTime + start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, actx.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, actx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, actx.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + start + dur);
  o.connect(g).connect(actx.destination);
  o.start(actx.currentTime + start);
  o.stop(actx.currentTime + start + dur + 0.02);
}

export function sound(kind) {
  if (!store.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    if (kind === "ok") { tone(784, 0, 0.12); tone(1175, 0.09, 0.22); }
    else if (kind === "bad") { tone(220, 0, 0.28, "triangle", 0.14, 150); }
    else if (kind === "win") { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, "sine", 0.1)); }
    else if (kind === "tap") { tone(660, 0, 0.05, "sine", 0.05); }
  } catch { /* 浏览器不支持时静默 */ }
}

export function haptic(pattern) {
  if (store.settings.haptic && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* 忽略 */ }
  }
}

// ---------------- 提示与弹层 ----------------
export function toast(msg, ic = "info", ms = 1900) {
  const wrap = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, ms);
}

export function milestone(text) {
  const el = document.createElement("div");
  el.className = "milestone";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

export function confirmDialog({ title, body = "", ok = "确定", cancel = "取消", danger = false }) {
  return new Promise((resolve) => {
    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><div class="muted">${body}</div>
      <div class="row"><button class="btn ghost" data-r="0">${esc(cancel)}</button><button class="btn ${danger ? "bad" : "primary"}" data-r="1">${esc(ok)}</button></div></div>`;
    const done = (v) => { mask.remove(); document.removeEventListener("keydown", onKey); resolve(v); };
    const onKey = (e) => { if (e.key === "Escape") done(false); if (e.key === "Enter") done(true); };
    mask.addEventListener("click", (e) => {
      if (e.target === mask) done(false);
      const b = e.target.closest("[data-r]");
      if (b) done(b.dataset.r === "1");
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(mask);
    mask.querySelector('[data-r="1"]').focus();
  });
}

export function countUp(el, to, { duration = 900, suffix = "", decimals = 0 } = {}) {
  if (!el) return;
  if (prefersReducedMotion()) { el.textContent = to.toFixed(decimals) + suffix; return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const v = to * (1 - Math.pow(1 - t, 3));
    el.textContent = v.toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
