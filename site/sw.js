// 离线缓存：页面与索引走网络优先（保证更新及时），题目与静态资源先用缓存、后台更新
const CACHE = "llm-agent-bank-v1";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest", "./assets/css/app.css",
  "./assets/js/main.js", "./assets/js/util.js", "./assets/js/store.js", "./assets/js/data.js", "./assets/js/render.js",
  "./assets/js/question.js", "./assets/js/practice.js", "./assets/js/exam.js", "./assets/js/views.js",
  "./assets/js/effects.js", "./assets/js/icons.js", "./assets/js/settings.js", "./assets/icons/logo.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || fresh;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const p = url.pathname;
  // 页面、索引与本站 JS / CSS 走网络优先，避免新旧版本的模块混用；题目、搜索索引、第三方库与字体先用缓存
  if (req.mode === "navigate" || p.endsWith("/index.json") || p.endsWith(".html") || p.endsWith("/") ||
      (p.includes("/assets/") && !p.includes("/vendor/") && (p.endsWith(".js") || p.endsWith(".css")))) {
    e.respondWith(networkFirst(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});
