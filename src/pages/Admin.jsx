import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import NewsEditor from '../components/NewsEditor';
import { isAdmin, uploadPhotoToCloudinary, getToken, authUsers, authCreateUser, authResetPassword } from '../data/jsonbin';
import { fetchNews, addNews, updateNews, deleteNews } from '../data/newsData';
import { fetchGallery, addGalleryItem, deleteGalleryItem } from '../data/galleryData';
import { getAdminStats, forceSync } from '../data/statsData';

export default function Admin() {
  const [tab, setTab] = useState('news');
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserClass, setNewUserClass] = useState('');
  const [resetLogin, setResetLogin] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [userError, setUserError] = useState('');
  const galleryRef = useRef(null);

  useEffect(() => {
    if (!isAdmin()) return;
    Promise.all([fetchNews(), fetchGallery(), getAdminStats(), authUsers(getToken())]).then(([n, g, s, u]) => {
      setNews(n);
      setGallery(g);
      setStats(s);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  if (!isAdmin()) {
    return (
      <div>
        <HeroSection title="Доступ запрещён" gradient="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)" />
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              Эта страница доступна только администратору.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const handleSaveNews = async (data) => {
    if (editingNews) {
      await updateNews(editingNews.id, data);
    } else {
      await addNews(data);
    }
    const updated = await fetchNews();
    setNews(updated);
    setEditingNews(null);
    setShowNewsForm(false);
  };

  const handleDeleteNews = async (id) => {
    if (!confirm('Удалить новость?')) return;
    await deleteNews(id);
    setNews(await fetchNews());
  };

  const handleAddGallery = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const title = prompt('Название фото:');
    if (!title) return;
    const category = prompt('Категория (например: "Наше село" или "Выпускники"):', 'Наше село') || 'Наше село';
    const year = prompt('Год (если известен):', '') || '';

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target.result.split(',')[1];
        const src = await uploadPhotoToCloudinary(base64);
        const item = { title, year, src, description: title, category };
        await addGalleryItem(item);
        setGallery(await fetchGallery());
      } catch (err) {
        alert('Ошибка загрузки: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteGallery = async (id) => {
    if (!confirm('Удалить фото из галереи?')) return;
    await deleteGalleryItem(id);
    setGallery(await fetchGallery());
  };

  const btnStyle = {
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem', transition: 'transform 0.2s',
  };

  const dangerBtn = { ...btnStyle, background: '#e74c3c', color: 'white' };
  const primaryBtn = { ...btnStyle, background: 'var(--accent)', color: 'white' };
  const secondaryBtn = { ...btnStyle, background: 'white', border: '1px solid var(--border)', color: '#333' };

  return (
    <div>
      <HeroSection
        title="Админ-панель"
        subtitle="Управление новостями и галереей"
        gradient="linear-gradient(135deg, #2d3436 0%, #636e72 100%)"
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>

          <div className="admin-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setTab('news')} style={{
              ...btnStyle,
              background: tab === 'news' ? 'var(--accent)' : '#eee',
              color: tab === 'news' ? 'white' : '#333',
            }}>Новости</button>
            <button onClick={() => setTab('gallery')} style={{
              ...btnStyle,
              background: tab === 'gallery' ? 'var(--accent)' : '#eee',
              color: tab === 'gallery' ? 'white' : '#333',
            }}>Галерея</button>
            <button onClick={() => setTab('stats')} style={{
              ...btnStyle,
              background: tab === 'stats' ? 'var(--accent)' : '#eee',
              color: tab === 'stats' ? 'white' : '#333',
            }}>Статистика</button>
            <button onClick={() => setTab('users')} style={{
              ...btnStyle,
              background: tab === 'users' ? 'var(--accent)' : '#eee',
              color: tab === 'users' ? 'white' : '#333',
            }}>Пользователи</button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Загрузка...</p>
          ) : tab === 'news' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Новости ({news.length})</h2>
                <button onClick={() => { setEditingNews(null); setShowNewsForm(true); }} style={primaryBtn}>
                  + Добавить
                </button>
              </div>

              <AnimatePresence>
                {showNewsForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 24, overflow: 'hidden' }}>
                    <NewsEditor
                      item={editingNews}
                      onSave={handleSaveNews}
                      onCancel={() => { setShowNewsForm(false); setEditingNews(null); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {news.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Новостей пока нет</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {news.map(item => (
                    <motion.div key={item.id} layout
                      style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, boxShadow: 'var(--shadow)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {item.image && (
                        <img src={item.image} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      )}
                      {item.video && !item.image && (
                        <div style={{ width: 80, height: 60, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', flexShrink: 0 }}>▶</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                          {item.category} · {new Date(item.date).toLocaleDateString('ru-RU')}
                          {item.video && ' · 🎬'}
                        </div>
                        {item.text && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { setEditingNews(item); setShowNewsForm(true); }} style={{ ...secondaryBtn, padding: '6px 12px', fontSize: '0.8rem' }}>✎</button>
                        <button onClick={() => handleDeleteNews(item.id)} style={{ ...dangerBtn, padding: '6px 12px', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === 'stats' ? (
            <div>
              {stats ? (
                <div>
                  <div className="admin-stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Статистика</h2>
                    <button onClick={async () => {
                      setSyncing(true);
                      await forceSync();
                      setStats(await getAdminStats());
                      setSyncing(false);
                    }} disabled={syncing} style={secondaryBtn}>
                      {syncing ? 'Синхронизация...' : '🔄 Синхронизировать'}
                    </button>
                  </div>

                  <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                      { label: 'Всего визитов', value: stats.total },
                      { label: 'Сегодня', value: stats.today },
                      { label: 'За неделю', value: stats.week },
                      { label: 'За месяц', value: stats.month },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 20, boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Топ страниц</h3>
                  {stats.topPages.length === 0 ? (
                    <p style={{ color: 'var(--text-light)' }}>Нет данных</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                      {stats.topPages.map(({ page, count }, i) => (
                        <div key={page} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', borderRadius: 8, padding: '10px 16px', boxShadow: 'var(--shadow)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-light)', width: 24, textAlign: 'center', fontSize: '0.85rem' }}>{i + 1}</span>
                          <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>{page}</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Активность за 30 дней</h3>
                  {Object.keys(stats.daily).length === 0 ? (
                    <p style={{ color: 'var(--text-light)' }}>Нет данных</p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140, background: 'var(--bg-card)', borderRadius: 10, padding: 16, boxShadow: 'var(--shadow)' }}>
                      {(() => {
                        const days = [];
                        for (let i = 29; i >= 0; i--) {
                          const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                          days.push({ date: d, count: stats.daily[d] || 0 });
                        }
                        const max = Math.max(...days.map(d => d.count), 1);
                        return days.map(({ date, count }) => (
                          <div key={date} title={`${date}: ${count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                            <div style={{ width: '100%', background: count ? 'var(--accent)' : '#e0e0e0', borderRadius: 3, height: `${Math.max((count / max) * 100, count ? 4 : 1)}%`, minHeight: count ? 4 : 1 }} />
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Загрузка статистики...</p>
              )}
            </div>
          ) : tab === 'users' ? (
            <div>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Пользователи ({users.length})</h2>

              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 20, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Создать пользователя</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Логин (ФамилияИ)"
                    value={newUserLogin}
                    onChange={e => setNewUserLogin(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Пароль"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Имя (Фамилия Имя)"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Класс (11а)"
                    value={newUserClass}
                    onChange={e => setNewUserClass(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem' }}
                  />
                </div>
                <button
                  onClick={async () => {
                    setUserError('');
                    setUserMessage('');
                    try {
                      await authCreateUser(getToken(), newUserLogin, newUserPassword, newUserName, newUserClass);
                      setUsers(await authUsers(getToken()));
                      setNewUserLogin('');
                      setNewUserPassword('');
                      setNewUserName('');
                      setNewUserClass('');
                      setUserMessage('Пользователь создан');
                    } catch (err) {
                      setUserError(err.message);
                    }
                  }}
                  disabled={!newUserLogin || !newUserPassword || !newUserName}
                  style={{
                    ...primaryBtn,
                    opacity: newUserLogin && newUserPassword && newUserName ? 1 : 0.5,
                  }}
                >
                  Создать
                </button>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 20, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Сбросить пароль</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <select
                    value={resetLogin}
                    onChange={e => setResetLogin(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem', minWidth: 200 }}
                  >
                    <option value="">Выберите пользователя</option>
                    {users.map(u => (
                      <option key={u.login} value={u.login}>{u.name} ({u.login})</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Новый пароль"
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={async () => {
                      setUserError('');
                      setUserMessage('');
                      if (!resetLogin || !resetPassword) return;
                      try {
                        await authResetPassword(getToken(), resetLogin, resetPassword);
                        setResetLogin('');
                        setResetPassword('');
                        setUserMessage('Пароль сброшен');
                      } catch (err) {
                        setUserError(err.message);
                      }
                    }}
                    disabled={!resetLogin || !resetPassword}
                    style={{
                      ...secondaryBtn,
                      opacity: resetLogin && resetPassword ? 1 : 0.5,
                    }}
                  >
                    Сбросить
                  </button>
                </div>
              </div>

              {userMessage && <p style={{ color: '#27ae60', fontSize: '0.85rem', marginBottom: 12 }}>{userMessage}</p>}
              {userError && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12 }}>{userError}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                  <div key={u.login} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 16px', boxShadow: 'var(--shadow)', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{u.login}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{u.className}</div>
                    <div style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4, background: u.role === 'admin' ? 'var(--accent)' : '#eee', color: u.role === 'admin' ? 'white' : '#666' }}>
                      {u.role === 'admin' ? 'Админ' : 'Участник'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Галерея ({gallery.length})</h2>
                <div>
                  <input ref={galleryRef} type="file" accept="image/*" onChange={handleAddGallery} style={{ display: 'none' }} />
                  <button onClick={() => galleryRef.current?.click()} style={primaryBtn}>+ Добавить фото</button>
                </div>
              </div>

              {gallery.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Фото пока нет</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {gallery.map(item => (
                    <motion.div key={item.id} layout
                      style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                      <img src={item.src} alt={item.title} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '8px 10px', background: 'var(--bg-card)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{item.category}{item.year && ` · ${item.year}`}</div>
                      </div>
                      <button onClick={() => handleDeleteGallery(item.id)} style={{
                        position: 'absolute', top: 6, right: 6,
                        background: 'rgba(231,76,60,0.9)', color: '#fff', border: 'none',
                        width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>✕</button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
