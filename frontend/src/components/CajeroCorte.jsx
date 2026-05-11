import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Banknote, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import PageTransition from './PageTransition';

export default function CajeroCorte() {
  const { user } = useOutletContext();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [montoReal, setMontoReal] = useState('');
  const [montoInicialForm, setMontoInicialForm] = useState('');
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchResumen = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/caja/resumen', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setResumen(data);
      } else {
        setResumen(null);
      }
    } catch (error) {
      console.error('Error fetching resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/caja/abrir', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_inicial: parseFloat(montoInicialForm) })
      });
      if (res.ok) {
        fetchResumen();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    if (!window.confirm('¿Estás seguro de cerrar la caja actual?')) return;
    setCerrando(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/caja/cerrar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_real_efectivo: parseFloat(montoReal) })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje);
        setResumen(null);
        setMontoReal('');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCerrando(false);
    }
  };

  if (user.rol === 'admin') {
    return (
      <PageTransition>
        <div className="bento-card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)' }}>El administrador no realiza cortes de caja. Ve a "Historial Caja".</p>
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="bento-grid">
          <div className="bento-card bento-col-6" style={{ gap: '0.75rem' }}>
            <div className="skeleton" style={{ width: '50%', height: '1rem' }} />
            <div className="skeleton" style={{ width: '80%', height: '2rem' }} />
            <div className="skeleton" style={{ width: '60%', height: '1rem' }} />
          </div>
          <div className="bento-card bento-col-6" style={{ gap: '0.75rem' }}>
            <div className="skeleton" style={{ width: '50%', height: '1rem' }} />
            <div className="skeleton" style={{ width: '80%', height: '2rem' }} />
            <div className="skeleton" style={{ width: '60%', height: '1rem' }} />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!resumen) {
    return (
      <PageTransition>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bento-card"
            style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', textAlign: 'center' }}
          >
            <DollarSign size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem', opacity: 0.7 }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Caja Cerrada</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Ingresa el monto inicial para abrir la caja
            </p>
            <form onSubmit={handleAbrirCaja} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Monto Inicial (Fondo de Caja)</label>
                <input
                  required type="number" step="0.01"
                  value={montoInicialForm}
                  onChange={e => setMontoInicialForm(e.target.value)}
                  style={{
                    width: '100%', padding: '0.8rem 1rem', fontSize: '1.5rem', fontWeight: 700,
                    color: 'var(--accent-primary)', textAlign: 'center',
                    border: '2px solid var(--border-color)', borderRadius: '12px',
                    background: 'var(--bg-color)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#6f4e37'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '999px', border: 'none',
                  background: 'linear-gradient(135deg, #6f4e37, #8a6344)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(111,78,55,0.3)',
                }}
              >
                Abrir Caja
              </motion.button>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Corte de Caja</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Turno actual</p>
      </div>

      <div className="bento-grid">
        <div className="bento-card bento-col-6" style={{ gap: '1rem' }}>
          <h3>Resumen del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fondo Inicial</span>
              <span style={{ fontWeight: 600 }}>${resumen.monto_inicial}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Banknote size={16} /> Ventas Efectivo
              </span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>+ ${resumen.ventas_efectivo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <CreditCard size={16} /> Ventas Tarjeta
              </span>
              <span style={{ fontWeight: 600 }}>${resumen.ventas_tarjeta}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Smartphone size={16} /> Ventas Transferencia
              </span>
              <span style={{ fontWeight: 600 }}>${resumen.ventas_transferencia}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gastos (Caja Chica)</span>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>- ${resumen.gastos}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', marginTop: '0.5rem', borderTop: '2px solid var(--accent-primary)' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Efectivo Esperado</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>${resumen.saldo_esperado_efectivo}</span>
            </div>
          </div>
        </div>

        <div className="bento-card bento-col-6" style={{ border: '2px solid var(--accent-primary)', gap: '1rem' }}>
          <h3 style={{ color: 'var(--accent-primary)' }}>Ejecutar Corte Físico</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Cuenta el dinero físico en tu cajón y decláralo. El sistema calculará la diferencia automáticamente.
          </p>
          <form onSubmit={handleCerrarCaja} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Efectivo Real en Cajón</label>
              <input
                required type="number" step="0.01"
                value={montoReal}
                onChange={e => setMontoReal(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', fontSize: '2rem', fontWeight: 700,
                  color: 'var(--accent-primary)', textAlign: 'center',
                  border: '2px solid var(--accent-primary)', borderRadius: '12px',
                  background: 'rgba(111,78,55,0.04)', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.boxShadow = '0 0 0 4px rgba(111,78,55,0.1)'; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                autoFocus
              />
            </div>
            <motion.button
              type="submit"
              disabled={cerrando}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
                background: cerrando ? '#ccc' : 'linear-gradient(135deg, #6f4e37, #8a6344)',
                color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                cursor: cerrando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(111,78,55,0.3)',
              }}
            >
              {cerrando ? 'Cerrando...' : 'Cerrar Caja Definitivamente'}
            </motion.button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
