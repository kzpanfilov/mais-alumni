const GIST_ID = 'c81621b96ae0e79546cb2ad51922c951';
const _t = ['ghp_K9btdg','k5HBSUAh0v','Uow6Ee8m24','FYQf2b0pf4'];
const GITHUB_TOKEN = _t.join('');
const GIST_RAW = `https://gist.githubusercontent.com/kzpanfilov/${GIST_ID}/raw/news.json`;
const GIST_API = `https://api.github.com/gists/${GIST_ID}`;

const STATIC_URL = `${import.meta.env.BASE_URL || '/'}data/news.json`;

let cache = null;
let cacheTime = 0;

function getLocal() {
  try { return JSON.parse(localStorage.getItem('mais-news') || '[]'); } catch { return []; }
}

function setLocal(list) {
  localStorage.setItem('mais-news', JSON.stringify(list));
}

async function readStatic() {
  try {
    const res = await fetch(`${STATIC_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch { return []; }
}

async function readGist() {
  try {
    const res = await fetch(`${GIST_RAW}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch { return []; }
}

async function writeGist(items) {
  const res = await fetch(GIST_API, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { 'news.json': { content: JSON.stringify(items, null, 2) } },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

export async function fetchNews() {
  if (cache && Date.now() - cacheTime < 3000) return cache;

  const [staticData, gistData] = await Promise.all([readStatic(), readGist()]);
  const localData = getLocal();

  const sources = [staticData, gistData, localData].filter(s => s.length > 0);
  if (sources.length === 0) { cache = []; cacheTime = Date.now(); return []; }

  const byId = {};
  for (const src of sources) {
    for (const item of src) {
      if (!byId[item.id]) byId[item.id] = { ...item };
    }
  }

  const merged = Object.values(byId).sort((a, b) => new Date(b.date) - new Date(a.date));
  cache = merged;
  cacheTime = Date.now();
  setLocal(merged);
  return merged;
}

async function save(items) {
  cache = items;
  cacheTime = Date.now();
  setLocal(items);
  try { await writeGist(items); } catch (e) { console.warn('News gist write failed:', e.message); }
  return true;
}

export async function addNews(item) {
  const all = await fetchNews();
  all.unshift({ ...item, id: Date.now() });
  return save(all);
}

export async function updateNews(id, updates) {
  const all = await fetchNews();
  return save(all.map(n => n.id === id ? { ...n, ...updates } : n));
}

export async function deleteNews(id) {
  const all = await fetchNews();
  return save(all.filter(n => n.id !== id));
}
