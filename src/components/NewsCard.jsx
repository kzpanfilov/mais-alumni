import { motion } from 'framer-motion';

export default function NewsCard({ item, index = 0 }) {
  const categoryColors = {
    встреча: '#6c5ce7',
    достижение: '#00b894',
    школа: '#fd79a8',
    воспоминание: '#fdcb6e',
    новость: '#74b9ff',
  };

  return (
    <motion.div
      className="news-card"
      style={{ borderLeftColor: categoryColors[item.category] || '#6c5ce7' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <span
        className="news-category"
        style={{ background: categoryColors[item.category] || '#6c5ce7' }}
      >
        {item.category}
      </span>
      <h3>{item.title}</h3>
      <div className="news-date">{new Date(item.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <p>{item.text}</p>
    </motion.div>
  );
}
