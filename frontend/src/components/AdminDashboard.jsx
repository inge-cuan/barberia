import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import StatCard from './StatCard';
import PageTransition from './PageTransition';

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const toast = useToast();
  const [stats, setStats] = useState({ ingresos: 0, gastos: 0, utilidad_bruta: 0, total_cortes: 0, mejor_servicio: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filtro, setFiltro] = useState('todo');

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
      toast(error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const filters = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'semana', label: 'Esta Semana' },
    { key: 'mes', label: 'Este Mes' },
    { key: 'todo', label: 'Todo' },
  ];

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Bienvenido, {user?.nombre || user?.username}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportDB}
          disabled={exporting}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '999px', border: '1px solid var(--border-color)',
            background: 'var(--surface-color)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem',
            cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'Generando...' : 'Copia de Seguridad'}
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '999px', border: 'none',
              background: filtro === f.key ? 'var(--accent-primary)' : 'var(--surface-color)',
              color: filtro === f.key ? '#fff' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              boxShadow: filtro === f.key ? '0 4px 12px rgba(111,78,55,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
              border: filtro === f.key ? 'none' : '1px solid var(--border-color)',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="bento-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`bento-card ${i === 4 ? 'bento-col-12' : 'bento-col-4'}`} style={{ gap: '0.75rem' }}>
              <div className="skeleton" style={{ width: '50%', height: '1rem' }} />
              <div className="skeleton" style={{ width: '70%', height: '2.8rem', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bento-grid">
          <StatCard title="Ingresos Brutos" value={`$${stats.ingresos.toFixed(2)}`} icon="money" delay={0} />
          <StatCard title="Total de Cortes" value={stats.total_cortes} icon="cut" delay={0.1} />
          <StatCard title="Servicio Estrella" value={stats.mejor_servicio} icon="star" delay={0.2} />
          <StatCard
            title="Utilidad Neta"
            value={`$${stats.utilidad_bruta.toFixed(2)}`}
            icon="profit"
            variant="highlight"
            delay={0.3}
          />
        </div>
      )}
    </PageTransition>
  );
}
