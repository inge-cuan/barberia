import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.rol === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/caja');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-15%', right: '-5%', width: '600px', height: '600px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(111,78,55,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-5%', width: '500px', height: '500px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(111,78,55,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        style={{
          width: 'min(100%, 400px)',
          background: 'var(--surface-color)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6f4e37, #8a6344)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(111,78,55,0.35)',
          }}>
            <Scissors size={30} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontSize: '1.75rem', fontWeight: 700, fontStyle: 'italic',
            color: 'var(--text-main)', margin: '0 0 0.25rem', letterSpacing: '-0.02em',
          }}>
            Barbería
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '0.75rem 1rem', borderRadius: '10px',
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500,
              }}
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="label-sm">Usuario</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="input-field"
                style={{ padding: '0.8rem 1rem 0.8rem 2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="label-sm">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="input-field"
                style={{ padding: '0.8rem 1rem 0.8rem 2.5rem' }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: '0 6px 24px rgba(111,78,55,0.45)' } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '999px', border: 'none',
              fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em',
              color: '#fff',
              background: loading ? 'var(--border-color)' : 'linear-gradient(135deg, #6f4e37, #965a3e)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(111,78,55,0.35)',
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Entrando...
              </>
            ) : (
              <>
                <Scissors size={18} />
                Iniciar Sesión
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
