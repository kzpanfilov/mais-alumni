import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import { fetchClassmates, saveClassmates, uploadPhotoToCloudinary } from '../data/jsonbin';

export default function AddClassmate() {
  const [formData, setFormData] = useState({
    name: '',
    className: '11а',
    role: '',
    memory: '',
    occupation: '',
    city: '',
    phone: '',
    vk: '',
    thenPhoto: null,
    nowPhoto: null,
  });
  const [nowPhotoPreview, setNowPhotoPreview] = useState(null);
  const [thenPhotoPreview, setThenPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const nowInputRef = useRef(null);
  const thenInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (type === 'now') {
        setNowPhotoPreview(dataUrl);
      } else {
        setThenPhotoPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setUploading(true);

    try {
      let thenPhotoUrl = formData.thenPhoto;
      let nowPhotoUrl = formData.nowPhoto;

      if (thenPhotoPreview && !thenPhotoUrl) {
        const base64 = thenPhotoPreview.split(',')[1];
        thenPhotoUrl = await uploadPhotoToCloudinary(base64);
      }

      if (nowPhotoPreview && !nowPhotoUrl) {
        const base64 = nowPhotoPreview.split(',')[1];
        nowPhotoUrl = await uploadPhotoToCloudinary(base64);
      }

      const existing = await fetchClassmates();
      const newClassmate = {
        ...formData,
        thenPhoto: thenPhotoUrl,
        nowPhoto: nowPhotoUrl,
        id: Date.now(),
        addedAt: new Date().toISOString(),
      };
      const updated = [...existing, newClassmate];
      await saveClassmates(updated);
      setSubmitted(true);
    } catch (err) {
      alert('Ошибка загрузки фото. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', className: '11а', role: '', memory: '', occupation: '', city: '', phone: '', vk: '', thenPhoto: null, nowPhoto: null });
    setNowPhotoPreview(null);
    setThenPhotoPreview(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '2px solid var(--border)', fontSize: '0.95rem',
    outline: 'none', transition: 'border 0.2s',
  };

  const photoUploadStyle = {
    display: 'flex', alignItems: 'center', gap: 12, padding: 16,
    border: '2px dashed var(--border)', borderRadius: 12,
    cursor: 'pointer', transition: 'border-color 0.2s',
    background: 'var(--bg-primary)',
  };

  if (submitted) {
    return (
      <div>
        <HeroSection
          title="Спасибо!"
          subtitle="Ваш одноклассник добавлен. Скоро он появится на сайте."
          gradient="linear-gradient(135deg, #00b894 0%, #55efc4 100%)"
        />
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ fontSize: '4rem', marginBottom: 20 }}
            >
              ✅
            </motion.div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              Данные сохранены. Чтобы добавить ещё — нажмите кнопку ниже.
            </p>
            <button
              className="cta-button"
              onClick={resetForm}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              Добавить ещё
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        title="Добавить одноклассника"
        subtitle="Расскажите о себе или о друге — мы добавим на сайт"
        badge="Анкета выпускника"
        gradient="linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)"
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              padding: 32,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                ФИО *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Иванов Иван Иванович"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  Класс
                </label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  style={{ ...inputStyle, background: 'white' }}
                >
                  <option value="11а">11а</option>
                  <option value="11б">11б</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  Роль в классе
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Староста, отличник..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                Воспоминание о школе
              </label>
              <textarea
                name="memory"
                value={formData.memory}
                onChange={handleChange}
                rows={4}
                placeholder="Что запомнилось больше всего? Какой-нибудь смешной случай..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  Профессия сейчас
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Инженер, врач..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  Город
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Пенза, Никольск..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  Телефон (необязательно)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (___) ___-__-__"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                  VK / Одноклассники (ссылка)
                </label>
                <input
                  type="url"
                  name="vk"
                  value={formData.vk}
                  onChange={handleChange}
                  placeholder="https://vk.com/..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>
                Фотографии
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <input
                    ref={thenInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'then')}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => thenInputRef.current?.click()}
                    style={photoUploadStyle}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {thenPhotoPreview ? (
                      <img src={thenPhotoPreview} alt="Фото школьное " style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>📷</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Фото школьное </div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Нажмите для загрузки</div>
                    </div>
                  </div>
                </div>
                <div>
                  <input
                    ref={nowInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'now')}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => nowInputRef.current?.click()}
                    style={photoUploadStyle}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {nowPhotoPreview ? (
                      <img src={nowPhotoPreview} alt="Фото сейчас" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>📷</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Фото сейчас</div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Нажмите для загрузки</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                width: '100%', padding: '12px 24px', borderRadius: 50,
                background: uploading ? '#ccc' : 'var(--accent)', color: 'white', border: 'none',
                fontSize: '1rem', fontWeight: 600, cursor: uploading ? 'wait' : 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => !uploading && (e.target.style.transform = 'scale(1.02)')}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
              {uploading ? '⏳ Загрузка фото...' : 'Добавить одноклассника'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.8rem', marginTop: 12 }}>
              Фото загружаются на защищённое хранилище
            </p>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
