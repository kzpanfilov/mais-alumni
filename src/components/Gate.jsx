import { useState } from 'react';
import { motion } from 'framer-motion';

// SHA-256 hashes
// Key: MAIS2006
const USER_HASH = '84ec621a831280a1324daf83b4a14ce88f6f68d34f7578a59e5528cf08504587';
// Key: MAIS2006ADMIN
const ADMIN_HASH = '81d70d7bab32b2c4a20099942cbd6f59717418532821242cbc0392d2bff67ebe';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Gate({ onUnlock }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const hash = await sha256(key.trim().toUpperCase());

    if (hash === ADMIN_HASH) {
      localStorage.setItem('mais-gate', hash);
      localStorage.setItem('mais-admin', '1');
      onUnlock();
    } else if (hash === USER_HASH) {
      localStorage.setItem('mais-gate', hash);
      localStorage.removeItem('mais-admin');
      onUnlock();
    } else {
      setError(true);
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
          Введите ключ доступа для просмотра сайта
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(false); }}
            placeholder="Введите ключ..."
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: `2px solid ${error ? '#e74c3c' : 'var(--border)'}`,
              fontSize: '1rem', textAlign: 'center',
              outline: 'none', transition: 'border 0.2s',
              letterSpacing: 2, fontWeight: 600,
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 8 }}
            >
              Неверный ключ. Обратитесь к организатору.
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!key.trim() || loading}
            style={{
              width: '100%', padding: '12px 24px', borderRadius: 50,
              background: key.trim() ? 'var(--accent)' : '#ccc',
              color: 'white', border: 'none',
              fontSize: '1rem', fontWeight: 600,
              cursor: key.trim() ? 'pointer' : 'not-allowed',
              marginTop: 16, transition: 'background 0.2s',
            }}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>

        <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: 20 }}>
          Ключ можно получить у организатора встречи
        </p>
      </motion.div>
    </div>
  );
}
