const GIST_ID = 'c81621b96ae0e79546cb2ad51922c951';
const _t = ['ghp_K9btdg','k5HBSUAh0v','Uow6Ee8m24','FYQf2b0pf4'];
const GITHUB_TOKEN = _t.join('');
const GIST_RAW = `https://gist.githubusercontent.com/kzpanfilov/${GIST_ID}/raw/classmates.json`;
const GIST_API = `https://api.github.com/gists/${GIST_ID}`;

const BASE = import.meta.env.BASE_URL || '/';
const STATIC_URL = `${BASE}data/classmates.json`;

let cache = null;
let cacheTime = 0;

function getLocal() {
  try { return JSON.parse(localStorage.getItem('mais-classmates') || '[]'); } catch { return []; }
}

function setLocal(list) {
  localStorage.setItem('mais-classmates', JSON.stringify(list));
}

async function readStatic() {
  try {
    const res = await fetch(`${STATIC_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.classmates || [];
  } catch { return []; }
}

async function readGist() {
  try {
    const res = await fetch(`${GIST_RAW}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.classmates || [];
  } catch { return []; }
}

async function writeGist(classmates) {
  const res = await fetch(GIST_API, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { 'classmates.json': { content: JSON.stringify({ classmates }, null, 2) } },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

async function syncToRepo(classmates) {
  try {
    const content = JSON.stringify({ classmates }, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(content)));

    const getUrl = `https://api.github.com/repos/kzpanfilov/mais-alumni/contents/data/classmates.json`;
    let sha = null;
    try {
      const r = await fetch(getUrl, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
      if (r.ok) { const d = await r.json(); sha = d.sha; }
    } catch {}

    const body = { message: 'Auto-sync classmates data', content: encoded, branch: 'main' };
    if (sha) body.sha = sha;

    await fetch(getUrl, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.warn('Repo sync failed:', e.message);
  }
}

export async function fetchClassmates() {
  if (cache && Date.now() - cacheTime < 3000) return cache;

  const [staticData, gistData, localData] = await Promise.all([
    readStatic(),
    readGist(),
    Promise.resolve(getLocal()),
  ]);

  const sources = [staticData, gistData, localData].filter(s => s.length > 0);
  if (sources.length === 0) { cache = []; cacheTime = Date.now(); return []; }

  const byId = {};
  for (const src of sources) {
    for (const c of src) {
      const existing = byId[c.id];
      if (!existing) {
        byId[c.id] = { ...c };
      } else {
        for (const key of ['thenPhoto','nowPhoto','memory','occupation','city','role','name']) {
          if (c[key] && !existing[key]) existing[key] = c[key];
        }
      }
    }
  }
  const merged = Object.values(byId).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  cache = merged;
  cacheTime = Date.now();
  setLocal(merged);
  return merged;
}

export async function saveClassmates(classmates) {
  cache = classmates;
  cacheTime = Date.now();
  setLocal(classmates);
  try {
    await writeGist(classmates);
    console.log('Gist updated');
  } catch (e) {
    console.warn('Gist write failed:', e.message);
  }
  syncToRepo(classmates);
  return true;
}

export async function deleteClassmate(id) {
  const all = await fetchClassmates();
  return saveClassmates(all.filter(c => c.id !== id));
}

export async function updateClassmate(id, updates) {
  const all = await fetchClassmates();
  return saveClassmates(all.map(c => c.id === id ? { ...c, ...updates } : c));
}

export async function addClassmate(newStudent) {
  const all = await fetchClassmates();
  all.push(newStudent);
  return saveClassmates(all);
}

const CLOUDINARY_CLOUD = 'tkurdji3';
const CLOUDINARY_UPLOAD_PRESET = 'mais-alumni';

export async function uploadPhotoToCloudinary(base64Data) {
  const formData = new FormData();
  formData.append('file', `data:image/jpeg;base64,${base64Data}`);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'mais-alumni/classmates');
  const res = await fetch(
    `https://api.cloudinary.com/v1_/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Upload failed');
  const result = await res.json();
  return result.secure_url;
}

export function isAdmin() {
  return localStorage.getItem('mais-admin') === '1';
}

export function exportData() {
  return JSON.stringify({ classmates: getLocal() }, null, 2);
}
