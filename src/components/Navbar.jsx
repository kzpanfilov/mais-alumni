import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAdmin } from '../data/jsonbin';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const links = [
    { to: '/', label: 'Главная' },
    { to: '/about', label: 'О школе' },
    { to: '/class11a', label: '11а' },
    { to: '/class11b', label: '11б' },
    { to: '/teachers', label: 'Учителя' },
    { to: '/gallery', label: 'Галерея' },
    { to: '/news', label: 'Новости' },
    { to: '/add', label: '+ Добавить' },
    ...(isAdmin() ? [{ to: '/admin', label: '⚙ Админ' }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem('mais-gate');
    localStorage.removeItem('mais-admin');
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">М</div>
          <span>МШ 2006</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'none',
            opacity: 0.7, transition: 'opacity 0.2s',
          }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.7}>
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
}
