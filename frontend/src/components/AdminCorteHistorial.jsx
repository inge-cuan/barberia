import { useState, useEffect } from 'react';

export default function AdminCorteHistorial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/caja/historial', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setHistorial(data);
    } catch (error) {
      console.error('Error fetching historial caja:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Historial de Cortes de Caja</h2>
      
      <div className="bento-grid">
        <div className="bento-card bento-col-12">
          {loading ? <p>Cargando historial...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recepcionista</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th>Fondo Inicial</th>
                    <th>Monto Real Declarado</th>
                    <th>Monto Esperado (Sistema)</th>
                    <th>Diferencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(c => {
                    const diferencia = c.monto_final_declarado - c.monto_esperado;
                    return (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td>{c.recepcionista || 'N/A'}</td>
                        <td>{new Date(c.fecha_apertura).toLocaleString()}</td>
                        <td>{c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleString() : '-'}</td>
                        <td>${c.monto_inicial}</td>
                        <td>{c.monto_final_declarado !== null ? `$${c.monto_final_declarado}` : '-'}</td>
                        <td>{c.monto_esperado !== null ? `$${c.monto_esperado}` : '-'}</td>
                        <td style={{ 
                          color: diferencia > 0 ? 'var(--accent-tertiary)' : (diferencia < 0 ? 'var(--accent-primary)' : 'inherit'),
                          fontWeight: diferencia !== 0 ? 'bold' : 'normal'
                        }}>
                          {c.monto_final_declarado !== null ? (diferencia > 0 ? `+ $${diferencia}` : `$${diferencia}`) : '-'}
                        </td>
                        <td style={{textTransform: 'uppercase', color: c.estado === 'abierta' ? 'var(--accent-secondary)' : 'var(--text-muted)'}}>
                          {c.estado}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
