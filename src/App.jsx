import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Class11A from './pages/Class11A';
import Class11B from './pages/Class11B';
import Teachers from './pages/Teachers';
import Gallery from './pages/Gallery';
import News from './pages/News';
import AddClassmate from './pages/AddClassmate';
import Admin from './pages/Admin';
import Chat from './pages/Chat';
import Cabinet from './pages/Cabinet';
import { trackVisit } from './data/statsData';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function TrackVisit() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackVisit(pathname);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter basename="/mais-alumni">
      <ScrollToTop />
      <TrackVisit />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/class11a" element={<Class11A />} />
        <Route path="/class11b" element={<Class11B />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/add" element={<AddClassmate />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
