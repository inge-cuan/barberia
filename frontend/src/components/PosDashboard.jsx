import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from './PageTransition';

const metodoIconos = { Efectivo: Banknote, Tarjeta: CreditCard, Transferencia: Smartphone };
const metodoColores = {
  Efectivo: { bg: 'rgba(22,163,74,0.15)', color: '#16a34a', border: '#16a34a' },
  Tarjeta: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '#60a5fa' },
  Transferencia: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '#a78bfa' },
};

export default function PosDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const citaData = location.state;

  const [ticketItems, setTicketItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [metodo, setMetodo] = useState('Efectivo');
  const [loadingCobro, setLoadingCobro] = useState(false);
  const [ticketVentaId, setTicketVentaId] = useState(null);
  const [ticketImprimir, setTicketImprimir] = useState(null);

  useEffect(() => {
    if (citaData?.productos) {
      const items = citaData.productos.map(p => ({
        nombre: `${p.cantidad}x ${p.nombre}`,
        precio: p.subtotal,
      }));
      setTicketItems(items);
      setTotal(citaData.total);
    } else if (citaData?.venta) {
      const items = [];
      if (citaData.servicio) {
        items.push({ nombre: citaData.servicio.nombre || citaData.venta.cliente_nombre || 'Servicio', precio: citaData.venta.total });
      }
      setTicketItems(items);
      setTotal(citaData.venta.total);
      setTicketVentaId(citaData.venta.id);
    }
  }, [citaData]);

  const handleActualizarMetodo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/ventas/${ticketVentaId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo }),
      });
      if (res.ok) {
        toast.success('Método de pago actualizado');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCobrar = async () => {
    if (ticketVentaId) {
      await handleActualizarMetodo();
      const token = localStorage.getItem('token');
      const tktRes = await fetch(`http://localhost:3000/api/ventas/${ticketVentaId}/ticket`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tktData = await tktRes.json();
      setTicketImprimir({ ...tktData, items: ticketItems, cliente_nombre: citaData?.cliente_nombre || 'Público General' });
      return;
    }

    if (ticketItems.length === 0) return toast.error('El ticket está vacío');
    setLoadingCobro(true);
    try {
      const token = localStorage.getItem('token');
      const body = citaData?.productos
        ? { productos: citaData.productos.map(p => ({ id: p.id, cantidad: p.cantidad })), metodo }
        : { barbero_id: 1, servicio_ids: [], metodo };
      const res = await fetch('http://localhost:3000/api/ventas', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        const tktRes = await fetch(`http://localhost:3000/api/ventas/${data.venta_id}/ticket`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tktData = await tktRes.json();
        setTicketImprimir({ ...tktData, items: ticketItems });
      } else {
        toast.error(data.error || 'Error al cobrar');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCobro(false);
    }
  };

  const handlePrint = () => window.print();

  if (!citaData && ticketItems.length === 0) {
    return (
      <PageTransition>
        <div className="bento-card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
          <Printer size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Punto de Venta</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Completa una cita desde Gestión Citas para cobrar aquí.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/gestion-citas')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '999px', border: 'none',
              background: 'linear-gradient(135deg, #6f4e37, #8a6344)',
              color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(111,78,55,0.3)',
            }}
          >
            <ArrowLeft size={16} /> Ir a Gestión Citas
          </motion.button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Cobrar Venta</h2>
          {citaData?.cliente_nombre && (
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
              Cliente: <strong>{citaData.cliente_nombre}</strong>
              {citaData.barbero_nombre && <> | Barbero: <strong>{citaData.barbero_nombre}</strong></>}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/gestion-citas')}
          style={{
            padding: '0.6rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)',
            background: 'transparent', color: 'var(--text-muted)', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
          }}
        >
          <ArrowLeft size={16} /> Gestión Citas
        </motion.button>
      </div>

      <div className="bento-grid">
        <div className="bento-card bento-col-12" style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ color: 'var(--accent-primary)' }}>Ticket de Venta</h3>

          {citaData?.cliente_nombre && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(111,78,55,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cliente</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>{citaData.cliente_nombre}</div>
            </div>
          )}

          <div style={{ minHeight: '150px' }}>
            {ticketItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No hay servicios en el ticket</p>
            ) : (
              ticketItems.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)',
                }}>
                  <span style={{ fontWeight: 500 }}>{item.nombre}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>${item.precio.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Método de Pago</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
              {['Efectivo', 'Tarjeta', 'Transferencia'].map((m) => {
                const Icon = metodoIconos[m];
                const col = metodoColores[m];
                const isActive = metodo === m;
                return (
                  <motion.button key={m} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setMetodo(m)}
                    style={{
                      padding: '0.6rem', borderRadius: '10px', border: `2px solid ${isActive ? col.border : 'var(--border-color)'}`,
                      background: isActive ? col.bg : 'transparent', cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    <Icon size={20} style={{ color: isActive ? col.color : 'var(--text-muted)', margin: '0 auto' }} />
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? col.color : 'var(--text-muted)', marginTop: '0.2rem' }}>{m}</div>
                  </motion.button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-primary)' }}>
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCobrar}
              disabled={loadingCobro || ticketItems.length === 0}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
                background: loadingCobro || ticketItems.length === 0 ? 'var(--text-muted)' : 'linear-gradient(135deg, #6f4e37, #8a6344)',
                color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                cursor: loadingCobro || ticketItems.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(111,78,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loadingCobro ? 'Cobrando...' : 'Cobrar e Imprimir Ticket'}
            </motion.button>
          </div>
        </div>
      </div>

      {ticketImprimir && (
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={() => setTicketImprimir(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--surface-color)',
              borderRadius: '1.25rem', padding: '2rem', maxWidth: '400px', width: '100%',
              textAlign: 'center', position: 'relative', zIndex: 1,
              border: '1px solid var(--border-color)', boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.2rem' }}>Venta Registrada</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>ID Venta: {ticketImprimir.id}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePrint}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #6f4e37, #8a6344)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(111,78,55,0.3)' }}
              >
                <Printer size={16} /> Imprimir Ticket
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setTicketImprimir(null); navigate('/dashboard/gestion-citas'); }}
                style={{ padding: '0.65rem 1.5rem', borderRadius: '999px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
              >
                Volver
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {ticketImprimir && (
        <div id="print-ticket" style={{ display: 'none' }}>
          <h2 style={{ textAlign: 'center' }}>BARBER POS</h2>
          <p style={{ textAlign: 'center', fontSize: '12px' }}>Fecha: {new Date(ticketImprimir.fecha).toLocaleString()}</p>
          <p style={{ textAlign: 'center', fontSize: '12px' }}>Ticket: #{ticketImprimir.id}</p>
          {ticketImprimir.cliente_nombre && <p style={{ textAlign: 'center', fontSize: '12px' }}>Cliente: {ticketImprimir.cliente_nombre}</p>}
          <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          {ticketImprimir.items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{it.nombre}</span>
              <span>${it.precio.toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
            <span>TOTAL:</span>
            <span>${ticketImprimir.total.toFixed(2)}</span>
          </div>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>Pago: {ticketImprimir.metodo}</p>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>¡Gracias por su visita!</p>
        </div>
      )}
    </PageTransition>
  );
}
