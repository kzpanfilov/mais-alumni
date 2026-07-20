import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import TeacherCard from '../components/TeacherCard';
import { teachers as initialTeachers } from '../data/teachers';

export default function Teachers() {
  const [teachersList, setTeachersList] = useState(initialTeachers);

  const handleDelete = (id) => {
    setTeachersList(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdate = (updated) => {
    setTeachersList(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div>
      <HeroSection
        title="Наши учителя"
        subtitle="Люди, которые дали нам знания и путевку в жизнь"
        badge="Спасибо вам!"
        gradient="linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)"
      />

      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Педагогический состав</h2>
            <p>Учителя, которые нас учили и воспитывали</p>
          </div>

          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
            {teachersList.map((teacher, index) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={index} onDelete={handleDelete} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
