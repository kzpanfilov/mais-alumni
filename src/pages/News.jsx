import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import NewsCard from '../components/NewsCard';
import { fetchNews } from '../data/newsData';
import { motion } from 'framer-motion';

export default function News() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('все');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews().then(n => { setItems(n); setLoading(false); });
  }, []);

  const categories = ['все', ...new Set(items.map(n => n.category))];

  const filtered = filter === 'все'
    ? items
    : items.filter(n => n.category === filter);

  return (
    <div>
      <HeroSection
        title="Новости и воспоминания"
        subtitle="Всё, что происходит в жизни наших выпускников"
        badge="Добрые новости"
        gradient="linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)"
      />

      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
              Загрузка...
            </p>
          ) : (
            <>
              <div className="filter-bar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${filter === cat ? 'active' : ''}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'все' ? 'Все' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="news-grid">
                {filtered.map((item, index) => (
                  <NewsCard key={item.id} item={item} index={index} />
                ))}
              </div>

              {filtered.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}
                >
                  Нет новостей в этой категории
                </motion.p>
              )}
            </>
          )}
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
            <h2>Поделитесь воспоминанием</h2>
            <p>
              Расскажите нам о своей жизни после школы. Мы разместим ваши истории
              здесь — только добрые и хорошие!
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
