import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import { chatMessages, chatSend, getToken, getUser } from '../data/jsonbin';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const lastIdRef = useRef(0);
  const user = getUser();
  const token = getToken();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const msgs = await chatMessages(token, lastIdRef.current);
      if (msgs.length > 0) {
        setMessages(prev => {
          const existing = new Set(prev.map(m => m.id));
          const newMsgs = msgs.filter(m => !existing.has(m.id));
          return [...prev, ...newMsgs];
        });
        lastIdRef.current = Math.max(...msgs.map(m => m.id));
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  useEffect(() => {
    setLoading(false);
    if (token) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !token) return;
    setSending(true);
    try {
      await chatSend(token, input.trim());
      setInput('');
      await fetchMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const chatContainerStyle = {
    maxWidth: 700,
    margin: '0 auto',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '60vh',
    minHeight: 400,
  };

  const messageStyle = (isOwn) => ({
    display: 'flex',
    gap: 10,
    padding: '10px 16px',
    alignItems: 'flex-start',
    background: isOwn ? 'rgba(108,92,231,0.06)' : 'transparent',
    borderBottom: '1px solid var(--border)',
  });

  const avatarStyle = (isOwn) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: isOwn ? 'var(--accent)' : 'var(--accent-light)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8rem',
    flexShrink: 0,
  });

  if (!token) {
    return (
      <div>
        <HeroSection
          title="Чат"
          subtitle="Общение для одноклассников"
          gradient="linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
        />
        <section className="section">
          <div className="container" style={{ textAlign: 'center', maxWidth: 500 }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Войдите на сайте, чтобы общаться в чате.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        title="Чат"
        subtitle={`Вы вошли как ${user?.name || 'Аноним'}`}
        gradient="linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
      />

      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={chatContainerStyle}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Сообщения ({messages.length})</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40, fontSize: '0.9rem' }}>
                    Пока нет сообщений. Напишите первое!
                  </p>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.username === user?.name;
                    return (
                      <div key={msg.id} style={messageStyle(isOwn)}>
                        <div style={avatarStyle(isOwn)}>
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isOwn ? 'var(--accent)' : 'var(--text-primary)' }}>
                              {msg.username}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                              {formatTime(msg.time)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Напишите сообщение..."
                  disabled={sending}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8,
                    border: '2px solid var(--border)', fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: sending || !input.trim() ? '#ccc' : 'var(--accent)',
                    color: 'white', border: 'none', fontWeight: 600,
                    cursor: sending || !input.trim() ? 'default' : 'pointer',
                  }}
                >
                  {sending ? '...' : '→'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
