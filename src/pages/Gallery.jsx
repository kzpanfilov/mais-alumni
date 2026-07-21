import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import { fetchGallery } from '../data/galleryData';

const CLOUDINARY = 'https://res.cloudinary.com/tkurdji3/image/upload';
const PHOTOS = `${CLOUDINARY}/mais-alumni/`;

const staticGalleryItems = [
  { id: 1, title: 'Школа после ремонта', year: '2022', src: `${PHOTOS}school-renovated.jpg`, description: 'Школа после капитального ремонта', category: 'Наше село' },
  { id: 2, title: 'Внутри школы', year: '2022', src: `${PHOTOS}school-interior.jpg`, description: 'Обновлённые коридоры и классы', category: 'Наше село' },
  { id: 3, title: 'Ремонт школы', year: '2023', src: `${PHOTOS}school-repairs.jpg`, description: 'Ремонтные работы в школе', category: 'Наше село' },
  { id: 4, title: 'Панорама села', year: '', src: `${PHOTOS}village-panorama.jpg`, description: 'Вид на село Маис', category: 'Наше село' },
  { id: 5, title: 'Улица села', year: '', src: `${PHOTOS}village-street.jpg`, description: 'Центральная улица', category: 'Наше село' },
  { id: 6, title: 'Дома села', year: '', src: `${PHOTOS}village-houses.jpg`, description: 'Традиционные дома', category: 'Наше село' },
  { id: 7, title: 'Дом культуры', year: '2022', src: `${PHOTOS}dk-mais.jpg`, description: 'Дом культуры после ремонта', category: 'Наше село' },
  { id: 8, title: 'ДК до ремонта', year: '2021', src: `${PHOTOS}dk-before.jpg`, description: 'Дом культуры до ремонта', category: 'Наше село' },
  { id: 9, title: 'Храм', year: '', src: `${PHOTOS}church.jpg`, description: 'Храм Боголюбской Иконы Божией Матери', category: 'Наше село' },
  { id: 10, title: 'Мемориал', year: '', src: `${PHOTOS}memorial.jpg`, description: 'Памятник погибшим воинам', category: 'Наше село' },
  ...[1, 2, 3, 4, 6, 7, 10, 11, 12, 14, 15].map((n, i) => ({
    id: 11 + i, title: `Фото ${i + 1}`, year: '', src: `${PHOTOS}photo_${n}_2026-07-19_15-27-38.jpg`, description: 'Фото выпускников', category: 'Выпускники',
  })),
];

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index];
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh' }}>
        <motion.img key={item.id} src={item.src} alt={item.title}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          style={{ maxWidth: '90vw', maxHeight: '75vh', borderRadius: 8, display: 'block' }} />
        <div style={{ textAlign: 'center', marginTop: 12, color: '#fff' }}>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          {item.year && <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{item.year}</div>}
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.description}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: 4 }}>{index + 1} / {items.length}</div>
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '1.5rem', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#10005;</button>
      <button onClick={e => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '1.5rem', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8249;</button>
      <button onClick={e => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '1.5rem', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8250;</button>
    </motion.div>
  );
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState(staticGalleryItems);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchGallery().then(dynamic => {
      if (dynamic.length > 0) {
        const existingIds = new Set(staticGalleryItems.map(i => i.id));
        const newItems = dynamic.filter(i => !existingIds.has(i.id));
        setGalleryItems([...staticGalleryItems, ...newItems]);
      }
    });
  }, []);

  const categories = ['Все', ...new Set(galleryItems.map(i => i.category))];
  const filtered = activeCategory === 'Все' ? galleryItems : galleryItems.filter(i => i.category === activeCategory);

  return (
    <div>
      <HeroSection
        title="Галерея"
        subtitle="Фотографии села Маис и нашей школы из разных лет"
        badge={`${galleryItems.length} фотографий`}
      />
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Наша память</h2>
            <p>Школа, село, люди — всё, что осталось в наших воспоминаниях</p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setLightbox(null); }}
                style={{ padding: '8px 20px', borderRadius: 20, border: activeCategory === cat ? '2px solid #6c5ce7' : '2px solid #ddd', background: activeCategory === cat ? '#6c5ce7' : '#fff', color: activeCategory === cat ? '#fff' : '#333', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>
                {cat}
              </button>
            ))}
          </div>
          <div className="gallery-grid">
            {filtered.map((item, index) => (
              <motion.div key={item.id} className="gallery-item"
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }} whileHover={{ scale: 1.03 }}
                onClick={() => setLightbox(index)}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)', background: '#000', cursor: 'pointer' }}>
                <img src={item.src} alt={item.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '30px 12px 12px' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                  {item.year && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{item.year}</div>}
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 2 }}>{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <motion.div className="cta-section" style={{ background: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)' }}
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2>Есть фотографии?</h2>
            <p>Отправьте нам ваши школьные фотографии, и мы разместим их здесь. Каждое фото — это кусочек нашей общей памяти.</p>
          </motion.div>
        </div>
      </section>
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox items={filtered} index={lightbox} onClose={() => setLightbox(null)}
            onPrev={() => setLightbox(i => (i > 0 ? i - 1 : filtered.length - 1))}
            onNext={() => setLightbox(i => (i < filtered.length - 1 ? i + 1 : 0))} />
        )}
      </AnimatePresence>
    </div>
  );
}
