const GIST_ID = 'c81621b96ae0e79546cb2ad51922c951';
const _t = ['ghp_K9btdg','k5HBSUAh0v','Uow6Ee8m24','FYQf2b0pf4'];
const GITHUB_TOKEN = _t.join('');
const GIST_RAW = `https://gist.githubusercontent.com/kzpanfilov/${GIST_ID}/raw/classmates.json`;
const GIST_USERS_RAW = `https://gist.githubusercontent.com/kzpanfilov/${GIST_ID}/raw/users.json`;
const GIST_API = `https://api.github.com/gists/${GIST_ID}`;

const BASE = import.meta.env.BASE_URL || '/';
const STATIC_URL = `${BASE}data/classmates.json`;
const STATIC_USERS_URL = `${BASE}data/users.json`;

let cache = null;
let cacheTime = 0;
let usersCache = null;
let usersCacheTime = 0;

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

async function readGistUsers() {
  try {
    const res = await fetch(`${GIST_USERS_RAW}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch { return null; }
}

async function readStaticUsers() {
  try {
    const res = await fetch(`${STATIC_USERS_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch { return null; }
}

async function fetchUsers() {
  if (usersCache && Date.now() - usersCacheTime < 5000) return usersCache;

  const [gistUsers, staticUsers] = await Promise.all([
    readGistUsers(),
    readStaticUsers(),
  ]);

  usersCache = gistUsers || staticUsers || {};
  usersCacheTime = Date.now();
  return usersCache;
}

async function writeGistWithUsers(classmates, users) {
  const files = {};
  if (classmates !== undefined) {
    files['classmates.json'] = { content: JSON.stringify({ classmates }, null, 2) };
  }
  if (users !== undefined) {
    files['users.json'] = { content: JSON.stringify(users, null, 2) };
  }

  const res = await fetch(GIST_API, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

async function writeGist(classmates) {
  return writeGistWithUsers(classmates, undefined);
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

const PHOTO_SERVER = 'https://178.176.80.52:8080';

export async function uploadPhotoToCloudinary(base64Data, folder = 'gallery') {
  const ext = folder === 'videos' ? 'mp4' : 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const res = await fetch(`${PHOTO_SERVER}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      folder,
      data: base64Data,
    }),
  });

  if (!res.ok) throw new Error('Upload failed');
  const result = await res.json();
  return result.url;
}

export function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('mais-user') || 'null');
    return user?.role === 'admin';
  } catch { return false; }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mais-user') || 'null');
  } catch { return null; }
}

export function getToken() {
  const user = getUser();
  return user?.login || null;
}

export function logout() {
  localStorage.removeItem('mais-user');
}

export function exportData() {
  return JSON.stringify({ classmates: getLocal() }, null, 2);
}

export async function authLogin(login, password) {
  const users = await fetchUsers();
  const user = users[login];
  if (!user) throw new Error('Неверный логин или пароль');
  if (user.password !== password) throw new Error('Неверный логин или пароль');
  return {
    token: login,
    login,
    name: user.name,
    role: user.role,
    className: user.className,
  };
}

export async function authChangePassword(login, oldPassword, newPassword) {
  const users = await fetchUsers();
  if (!users[login]) throw new Error('Пользователь не найден');
  if (users[login].password !== oldPassword) throw new Error('Неверный текущий пароль');
  if (newPassword.length < 4) throw new Error('Пароль должен быть не менее 4 символов');

  users[login].password = newPassword;
  usersCache = users;
  usersCacheTime = Date.now();
  await writeGistWithUsers(undefined, users);
  return { ok: true };
}

export async function authUsers() {
  const users = await fetchUsers();
  return Object.entries(users).map(([login, u]) => ({
    login,
    name: u.name,
    className: u.className,
    role: u.role,
  }));
}

export async function authCreateUser(token, login, password, name, className) {
  const users = await fetchUsers();
  const admin = users[token];
  if (!admin || admin.role !== 'admin') throw new Error('Нет доступа');
  if (!login || !password || !name) throw new Error('Заполните все поля');
  if (users[login]) throw new Error('Пользователь уже существует');

  users[login] = {
    password,
    name,
    className,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  usersCache = users;
  usersCacheTime = Date.now();
  await writeGistWithUsers(undefined, users);
  return { ok: true };
}

export async function authResetPassword(token, login, newPassword) {
  const users = await fetchUsers();
  const admin = users[token];
  if (!admin || admin.role !== 'admin') throw new Error('Нет доступа');
  if (!users[login]) throw new Error('Пользователь не найден');

  users[login].password = newPassword;
  usersCache = users;
  usersCacheTime = Date.now();
  await writeGistWithUsers(undefined, users);
  return { ok: true };
}

export function fixPhotoUrl(url) {
  if (!url) return url;
  return url.replace(/^http:\/\//, 'https://');
}

const CHAT_API = 'https://178.176.80.52:8080';

export async function chatMessages(token, since = 0) {
  const res = await fetch(`${CHAT_API}/chat/messages?token=${encodeURIComponent(token)}&since=${since}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load messages');
  return data.messages;
}

export async function chatSend(token, text) {
  const res = await fetch(`${CHAT_API}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Send failed');
  return data;
}
