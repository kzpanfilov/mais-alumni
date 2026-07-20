import { useState } from 'react';
import { motion } from 'framer-motion';
import { fetchClassmates } from '../data/jsonbin';

const CLAIM_KEY = 'mais-my-profile';

export function getMyProfile() {
  try { return JSON.parse(localStorage.getItem(CLAIM_KEY) || 'null'); } catch { return null; }
}

export function clearMyProfile() {
  localStorage.removeItem(CLAIM_KEY);
}

export default function ProfileLogin({ onClaim }) {
  const [step, setStep] = useState(0); // 0=class, 1=name, 2=confirm
  const [className, setClassName] = useState('');
  const [name, setName] = useState('');
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClassmates = async (cls) => {
    setLoading(true);
    setClassName(cls);
    const all = await fetchClassmates();
    setClassmates(all.filter(c => c.className === cls).sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
    setStep(1);
  };

  const handleSelect = (n) => {
    setName(n);
    setStep(2);
  };

  const handleConfirm = () => {
    const me = classmates.find(c => c.name === name);
    if (me) {
      localStorage.setItem(CLAIM_KEY, JSON.stringify({ id: me.id, name: me.name, className: me.className }));
      onClaim(me);
    }
  };

  const cardStyle = {
    background: 'var(--bg-card)', borderRadius: 12,
    padding: 24, maxWidth: 420, margin: '40px auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid var(--border)',
  };

  const btnStyle = (active = false) => ({
    padding: '10px 16px', borderRadius: 8,
    border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
    background: active ? 'var(--accent-light, #e8f4fd)' : 'white',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    width: '100%', textAlign: 'left',
  });

  if (step === 0) {
    return (
      <motion.div style={cardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>Войти как выпускник</h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-light)' }}>Выберите свой класс</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => loadClassmates('11а')} style={btnStyle()}>11а</button>
          <button onClick={() => loadClassmates('11б')} style={btnStyle()}>11б</button>
        </div>
      </motion.div>
    );
  }

  if (step === 1) {
    return (
      <motion.div style={cardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 8, padding: 0 }}>← Назад</button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{className}</h3>
        <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-light)' }}>Найдите своё имя</p>
        {loading ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Загрузка...</p>
        ) : (
          <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {classmates.map(c => (
              <button key={c.id} onClick={() => handleSelect(c.name)} style={btnStyle(name === c.name)}>
                {c.name}
              </button>
            ))}
            {classmates.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Пока нет добавленных выпускников</p>}
          </div>
        )}
      </motion.div>
    );
  }

  if (step === 2) {
    return (
      <motion.div style={cardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 8, padding: 0 }}>← Назад</button>
        <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{name}</h3>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-light)' }}>Это вы? Подтвердите для редактирования своей карточки</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Нет</button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Да, это я</button>
        </div>
      </motion.div>
    );
  }

  return null;
}
