import { useState } from 'react';
import { motion } from 'framer-motion';

const PHOTO_SERVER = 'https://178.176.80.52:8080';

export default function Gate({ onUnlock }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${PHOTO_SERVER}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Неверный логин или пароль');
        setLoading(false);
        return;
      }

      localStorage.setItem('mais-user', JSON.stringify({
        token: data.token,
        ...data.user,
      }));

      onUnlock();
    } catch (err) {
      setError('Ошибка подключения к серверу');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: 40,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '2rem',
        }}>
          🔒
        </div>

        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>
          Маисская средняя школа
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          Войдите, чтобы вспомнить школьные годы
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={login}
            onChange={(e) => { setLogin(e.target.value); setError(''); }}
            placeholder="Логин (например: КузянинМ)"
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: `2px solid ${error ? '#e74c3c' : 'var(--border)'}`,
              fontSize: '1rem', textAlign: 'center',
              outline: 'none', transition: 'border 0.2s',
              boxSizing: 'border-box', marginBottom: 12,
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Пароль"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: `2px solid ${error ? '#e74c3c' : 'var(--border)'}`,
              fontSize: '1rem', textAlign: 'center',
              outline: 'none', transition: 'border 0.2s',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 8 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!login.trim() || !password || loading}
            style={{
              width: '100%', padding: '12px 24px', borderRadius: 50,
              background: login.trim() && password ? 'var(--accent)' : '#ccc',
              color: 'white', border: 'none',
              fontSize: '1rem', fontWeight: 600,
              cursor: login.trim() && password ? 'pointer' : 'not-allowed',
              marginTop: 16, transition: 'background 0.2s',
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: 20 }}>
          Логин: фамилия + первая буква имени (например: КузянинМ)
        </p>
      </motion.div>
    </div>
  );
}
