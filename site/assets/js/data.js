// 题库数据：index.json 一次加载；单题按需加载并缓存；搜索索引延迟加载
const BASE = new URL("../../data/", import.meta.url);

let indexPromise = null;
const qcache = new Map();
let searchPromise = null;

export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(new URL("index.json", BASE)).then((r) => {
      if (!r.ok) throw new Error(`题库索引加载失败（${r.status}）`);
      return r.json();
    }).then(enrich);
    indexPromise.catch(() => { indexPromise = null; });
  }
  return indexPromise;
}

function enrich(idx) {
  idx.byDomain = {};
  idx.bySub = {};
  idx.meta = {};
  idx.idsBySub = {};
  for (const d of idx.domains) {
    idx.byDomain[d.code] = d;
    for (const s of d.subs) {
      const key = `${d.code}-${s.code}`;
      s.key = key;
      s.domain = d;
      idx.bySub[key] = s;
      idx.idsBySub[key] = [];
    }
  }
  for (const [id, type, diff, freq] of idx.q) {
    const [dom, sub] = id.split("-");
    const key = `${dom}-${sub}`;
    idx.meta[id] = { id, type, diff, freq, dom, sub: key };
    (idx.idsBySub[key] = idx.idsBySub[key] || []).push(id);
  }
  idx.allIds = idx.q.map((x) => x[0]);
  return idx;
}

export function getQuestion(id) {
  if (!qcache.has(id)) {
    const p = fetch(new URL(`q/${encodeURIComponent(id)}.json`, BASE)).then((r) => {
      if (!r.ok) throw new Error(`题目 ${id} 加载失败（${r.status}）`);
      return r.json();
    });
    p.catch(() => qcache.delete(id));
    qcache.set(id, p);
  }
  return qcache.get(id);
}

export function prefetch(ids) {
  for (const id of ids) if (id && !qcache.has(id)) getQuestion(id).catch(() => {});
}

export async function getMany(ids, concurrency = 8) {
  const out = new Array(ids.length);
  let next = 0;
  async function worker() {
    while (next < ids.length) {
      const i = next++;
      out[i] = await getQuestion(ids[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
  return out;
}

export function loadSearch() {
  if (!searchPromise) {
    searchPromise = fetch(new URL("search.json", BASE)).then((r) => r.json());
    searchPromise.catch(() => { searchPromise = null; });
  }
  return searchPromise;
}

// 按条件筛选题号：domains / subs（并集），types、diffs、minFreq、maxDiff、minDiff（交集）
export function filterIds(idx, f = {}) {
  const doms = f.domains ? new Set(f.domains) : null;
  const subs = f.subs ? new Set(f.subs) : null;
  const types = f.types ? new Set(f.types) : null;
  const diffs = f.diffs ? new Set(f.diffs.map(Number)) : null;
  return idx.allIds.filter((id) => {
    const m = idx.meta[id];
    if (doms || subs) {
      const inDom = doms && doms.has(m.dom);
      const inSub = subs && subs.has(m.sub);
      if (!inDom && !inSub) return false;
    }
    if (types && !types.has(m.type)) return false;
    if (diffs && !diffs.has(m.diff)) return false;
    if (f.minFreq && m.freq < f.minFreq) return false;
    if (f.maxDiff && m.diff > f.maxDiff) return false;
    if (f.minDiff && m.diff < f.minDiff) return false;
    return true;
  });
}

export const OBJECTIVE = new Set(["single", "multiple", "judge", "fill"]);
export const SUBJECTIVE = new Set(["short", "scenario", "design", "calc", "coding", "code_debug"]);
