import HeroSection from '../components/HeroSection';
import Timeline from '../components/Timeline';
import { schoolInfo } from '../data/schoolInfo';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div>
      <HeroSection
        title="О школе"
        subtitle="Маисская средняя школа — с 1939 года"
        badge={schoolInfo.address}
        gradient="linear-gradient(135deg, #00b894 0%, #00cec9 100%)"
      />

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Наша история</h2>
            <p>Более 80 лет школа воспитывает поколения</p>
          </div>

          <Timeline items={schoolInfo.history} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Факты о школе</h2>
          </div>

          <div className="cards-grid">
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3>📍 Адрес</h3>
              <p>{schoolInfo.address}</p>
            </motion.div>
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3>📞 Телефон</h3>
              <p>{schoolInfo.phone}</p>
            </motion.div>
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3>✉️ Email</h3>
              <p>{schoolInfo.email}</p>
            </motion.div>
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3>👨‍🏫 Директор в 2006</h3>
              <p>{schoolInfo.directorIn2006}</p>
            </motion.div>
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3>👨‍🏫 Директор сейчас</h3>
              <p>{schoolInfo.directorNow}</p>
            </motion.div>
            <motion.div
              className="tile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <h3>🏫 Статус</h3>
              <p>Филиал МБОУ СОШ №1 им. Б.А. Прозорова г. Никольска</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div
            className="cta-section"
            style={{ background: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Географические координаты</h2>
            <p>53.875459° с.ш., 46.029855° в.д. — там, где начиналось наше детство</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
