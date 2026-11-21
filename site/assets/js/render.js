// Markdown + KaTeX + highlight.js 渲染（首次使用时才加载这些库）
import { esc } from "./util.js";
import { icon } from "./icons.js";

const VENDOR = new URL("../vendor/", import.meta.url);
let ready = null;
let md = null;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("加载失败：" + url));
    document.head.appendChild(s);
  });
}

function loadCSS(url) {
  return new Promise((resolve) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = url;
    l.onload = resolve;
    l.onerror = resolve;
    document.head.appendChild(l);
  });
}

export function ensureRenderer() {
  if (!ready) {
    ready = Promise.all([
      loadCSS(new URL("katex/katex.min.css", VENDOR)),
      loadScript(new URL("katex/katex.min.js", VENDOR)),
      loadScript(new URL("markdown-it/markdown-it.min.js", VENDOR)),
      loadScript(new URL("highlight/highlight.min.js", VENDOR)),
    ]).then(init);
    ready.catch(() => { ready = null; });
  }
  return ready;
}

function highlight(code, lang) {
  const hl = window.hljs;
  const l = (lang || "").toLowerCase();
  if (hl && l && hl.getLanguage(l)) {
    try { return hl.highlight(code, { language: l, ignoreIllegals: true }).value; } catch { /* 回退为纯文本 */ }
  }
  return esc(code);
}

function init() {
  md = window.markdownit({ html: false, linkify: true, typographer: false, breaks: false });
  md.options.highlight = (code, lang) =>
    `<pre class="code-block"><button class="icon-btn copy" title="复制代码" aria-label="复制代码">${icon("copy")}</button><code class="hljs">${highlight(code, lang)}</code></pre>`;
  const dflt = md.renderer.rules.link_open || ((t, i, o, e, self) => self.renderToken(t, i, o));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noopener noreferrer");
    return dflt(tokens, idx, opts, env, self);
  };
}

function katexHTML(tex, display) {
  try {
    return window.katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore" });
  } catch {
    return `<code>${esc(tex)}</code>`;
  }
}

const OPEN = "", CLOSE = "", BOPEN = "", BCLOSE = "";

// 先保护代码，再抽出公式（和填空位），最后交给 markdown-it
function protect(src, { blanks = false } = {}) {
  const math = [];
  let nBlank = 0;
  const codes = [];
  let s = String(src ?? "");
  // 1) 保护代码（围栏代码块与行内代码），避免其中的 $ 和 ___ 被误处理
  s = s.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => `${codes.push(m) - 1}`);
  // 2) 行间公式
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `${OPEN}${math.push(katexHTML(tex.trim(), true)) - 1}${CLOSE}`);
  // 3) 行内公式：开头 $ 后不是空白，结尾 $ 前不是空白、后面不是数字
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && s[i + 1] === "$") { out += "\\$"; i++; continue; }
    if (c === "$" && s[i + 1] && !/\s/.test(s[i + 1])) {
      let j = i + 1;
      while (j < s.length && s[j] !== "$" && s[j] !== "\n") j += s[j] === "\\" ? 2 : 1;
      if (j < s.length && s[j] === "$" && !/\s/.test(s[j - 1]) && !/\d/.test(s[j + 1] || "")) {
        out += `${OPEN}${math.push(katexHTML(s.slice(i + 1, j), false)) - 1}${CLOSE}`;
        i = j;
        continue;
      }
    }
    out += c;
  }
  s = out;
  // 4) 填空位
  if (blanks) s = s.replace(/_{3,}/g, () => `${BOPEN}${nBlank++}${BCLOSE}`);
  // 5) 还原代码
  s = s.replace(/(\d+)/g, (_, i) => codes[+i]);
  return { s, math, nBlank };
}

function restore(html, math) {
  return html
    .replace(/(\d+)/g, (_, i) => math[+i])
    .replace(/(\d+)/g, (_, i) => `<input class="blank" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="第 ${+i + 1} 空">`);
}

export function renderMd(src, opts = {}) {
  const { s, math, nBlank } = protect(src, opts);
  const html = restore(md.render(s), math);
  return opts.blanks ? { html, nBlank } : html;
}

export function renderInline(src) {
  const { s, math } = protect(src);
  return restore(md.renderInline(s), math);
}

export function renderCode(code, lang = "python") {
  return `<div class="md">${md.options.highlight(String(code ?? "").replace(/\n$/, ""), lang)}</div>`;
}

// 为容器中的代码块绑定复制按钮
export function enhance(root, toast) {
  root.querySelectorAll("pre.code-block .copy").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const code = btn.parentElement.querySelector("code")?.innerText || "";
      try {
        await navigator.clipboard.writeText(code);
        toast && toast("代码已复制", "checkPlain");
      } catch {
        toast && toast("复制失败，请手动选择", "info");
      }
    });
  });
}
