import { motion } from 'framer-motion';

export default function Loading({ text = 'Загрузка...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 16,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
      <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{text}</span>
    </div>
  );
}
