// 入口：路由、导航高亮、主题、离线缓存
import { parseHash } from "./util.js";
import { applyTheme } from "./settings.js";
import { store } from "./store.js";
import { icon } from "./icons.js";
import { ensureRenderer } from "./render.js";
import { loadIndex } from "./data.js";
import { homeView, bankView, domainView, tracksView, listView, meView, searchView, aboutView } from "./views.js";
import { practiceView } from "./practice.js";
import { examHome, examRun } from "./exam.js";

const app = document.getElementById("app");
let cleanup = null;
let renderId = 0;

const TITLES = {
  "/": "", "/bank": "题库", "/tracks": "备考路线", "/practice": "刷题", "/exam": "模拟考试", "/exam/run": "考试中",
  "/wrong": "错题本", "/fav": "收藏", "/me": "我的学习", "/search": "搜索", "/about": "关于",
};

async function route() {
  const id = ++renderId;
  if (typeof cleanup === "function") { try { cleanup(); } catch { /* 忽略 */ } }
  cleanup = null;
  const { path, parts, params } = parseHash();
  highlightNav(path);
  document.title = (TITLES[path] || (parts[0] === "d" ? "题库" : "")) ? `${TITLES[path] || "题库"} · 大模型 & Agent 面试题库` : "大模型 & Agent 面试题库 · 在线刷题";
  window.scrollTo(0, 0);
  try {
    let ret;
    if (path === "/") ret = await homeView(app);
    else if (path === "/bank") ret = await bankView(app);
    else if (parts[0] === "d" && parts[1]) ret = await domainView(app, parts[1]);
    else if (path === "/tracks") ret = await tracksView(app, params);
    else if (path === "/practice") ret = await practiceView(app, params);
    else if (path === "/exam") ret = await examHome(app);
    else if (path === "/exam/run") ret = await examRun(app, params);
    else if (path === "/wrong") ret = await listView(app, "wrong");
    else if (path === "/fav") ret = await listView(app, "fav");
    else if (path === "/me") ret = await meView(app);
    else if (path === "/search") ret = await searchView(app, params);
    else if (path === "/about") ret = await aboutView(app);
    else { location.replace("#/"); return; }
    if (id === renderId) cleanup = ret; else if (typeof ret === "function") ret();
  } catch (e) {
    console.error(e);
    if (id !== renderId) return;
    app.innerHTML = `<div class="container narrow"><div class="card empty">${icon("info")}<h3>页面加载失败</h3>
      <p class="muted">${String(e.message || e)}</p><button class="btn primary" onclick="location.reload()">刷新重试</button></div></div>`;
  }
}

function highlightNav(path) {
  const top = "/" + (path.split("/")[1] || "");
  const group = top === "/d" || top === "/practice" || top === "/search" ? "/bank" : top === "/fav" ? "/wrong" : top;
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === group));
}

function initShell() {
  document.querySelectorAll("[data-icon]").forEach((el) => { el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon)); });
  const themeBtn = document.getElementById("theme-btn");
  const paintThemeBtn = () => { themeBtn.innerHTML = icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon"); };
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    store.setSetting("theme", next);
    applyTheme(next);
    paintThemeBtn();
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (store.settings.theme === "auto") { applyTheme(); paintThemeBtn(); } });
  paintThemeBtn();
}

applyTheme();
initShell();
window.addEventListener("hashchange", route);
route().then(() => {
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 800));
  idle(() => { loadIndex().catch(() => {}); ensureRenderer().catch(() => {}); });
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
