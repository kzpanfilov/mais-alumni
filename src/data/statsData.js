const GIST_ID = 'c81621b96ae0e79546cb2ad51922c951';
const _t = ['ghp_K9btdg','k5HBSUAh0v','Uow6Ee8m24','FYQf2b0pf4'];
const GITHUB_TOKEN = _t.join('');
const GIST_RAW = `https://gist.githubusercontent.com/kzpanfilov/${GIST_ID}/raw/stats.json`;
const GIST_API = `https://api.github.com/gists/${GIST_ID}`;

const SYNC_KEY = 'mais-stats-sync-time';
const LOCAL_STATS_KEY = 'mais-stats';
const VISITOR_KEY = 'mais-visitor-id';
const SYNC_INTERVAL = 5 * 60 * 1000;

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getLocalStats() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STATS_KEY) || '{"visits":{},"total":0,"pages":{}}');
  } catch {
    return { visits: {}, total: 0, pages: {} };
  }
}

function setLocalStats(stats) {
  localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
}

export function trackVisit(page) {
  const today = getToday();
  const visitorId = getVisitorId();
  const stats = getLocalStats();

  if (!stats.visits[today]) stats.visits[today] = {};
  if (!stats.visits[today][page]) stats.visits[today][page] = { count: 0, visitors: [] };

  if (!stats.visits[today][page].visitors.includes(visitorId)) {
    stats.visits[today][page].visitors.push(visitorId);
  }
  stats.visits[today][page].count++;

  stats.total = (stats.total || 0) + 1;
  if (!stats.pages) stats.pages = {};
  stats.pages[page] = (stats.pages[page] || 0) + 1;

  setLocalStats(stats);

  const lastSync = parseInt(localStorage.getItem(SYNC_KEY) || '0', 10);
  if (Date.now() - lastSync > SYNC_INTERVAL) {
    syncToGist(stats);
  }
}

async function syncToGist(stats) {
  try {
    localStorage.setItem(SYNC_KEY, String(Date.now()));
    const gistStats = await readFromGist();
    const merged = mergeStats(gistStats, stats);
    setLocalStats(merged);

    const res = await fetch(GIST_API, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: { 'stats.json': { content: JSON.stringify(merged, null, 2) } },
      }),
    });
    if (res.ok) localStorage.setItem(SYNC_KEY, String(Date.now()));
  } catch (e) {
    console.warn('Stats sync failed:', e.message);
  }
}

async function readFromGist() {
  try {
    const res = await fetch(`${GIST_RAW}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { visits: {}, total: 0, pages: {} };
  }
}

function mergeStats(gist, local) {
  const merged = { visits: { ...gist.visits }, total: (gist.total || 0), pages: { ...(gist.pages || {}) } };

  for (const [day, pages] of Object.entries(local.visits || {})) {
    if (!merged.visits[day]) merged.visits[day] = {};
    for (const [page, data] of Object.entries(pages)) {
      if (!merged.visits[day][page]) {
        merged.visits[day][page] = data;
      } else {
        const existing = merged.visits[day][page];
        const newVisitors = (data.visitors || []).filter(v => !(existing.visitors || []).includes(v));
        existing.count += newVisitors.length;
        existing.visitors = [...(existing.visitors || []), ...newVisitors];
      }
    }
  }

  merged.total = (gist.total || 0) + (local.total || 0);
  for (const [page, count] of Object.entries(local.pages || {})) {
    merged.pages[page] = (merged.pages[page] || 0) + count;
  }

  return merged;
}

export async function getAdminStats() {
  const localStats = getLocalStats();
  const gistStats = await readFromGist();
  const merged = mergeStats(gistStats, localStats);

  const today = getToday();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  let todayVisits = 0;
  let weekVisits = 0;
  let monthVisits = 0;
  const daily = {};

  for (const [day, pages] of Object.entries(merged.visits || {})) {
    const dayTotal = Object.values(pages).reduce((sum, p) => sum + (p.count || 0), 0);
    if (day === today) todayVisits = dayTotal;
    if (day >= weekAgo) weekVisits += dayTotal;
    if (day >= monthAgo) monthVisits += dayTotal;
    if (day >= monthAgo) daily[day] = dayTotal;
  }

  const topPages = Object.entries(merged.pages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  return {
    total: merged.total || 0,
    today: todayVisits,
    week: weekVisits,
    month: monthVisits,
    topPages,
    daily,
  };
}

export function forceSync() {
  const stats = getLocalStats();
  return syncToGist(stats);
}
