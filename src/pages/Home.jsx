import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import StudentCard from '../components/StudentCard';
import { schoolInfo } from '../data/schoolInfo';
import { fetchClassmates, getUser, logout, authLogin } from '../data/jsonbin';

export default function Home() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [user, setUser] = useState(() => getUser());
  const [myCard, setMyCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetchClassmates().then(data => {
      setTotalStudents(data.length);
      if (user) {
        const found = data.find(c => c.name === user.name);
        setMyCard(found || null);
      }
      setLoading(false);
    });
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const userData = await authLogin(login.trim(), password);
      localStorage.setItem('mais-user', JSON.stringify(userData));
      setUser(userData);
      setShowLogin(false);
      setLogin('');
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Ошибка входа');
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setMyCard(null);
  };

  const handleCardUpdate = (updated) => {
    setMyCard(updated);
  };

  return (
    <div>
      <HeroSection
        title="Маисская средняя школа"
        subtitle="Выпускники 11а и 11б классов — 2006 год. Ностальгия по нашим лучшим годам."
        badge="Выпуск 2006 · 20 лет спустя"
      />

      <div className="container">
        <div className="stats-bar">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="stat-number">{totalStudents}</span>
            <span className="stat-label">одноклассников</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="stat-number">20</span>
            <span className="stat-label">лет со дня выпуска</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="stat-number">2</span>
            <span className="stat-label">класса — 11а и 11б</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="stat-number">1939</span>
            <span className="stat-label">год основания школы</span>
          </motion.div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Добро пожаловать!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Этот сайт — маленький музей нашей школьной жизни
            </motion.p>
          </div>

          <div className="cards-grid">
            <Link to="/class11a">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📚 11а класс</h3>
                <p>Наши одноклассники из 11а — их воспоминания, фото, достижения. Каждый из них — особенный.</p>
              </motion.div>
            </Link>
            <Link to="/class11b">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📚 11б класс</h3>
                <p>Наши одноклассники из 11б — их истории, мечты, которые сбылись, и воспоминания о школе.</p>
              </motion.div>
            </Link>
            <Link to="/teachers">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>👩‍🏫 Наши учителя</h3>
                <p>Люди, которые дали нам знания и путевку в жизнь. Спасибо им за всё!</p>
              </motion.div>
            </Link>
            <Link to="/gallery">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📷 Галерея</h3>
                <p>Фотографии и видео из школьных лет — от первого звонка до последнего.</p>
              </motion.div>
            </Link>
            <Link to="/about">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>🏫 О школе</h3>
                <p>История Маисской средней школы — от 1939 года до наших дней.</p>
              </motion.div>
            </Link>
            <Link to="/news">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📰 Новости</h3>
                <p>Встречи, достижения, события — всё, что происходит в жизни наших выпускников.</p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div
            className="cta-section"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Помнишь тот последний звонок?</h2>
            <p>
              20 лет назад мы стояли во дворе школы и не верили, что всё закончилось.
              А сейчас — 20 лет спустя — мы снова вместе, хотя бы на этой странице.
            </p>
            <Link to="/add" className="cta-button">
              Добавить одноклассника
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Моя карточка
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Войдите, чтобы отредактировать свою карточку выпускника
            </motion.p>
          </div>

          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                padding: 40,
                maxWidth: 400,
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.5rem',
              }}>
                🔒
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Войдите, чтобы увидеть и отредактировать свою карточку
              </p>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '12px 32px', borderRadius: 50,
                  background: 'var(--accent)', color: 'white',
                  border: 'none', fontSize: '1rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Войти
              </button>
            </motion.div>
          ) : loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Загрузка...</p>
          ) : myCard ? (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <StudentCard
                student={myCard}
                index={0}
                myProfile={myCard}
                onDelete={handleCardUpdate}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 20px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'white',
                    cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)',
                  }}
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              padding: 40,
              maxWidth: 400,
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                Привет, <strong>{user.name}</strong>!
              </p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 16 }}>
                Ваша карточка пока не создана. Добавьте себя через форму.
              </p>
              <Link to="/add" style={{
                display: 'inline-block',
                padding: '12px 32px', borderRadius: 50,
                background: 'var(--accent)', color: 'white',
                textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
              }}>
                Добавить карточку
              </Link>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 20px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'white',
                    cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)',
                  }}
                >
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: 40,
                maxWidth: 400,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.5rem',
              }}>
                🔒
              </div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Вход</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                Логин: фамилия + первая буква имени
              </p>

              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  value={login}
                  onChange={e => { setLogin(e.target.value); setLoginError(''); }}
                  placeholder="Логин (например: КузянинМ)"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 8,
                    border: `2px solid ${loginError ? '#e74c3c' : 'var(--border)'}`,
                    fontSize: '1rem', textAlign: 'center',
                    outline: 'none', boxSizing: 'border-box', marginBottom: 12,
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Пароль"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 8,
                    border: `2px solid ${loginError ? '#e74c3c' : 'var(--border)'}`,
                    fontSize: '1rem', textAlign: 'center',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />

                {loginError && (
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 8 }}>{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={!login.trim() || !password || loginLoading}
                  style={{
                    width: '100%', padding: '12px 24px', borderRadius: 50,
                    background: login.trim() && password ? 'var(--accent)' : '#ccc',
                    color: 'white', border: 'none',
                    fontSize: '1rem', fontWeight: 600,
                    cursor: login.trim() && password ? 'pointer' : 'not-allowed',
                    marginTop: 16,
                  }}
                >
                  {loginLoading ? 'Вход...' : 'Войти'}
                </button>
              </form>

              <button
                onClick={() => setShowLogin(false)}
                style={{
                  marginTop: 16, background: 'none', border: 'none',
                  color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.85rem',
                }}
              >
                Отмена
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
