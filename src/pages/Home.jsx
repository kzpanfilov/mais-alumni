import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { schoolInfo } from '../data/schoolInfo';
import { fetchClassmates } from '../data/jsonbin';

export default function Home() {
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchClassmates().then(data => setTotalStudents(data.length));
  }, []);

  return (
    <div>
      <HeroSection
        title="Маисская средняя школа"
        subtitle="Выпускники 11а и 11б классов — 2006 год. Ностальгия по нашим лучшим годам."
        badge="Выпуск 2006 · 20 лет спустя"
      />

      <div className="container">
        <div className="stats-bar">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="stat-number">{totalStudents}</span>
            <span className="stat-label">одноклассников</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="stat-number">20</span>
            <span className="stat-label">лет со дня выпуска</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="stat-number">2</span>
            <span className="stat-label">класса — 11а и 11б</span>
          </motion.div>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="stat-number">1939</span>
            <span className="stat-label">год основания школы</span>
          </motion.div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Добро пожаловать!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Этот сайт — маленький музей нашей школьной жизни
            </motion.p>
          </div>

          <div className="cards-grid">
            <Link to="/class11a">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📚 11а класс</h3>
                <p>Наши одноклассники из 11а — их воспоминания, фото, достижения. Каждый из них — особенный.</p>
              </motion.div>
            </Link>
            <Link to="/class11b">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📚 11б класс</h3>
                <p>Наши одноклассники из 11б — их истории, мечты, которые сбылись, и воспоминания о школе.</p>
              </motion.div>
            </Link>
            <Link to="/teachers">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>👩‍🏫 Наши учителя</h3>
                <p>Люди, которые дали нам знания и путевку в жизнь. Спасибо им за всё!</p>
              </motion.div>
            </Link>
            <Link to="/gallery">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📷 Галерея</h3>
                <p>Фотографии и видео из школьных лет — от первого звонка до последнего.</p>
              </motion.div>
            </Link>
            <Link to="/about">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>🏫 О школе</h3>
                <p>История Маисской средней школы — от 1939 года до наших дней.</p>
              </motion.div>
            </Link>
            <Link to="/news">
              <motion.div
                className="tile-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3>📰 Новости</h3>
                <p>Встречи, достижения, события — всё, что происходит в жизни наших выпускников.</p>
              </motion.div>
            </Link>
          </div>
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
            <h2>Помнишь тот последний звонок?</h2>
            <p>
              20 лет назад мы стояли во дворе школы и не верили, что всё закончилось.
              А сейчас — 20 лет спустя — мы снова вместе, хотя бы на этой странице.
            </p>
            <Link to="/add" className="cta-button">
              Добавить одноклассника
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
