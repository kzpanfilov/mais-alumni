import { motion } from 'framer-motion';

export default function NewsCard({ item, index = 0 }) {
  const categoryColors = {
    встреча: '#6c5ce7',
    достижение: '#00b894',
    школа: '#fd79a8',
    воспоминание: '#fdcb6e',
    новость: '#74b9ff',
  };

  const renderMedia = () => {
    if (item.image) {
      return (
        <div style={{ margin: '12px 0', borderRadius: 8, overflow: 'hidden' }}>
          <img src={item.image} alt={item.title}
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />
        </div>
      );
    }
    if (item.video) {
      if (item.videoType === 'file') {
        return (
          <div style={{ margin: '12px 0', borderRadius: 8, overflow: 'hidden' }}>
            <video src={item.video} controls
              style={{ width: '100%', maxHeight: 350, display: 'block' }} />
          </div>
        );
      }
      return (
        <div style={{ margin: '12px 0', borderRadius: 8, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe src={item.video} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </div>
      );
    }
    return null;
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
      {renderMedia()}
      {item.text && <p>{item.text}</p>}
    </motion.div>
  );
}
