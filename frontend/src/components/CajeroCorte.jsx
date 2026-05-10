import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function CajeroCorte() {
  const { user } = useOutletContext();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [montoReal, setMontoReal] = useState('');
  const [montoInicialForm, setMontoInicialForm] = useState('');

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
        setResumen(null); // Caja probablemente cerrada
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
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/caja/cerrar', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
    }
  };

  if (user.rol === 'admin') {
    return (
      <div className="bento-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Acceso Denegado</h2>
        <p>El administrador no realiza cortes de caja. Por favor, ve a la sección "Historial Caja".</p>
      </div>
    )
  }

  if (loading) return <div>Cargando...</div>;

  if (!resumen) {
    return (
      <div className="bento-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Caja Cerrada</h2>
        <form onSubmit={handleAbrirCaja}>
          <div className="form-group">
            <label>Monto Inicial (Fondo de Caja)</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="form-control" 
              value={montoInicialForm}
              onChange={e => setMontoInicialForm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Abrir Caja</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Corte de Caja (Turno Actual)</h2>
      
      <div className="bento-grid">
        <div className="bento-card bento-col-6">
          <h3 style={{ color: 'var(--accent-secondary)' }}>Resumen del Sistema</h3>
          <ul style={{ listStyle: 'none', lineHeight: '2', fontFamily: 'var(--font-mono)' }}>
            <li>Fondo Inicial: <strong>${resumen.monto_inicial}</strong></li>
            <li>Ventas en Efectivo: <strong style={{color: 'var(--accent-tertiary)'}}>+ ${resumen.ventas_efectivo}</strong></li>
            <li>Gastos (Caja Chica): <strong style={{color: 'var(--accent-primary)'}}>- ${resumen.gastos}</strong></li>
            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }}/>
            <li style={{ fontSize: '1.2rem' }}>EFECTIVO ESPERADO EN CAJÓN: <strong style={{color: 'var(--accent-secondary)'}}>${resumen.saldo_esperado_efectivo}</strong></li>
            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }}/>
            <li>Ventas Tarjeta: <strong>${resumen.ventas_tarjeta}</strong></li>
            <li>Ventas Transferencia: <strong>${resumen.ventas_transferencia}</strong></li>
          </ul>
        </div>

        <div className="bento-card bento-col-6" style={{ border: '4px solid var(--accent-primary)' }}>
          <h3 style={{ color: 'var(--accent-primary)' }}>Ejecutar Corte Físico</h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Cuenta el dinero físico en tu cajón y decláralo aquí abajo. El sistema calculará si hay faltante o sobrante automáticamente.</p>
          
          <form onSubmit={handleCerrarCaja}>
            <div className="form-group">
              <label>Efectivo Real en Cajón</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="form-control" 
                value={montoReal}
                onChange={e => setMontoReal(e.target.value)}
                style={{ fontSize: '2rem', padding: '1rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}>
              Cerrar Caja Definitivamente
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
