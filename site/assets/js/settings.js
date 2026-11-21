// 设置面板与主题
import { store } from "./store.js";
import { esc } from "./util.js";

export const SETTING_ITEMS = [
  ["instant", "单选、判断点击即提交", "关闭后需要再点「提交答案」"],
  ["openExplain", "作答后自动展开解析", "关闭后解析默认折叠"],
  ["autoNext", "答对后自动下一题", "答错时仍会停下来看解析"],
  ["removeOnCorrect", "错题答对后移出错题本", "关闭后需要手动移出"],
  ["haptic", "震动反馈", "仅支持部分安卓手机"],
  ["sound", "答题音效", "答对、答错与连对时播放提示音"],
];

export function applyTheme(theme = store.settings.theme) {
  const dark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#0b1020" : "#f5f6fb";
}

export function settingsHTML() {
  const s = store.settings;
  return `<div class="setting"><div><div class="t">外观</div><div class="d">跟随系统，或固定为浅色 / 深色</div></div>
      <select class="btn sm theme-sel" aria-label="外观">
        ${[["auto", "跟随系统"], ["light", "浅色"], ["dark", "深色"]].map(([v, l]) => `<option value="${v}" ${s.theme === v ? "selected" : ""}>${l}</option>`).join("")}
      </select></div>` +
    SETTING_ITEMS.map(([k, t, d]) => `<div class="setting"><div><div class="t">${esc(t)}</div><div class="d">${esc(d)}</div></div>
      <label class="switch"><input type="checkbox" data-k="${k}" ${s[k] ? "checked" : ""}><span></span></label></div>`).join("");
}

export function bindSettings(root) {
  root.querySelectorAll("input[data-k]").forEach((el) => el.addEventListener("change", () => store.setSetting(el.dataset.k, el.checked)));
  const sel = root.querySelector(".theme-sel");
  if (sel) sel.addEventListener("change", () => { store.setSetting("theme", sel.value); applyTheme(); });
}

export function openSettings() {
  const mask = document.createElement("div");
  mask.className = "modal-mask";
  mask.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="设置"><h3>练习设置</h3>${settingsHTML()}
    <div class="row"><button class="btn primary close">完成</button></div></div>`;
  const close = () => { mask.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  mask.addEventListener("click", (e) => { if (e.target === mask || e.target.closest(".close")) close(); });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(mask);
  bindSettings(mask);
}
