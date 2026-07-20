import { useState, useEffect, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import StudentCard from '../components/StudentCard';
import ProfileLogin, { getMyProfile, clearMyProfile } from '../components/ProfileLogin';
import Loading from '../components/Loading';
import { fetchClassmates, isAdmin } from '../data/jsonbin';

export default function Class11B() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myProfile, setMyProfile] = useState(getMyProfile);
  const admin = isAdmin();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClassmates();
      setStudents(data.filter(s => s.className === '11б'));
    } catch (e) {
      setError('Не удалось загрузить данные. Проверьте соединение с интернетом.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleClaim = (me) => setMyProfile(me);
  const handleLogout = () => { clearMyProfile(); setMyProfile(null); };

  return (
    <div>
      <HeroSection
        title="11б класс"
        subtitle="Выпуск 2006 года — наши одноклассники и их воспоминания"
        badge={loading ? '...' : `${students.length} выпускников`}
        gradient="linear-gradient(135deg, #fd79a8 0%, #e84393 100%)"
      />

      <section className="section">
        <div className="container">
          {!admin && (myProfile ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, marginBottom: 24, padding: '10px 16px',
              background: 'var(--accent-light, #e8f4fd)', borderRadius: 10,
              border: '1px solid var(--accent)', fontSize: '0.9rem',
            }}>
              <span>Вы вошли как <strong>{myProfile.name}</strong></span>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
                fontSize: '0.8rem', color: 'var(--text-light)',
              }}>Выйти</button>
            </div>
          ) : (
            <ProfileLogin onClaim={handleClaim} />
          ))}

          {loading ? (
            <Loading />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#e74c3c', marginBottom: 16 }}>{error}</p>
              <button onClick={reload} style={{
                padding: '10px 24px', borderRadius: 8,
                border: 'none', background: 'var(--accent)', color: 'white',
                cursor: 'pointer', fontWeight: 600,
              }}>Повторить</button>
            </div>
          ) : (
            <>
              <div className="section-title">
                <h2>Наши одноклассники</h2>
                <p>Каждый из нас — особенный. Вспомним каждого.</p>
              </div>
              <div className="cards-grid">
                {students.map((student, index) => (
                  <StudentCard key={student.id} student={student} index={index} onDelete={handleDelete} myProfile={myProfile} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
