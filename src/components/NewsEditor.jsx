import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const CLOUDINARY_CLOUD = 'tkurdji3';
const CLOUDINARY_UPLOAD_PRESET = 'mais-alumni';

const CATEGORIES = ['встреча', 'достижение', 'школа', 'воспоминание', 'новость'];

function parseVideoUrl(url) {
  if (!url) return null;
  const u = url.trim();

  if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) {
    const match = u.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? { type: 'youtube', embed: `https://www.youtube.com/embed/${match[1]}` } : null;
  }

  if (u.includes('vk.com/video') || u.includes('vk.com/video_ext')) {
    return { type: 'vk', embed: u.replace('watch?', 'video_ext.php?') };
  }

  if (u.includes('rutube.ru/video/')) {
    const match = u.match(/rutube\.ru\/video\/([a-f0-9]+)/);
    return match ? { type: 'rutube', embed: `https://rutube.ru/play/embed/${match[1]}` } : null;
  }

  return null;
}

export default function NewsEditor({ item, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    category: item?.category || 'новость',
    text: item?.text || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    image: item?.image || null,
    video: item?.video || null,
    videoType: item?.videoType || null,
  });
  const [imagePreview, setImagePreview] = useState(item?.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(item?.video || '');
  const [videoMode, setVideoMode] = useState(item?.videoType === 'file' ? 'file' : 'url');
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);
  const videoFileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImagePreview(ev.target.result); setImageFile(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setForm(f => ({ ...f, videoType: 'file' }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Введите заголовок'); return; }
    setSaving(true);
    try {
      let imageUrl = form.image;
      let video = form.video;
      let videoType = form.videoType;

      if (imageFile) {
        const base64 = imageFile.split(',')[1];
        const formData = new FormData();
        formData.append('file', `data:image/jpeg;base64,${base64}`);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'mais-alumni/news');
        const res = await fetch(`https://api.cloudinary.com/v1_/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Image upload failed');
        imageUrl = (await res.json()).secure_url;
      }

      if (videoMode === 'file' && videoFile) {
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'mais-alumni/news');
        formData.append('resource_type', 'video');
        const res = await fetch(`https://api.cloudinary.com/v1_/${CLOUDINARY_CLOUD}/video/upload`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Video upload failed');
        video = (await res.json()).secure_url;
        videoType = 'file';
      } else if (videoMode === 'url' && videoUrl.trim()) {
        const parsed = parseVideoUrl(videoUrl);
        if (parsed) {
          video = parsed.embed;
          videoType = parsed.type;
        } else {
          alert('Не удалось распознать ссылку на видео. Поддерживаются: YouTube, VK, Rutube');
          setSaving(false);
          return;
        }
      } else {
        video = null;
        videoType = null;
      }

      onSave({
        ...form,
        image: imageUrl,
        video,
        videoType,
      });
    } catch (err) {
      alert('Ошибка сохранения: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '2px solid var(--border)', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };

  const sectionStyle = { marginBottom: 20 };

  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }}>

      <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>
        {item ? 'Редактировать новость' : 'Новая новость'}
      </h3>

      <div style={sectionStyle}>
        <label style={labelStyle}>Заголовок *</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Заголовок новости" style={inputStyle} />
      </div>

      <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Категория</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ ...inputStyle, background: 'white' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Дата</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputStyle} />
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Текст</label>
        <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
          rows={6} placeholder="Текст новости..." style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Фото</label>
        <input ref={imageRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        <div onClick={() => imageRef.current?.click()} style={{
          border: '2px dashed var(--border)', borderRadius: 8, padding: 16,
          cursor: 'pointer', textAlign: 'center',
        }}>
          {imagePreview ? (
            <img src={imagePreview} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--text-light)' }}>Нажмите для загрузки фото</span>
          )}
        </div>
        {imagePreview && (
          <button onClick={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image: null })); }}
            style={{ marginTop: 8, padding: '4px 12px', borderRadius: 6, border: '1px solid #e74c3c', background: 'white', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}>
            Удалить фото
          </button>
        )}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Видео</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setVideoMode('url')} style={{
            padding: '6px 16px', borderRadius: 6, border: '2px solid var(--accent)',
            background: videoMode === 'url' ? 'var(--accent)' : 'white',
            color: videoMode === 'url' ? 'white' : 'var(--accent)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
          }}>Ссылка (YouTube/VK/Rutube)</button>
          <button onClick={() => setVideoMode('file')} style={{
            padding: '6px 16px', borderRadius: 6, border: '2px solid var(--accent)',
            background: videoMode === 'file' ? 'var(--accent)' : 'white',
            color: videoMode === 'file' ? 'white' : 'var(--accent)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
          }}>Загрузить файл</button>
        </div>

        {videoMode === 'url' ? (
          <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..." style={inputStyle} />
        ) : (
          <div>
            <input ref={videoFileRef} type="file" accept="video/*" onChange={handleVideoFileChange} style={{ display: 'none' }} />
            <div onClick={() => videoFileRef.current?.click()} style={{
              border: '2px dashed var(--border)', borderRadius: 8, padding: 16,
              cursor: 'pointer', textAlign: 'center',
            }}>
              {videoFile ? (
                <video src={videoUrl} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} controls />
              ) : (
                <span style={{ color: 'var(--text-light)' }}>Нажмите для загрузки видео</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border)',
          background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}>Отмена</button>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 1, padding: 10, borderRadius: 8, border: 'none',
          background: saving ? '#ccc' : 'var(--accent)', color: 'white',
          cursor: saving ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </div>
    </motion.div>
  );
}
