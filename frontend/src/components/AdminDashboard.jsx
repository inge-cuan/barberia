import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({ ingresos: 0, gastos: 0, utilidad_bruta: 0, total_cortes: 0, mejor_servicio: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filtro, setFiltro] = useState('todo'); // 'hoy', 'semana', 'mes', 'todo'

  useEffect(() => {
    fetchStats();
  }, [filtro]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/admin/dashboard?rango=${filtro}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDB = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/admin/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al crear copia de seguridad');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_barberia_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Dashboard Principal</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleExportDB} 
          disabled={exporting}
        >
          {exporting ? 'GENERANDO...' : '📥 COPIA DE SEGURIDAD'}
        </button>
      </div>

      <div className="filter-bar">
        <button className={`btn ${filtro === 'hoy' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('hoy')}>HOY</button>
        <button className={`btn ${filtro === 'semana' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('semana')}>ESTA SEMANA</button>
        <button className={`btn ${filtro === 'mes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('mes')}>ESTE MES</button>
        <button className={`btn ${filtro === 'todo' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('todo')}>TODO EL TIEMPO</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>CARGANDO MÉTRICAS...</div>
      ) : (
        <div className="bento-grid animated-item">
          <div className="bento-card bento-col-4">
            <h3>Ingresos Brutos</h3>
            <div className="value" style={{ color: 'var(--text-main)' }}>
              ${stats.ingresos.toFixed(2)}
            </div>
          </div>
          <div className="bento-card bento-col-4">
            <h3>Total de Cortes</h3>
            <div className="value" style={{ color: 'var(--text-main)' }}>
              {stats.total_cortes}
            </div>
          </div>
          <div className="bento-card bento-col-4">
            <h3>Servicio Estrella</h3>
            <div className="value" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
              {stats.mejor_servicio}
            </div>
          </div>
          <div className="bento-card bento-col-12">
            <h3>Utilidad Neta (Caja Chica)</h3>
            <div className="value" style={{ color: stats.utilidad_bruta >= 0 ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
              ${stats.utilidad_bruta.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
