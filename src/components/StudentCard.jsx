import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin, deleteClassmate, updateClassmate, uploadPhotoToCloudinary } from '../data/jsonbin';

const BASE = import.meta.env.BASE_URL || '/';

function PhotoLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <img src={src} alt={alt} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
        fontSize: '1.5rem', width: 44, height: 44, borderRadius: '50%',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </motion.div>
  );
}

function EditModal({ student, onSave, onClose, isOwner }) {
  const [form, setForm] = useState({
    name: student.name || '',
    className: student.className || '11а',
    role: student.role || '',
    memory: student.memory || '',
    occupation: student.occupation || '',
    city: student.city || '',
  });
  const [thenPreview, setThenPreview] = useState(student.thenPhoto || null);
  const [nowPreview, setNowPreview] = useState(student.nowPhoto || null);
  const [thenFile, setThenFile] = useState(null);
  const [nowFile, setNowFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const thenRef = useRef(null);
  const nowRef = useRef(null);

  const handleFile = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'then') { setThenPreview(ev.target.result); setThenFile(ev.target.result); }
      else { setNowPreview(ev.target.result); setNowFile(ev.target.result); }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let thenPhoto = student.thenPhoto;
      let nowPhoto = student.nowPhoto;

      if (thenFile) {
        const base64 = thenFile.split(',')[1];
        thenPhoto = await uploadPhotoToCloudinary(base64);
      }
      if (nowFile) {
        const base64 = nowFile.split(',')[1];
        nowPhoto = await uploadPhotoToCloudinary(base64);
      }

      const updates = { thenPhoto, nowPhoto };
      if (isAdmin()) {
        Object.assign(updates, form);
      } else {
        updates.memory = form.memory;
        updates.occupation = form.occupation;
        updates.city = form.city;
      }

      await updateClassmate(student.id, updates);
      onSave({ ...student, ...updates });
    } catch (err) {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--border)', fontSize: '0.85rem',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="modal-content"
        style={{
          background: 'var(--bg-card)', borderRadius: 12,
          padding: 24, maxWidth: 480, width: '100%',
          maxHeight: '85vh', overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>
          {isOwner ? 'Редактировать мою карточку' : `Редактировать: ${student.name}`}
        </h3>

        {isAdmin() && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>ФИО</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Класс</label>
                <select value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} style={{ ...inputStyle, background: 'white' }}>
                  <option value="11а">11а</option>
                  <option value="11б">11б</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Роль</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle} placeholder="Староста..." />
              </div>
            </div>
          </>
        )}

        <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Профессия</label>
            <input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Город</label>
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Воспоминание</label>
          <textarea value={form.memory} onChange={e => setForm({ ...form, memory: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Фото школьное</label>
            <input ref={thenRef} type="file" accept="image/*" onChange={e => handleFile(e, 'then')} style={{ display: 'none' }} />
            <div onClick={() => thenRef.current?.click()} style={{
              border: '2px dashed var(--border)', borderRadius: 8, padding: 12,
              cursor: 'pointer', textAlign: 'center', minHeight: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {thenPreview ? (
                <img src={thenPreview} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} alt="" />
              ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Нажмите</span>}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.8rem' }}>Фото сейчас</label>
            <input ref={nowRef} type="file" accept="image/*" onChange={e => handleFile(e, 'now')} style={{ display: 'none' }} />
            <div onClick={() => nowRef.current?.click()} style={{
              border: '2px dashed var(--border)', borderRadius: 8, padding: 12,
              cursor: 'pointer', textAlign: 'center', minHeight: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {nowPreview ? (
                <img src={nowPreview} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} alt="" />
              ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Нажмите</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'white',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>Отмена</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: 'none', background: 'var(--accent)', color: 'white',
            cursor: saving ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StudentCard({ student, index = 0, onDelete, myProfile }) {
  const [editing, setEditing] = useState(false);
  const [updatedStudent, setUpdatedStudent] = useState(student);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  const initials = updatedStudent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  const photo = (p) => p ? (p.startsWith('/') ? BASE + p.slice(1) : p) : null;
  const nowPhoto = photo(updatedStudent.nowPhoto);
  const thenPhoto = photo(updatedStudent.thenPhoto);
  const admin = isAdmin();
  const isOwner = myProfile && myProfile.id === updatedStudent.id;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Удалить ${updatedStudent.name}?`)) return;
    await deleteClassmate(updatedStudent.id);
    if (onDelete) onDelete(updatedStudent.id);
  };

  const handleSave = (updated) => {
    setUpdatedStudent(updated);
    setEditing(false);
  };

  const editBtn = (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Редактировать"
      style={{
        background: '#0984e3', color: '#fff', border: 'none',
        width: 28, height: 28, borderRadius: '50%',
        cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >✎</button>
  );

  const deleteBtn = (
    <button
      onClick={handleDelete}
      title="Удалить"
      style={{
        background: '#e74c3c', color: '#fff', border: 'none',
        width: 28, height: 28, borderRadius: '50%',
        cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >✕</button>
  );

  return (
    <>
      <motion.div
        className="student-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        style={isOwner ? { border: '2px solid var(--accent)', position: 'relative' } : undefined}
      >
        {(admin || isOwner) && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
            {(admin || isOwner) && editBtn}
            {admin && deleteBtn}
          </div>
        )}
        <div className="student-card-header">
          {nowPhoto ? (
            <img src={nowPhoto} alt={updatedStudent.name} className="student-avatar-photo"
              style={{ cursor: 'pointer' }}
              onClick={() => { setLightboxSrc(nowPhoto); setLightboxAlt(updatedStudent.name); }}
            />
          ) : (
            <div className="student-avatar">{initials}</div>
          )}
          <div className="student-info">
            <h3>{updatedStudent.name}</h3>
            {updatedStudent.role && <div className="student-role">{updatedStudent.role}</div>}
          </div>
        </div>
        <div className="student-card-body">
          <div className="photo-comparison">
            <div className="photo-frame">
              {thenPhoto ? (
                <img src={thenPhoto} alt="Фото тех лет" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => { setLightboxSrc(thenPhoto); setLightboxAlt(`${updatedStudent.name} — фото тех лет`); }}
                />
              ) : (
                <div className="placeholder">
                  <span className="icon">📷</span>
                  Фото тех лет
                </div>
              )}
              <div className="photo-label">До 2006</div>
            </div>
            <div className="photo-frame">
              {nowPhoto ? (
                <img src={nowPhoto} alt="Фото сейчас" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  onClick={() => { setLightboxSrc(nowPhoto); setLightboxAlt(`${updatedStudent.name} — фото сейчас`); }}
                />
              ) : (
                <div className="placeholder">
                  <span className="icon">📷</span>
                  Фото сейчас
                </div>
              )}
              <div className="photo-label">Сейчас</div>
            </div>
          </div>
          {updatedStudent.memory && <p className="student-memory">"{updatedStudent.memory}"</p>}
          <div className="student-details">
            {updatedStudent.occupation && (
              <span className="student-tag">💼 {updatedStudent.occupation}</span>
            )}
            {updatedStudent.city && (
              <span className="student-tag">📍 {updatedStudent.city}</span>
            )}
          </div>
        </div>
      </motion.div>

      {editing && (
        <EditModal
          student={updatedStudent}
          onSave={handleSave}
          onClose={() => setEditing(false)}
          isOwner={isOwner}
        />
      )}

      <AnimatePresence>
        {lightboxSrc && (
          <PhotoLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
