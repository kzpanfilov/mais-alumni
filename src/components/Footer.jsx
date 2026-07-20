import { schoolInfo } from '../data/schoolInfo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Маисская средняя школа</h4>
          <p>{schoolInfo.fullName}</p>
          <p style={{ marginTop: 8 }}>{schoolInfo.address}</p>
        </div>
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>Телефон: {schoolInfo.phone}</p>
          <p>Email: {schoolInfo.email}</p>
          <p>Директор: {schoolInfo.directorNow}</p>
        </div>
        <div className="footer-section">
          <h4>О проекте</h4>
          <p>
            Сайт создан для выпускников 11а и 11б классов 2006 года.
            Ностальгия, воспоминания, добрая память о школьных годах.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2006–2026 Маисская средняя школа — Выпускники 11а и 11б</p>
        <p style={{ marginTop: 4 }}>С любовью к нашим школьным годам</p>
      </div>
    </footer>
  );
}
