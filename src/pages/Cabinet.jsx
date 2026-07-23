import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import { getUser, getToken, authChangePassword, logout } from '../data/jsonbin';

export default function Cabinet() {
  const user = getUser();
  const token = getToken();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div>
        <HeroSection
          title="Личный кабинет"
          subtitle="Управление аккаунтом"
          gradient="linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
        />
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Войдите, чтобы получить доступ к кабинету.</p>
          </div>
        </section>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }

    setLoading(true);
    try {
      await authChangePassword(token, oldPassword, newPassword);
      setMessage('Пароль успешно изменён');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: 32,
    maxWidth: 500,
    margin: '0 auto',
  };

  return (
    <div>
      <HeroSection
        title="Личный кабинет"
        subtitle={user.name}
        gradient="linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
      />

      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 24 }}>Мой профиль</h2>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 4 }}>Имя</p>
                <p style={{ fontWeight: 600 }}>{user.name}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 4 }}>Класс</p>
                <p style={{ fontWeight: 600 }}>{user.className || '—'}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 4 }}>Роль</p>
                <p style={{ fontWeight: 600 }}>{user.role === 'admin' ? 'Администратор' : 'Участник'}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 4 }}>Логин</p>
                <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{user.token}</p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

              <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Изменить пароль</h3>

              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '2px solid var(--border)', fontSize: '0.95rem',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '2px solid var(--border)', fontSize: '0.95rem',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '2px solid var(--border)', fontSize: '0.95rem',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {error && (
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>
                )}

                {message && (
                  <p style={{ color: '#27ae60', fontSize: '0.85rem', marginBottom: 12 }}>{message}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !oldPassword || !newPassword}
                  style={{
                    width: '100%', padding: '12px 24px', borderRadius: 50,
                    background: oldPassword && newPassword ? 'var(--accent)' : '#ccc',
                    color: 'white', border: 'none',
                    fontSize: '1rem', fontWeight: 600,
                    cursor: oldPassword && newPassword ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading ? 'Сохранение...' : 'Изменить пароль'}
                </button>
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: 50,
                  background: 'transparent', color: '#e74c3c',
                  border: '2px solid #e74c3c', fontSize: '1rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.target.style.background = '#e74c3c'; e.target.style.color = 'white'; }}
                onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#e74c3c'; }}
              >
                Выйти из аккаунта
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
