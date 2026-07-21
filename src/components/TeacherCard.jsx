import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { isAdmin, uploadPhotoToCloudinary } from '../data/jsonbin';

export default function TeacherCard({ teacher, index = 0, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: teacher.name, subject: teacher.subject, memory: teacher.memory || '' });
  const [photoPreview, setPhotoPreview] = useState(teacher.photo || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const admin = isAdmin();

  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoPreview(ev.target.result); setPhotoFile(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photo = teacher.photo;
      if (photoFile) {
        const base64 = photoFile.split(',')[1];
        photo = await uploadPhotoToCloudinary(base64);
      }
      const updated = { ...teacher, ...form, photo };
      if (onUpdate) onUpdate(updated);
      setEditing(false);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirm(`Удалить ${teacher.name}?`)) return;
    if (onDelete) onDelete(teacher.id);
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--border)', fontSize: '0.85rem',
    outline: 'none', boxSizing: 'border-box',
  };

  if (editing) {
    return (
      <motion.div
        className="teacher-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', padding: 20 }}
      >
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>ФИО</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Предмет</label>
          <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Воспоминание</label>
          <textarea value={form.memory} onChange={e => setForm({ ...form, memory: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Фото</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <div onClick={() => fileRef.current?.click()} style={{
            border: '2px dashed var(--border)', borderRadius: 8, padding: 12,
            cursor: 'pointer', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60,
          }}>
            {photoPreview ? (
              <img src={photoPreview} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} alt="" />
            ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Нажмите для загрузки</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(false)} style={{
            flex: 1, padding: '8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'white',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
          }}>Отмена</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: '8px', borderRadius: 6,
            border: 'none', background: 'var(--accent)', color: 'white',
            cursor: saving ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.8rem',
          }}>{saving ? '...' : 'Сохранить'}</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="teacher-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ position: 'relative' }}
    >
      {admin && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} title="Редактировать" style={{
            background: '#0984e3', color: '#fff', border: 'none',
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✎</button>
          <button onClick={handleDelete} title="Удалить" style={{
            background: '#e74c3c', color: '#fff', border: 'none',
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
      )}
      {teacher.photo ? (
        <img src={teacher.photo} alt={teacher.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
      ) : (
        <div className="teacher-avatar">{initials}</div>
      )}
      <div className="teacher-info">
        <h3>{teacher.name}</h3>
        <div className="teacher-subject">{teacher.subject}</div>
        {teacher.memory && <p className="teacher-memory">"{teacher.memory}"</p>}
      </div>
    </motion.div>
  );
}
