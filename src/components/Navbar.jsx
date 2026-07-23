import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin, getUser, logout } from '../data/jsonbin';

const PHOTO_SERVER = 'https://178.176.80.52:8080';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getUser());
  const [showLogin, setShowLogin] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUser(getUser());
  }, [location]);

  const publicLinks = [
    { to: '/', label: 'Главная' },
    { to: '/about', label: 'О школе' },
    { to: '/teachers', label: 'Учителя' },
    { to: '/gallery', label: 'Галерея' },
    { to: '/news', label: 'Новости' },
  ];

  const authLinks = [
    { to: '/chat', label: '💬 Чат' },
    { to: '/add', label: '+ Добавить' },
    { to: '/cabinet', label: '👤 Кабинет' },
    ...(isAdmin() ? [{ to: '/admin', label: '⚙ Админ' }] : []),
  ];

  const links = user ? [...publicLinks, ...authLinks] : publicLinks;

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/mais-alumni/';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${PHOTO_SERVER}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Неверный логин или пароль');
        setLoginLoading(false);
        return;
      }

      const userData = { token: data.token, ...data.user };
      localStorage.setItem('mais-user', JSON.stringify(userData));
      setUser(userData);
      setShowLogin(false);
      setLogin('');
      setPassword('');
      window.location.reload();
    } catch (err) {
      setLoginError('Ошибка подключения к серверу');
      setLoginLoading(false);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="logo-icon">М</div>
            <span>МШ 2006</span>
          </Link>

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} style={{
                background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none',
                opacity: 0.7, transition: 'opacity 0.2s',
              }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.7}>
                Выйти
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} style={{
                background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none',
                opacity: 0.7, transition: 'opacity 0.2s',
              }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.7}>
                Войти
              </button>
            )}
          </div>
        </div>
      </nav>

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
    </>
  );
}
