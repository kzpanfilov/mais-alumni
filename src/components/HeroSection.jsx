import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL || '/';
const DEFAULT_BG = `${BASE}photos/school.jpg`;
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

export default function HeroSection({ title, subtitle, badge, gradient, backgroundImage }) {
  const bg = backgroundImage ?? DEFAULT_BG;
  const grad = gradient || DEFAULT_GRADIENT;

  return (
    <div className="hero">
      {bg && (
        <div
          className="hero-bg-image"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="hero-bg-overlay" style={{ background: grad, opacity: 0.85 }} />
        </div>
      )}
      {!bg && (
        <div style={{ position: 'absolute', inset: 0, background: grad, zIndex: 0 }} />
      )}
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {badge && <span className="year-badge">{badge}</span>}
      </motion.div>
    </div>
  );
}
