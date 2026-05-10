import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function PosDashboard() {
  const { user } = useOutletContext();
  const [catalogos, setCatalogos] = useState({ clientes: [], servicios: [], barberos: [] });
  const [clienteId, setClienteId] = useState('');
  const [barberoId, setBarberoId] = useState(user.id);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [ticketItems, setTicketItems] = useState([]);
  const [metodo, setMetodo] = useState('Efectivo');
  const [loadingCobro, setLoadingCobro] = useState(false);
  const [ticketImprimir, setTicketImprimir] = useState(null);

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ventas/catalogos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCatalogos(data);
        if (data.servicios.length > 0) setServicioSeleccionado(data.servicios[0].id);
        if (data.barberos.length > 0) setBarberoId(data.barberos[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAgregar = () => {
    const srv = catalogos.servicios.find(s => s.id === parseInt(servicioSeleccionado));
    if (srv) {
      setTicketItems([...ticketItems, srv]);
    }
  };

  const total = ticketItems.reduce((sum, item) => sum + item.precio, 0);

  const handleCobrar = async () => {
    if (ticketItems.length === 0) return alert('El ticket está vacío');

    setLoadingCobro(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/ventas', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cliente_id: clienteId ? parseInt(clienteId) : null,
          barbero_id: parseInt(barberoId),
          servicio_ids: ticketItems.map(item => item.id),
          metodo
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Obtener detalles del ticket para imprimir
        const tktRes = await fetch(`http://localhost:3000/api/ventas/${data.venta_id}/ticket`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tktData = await tktRes.json();
        
        // Agregar los items al ticket data
        setTicketImprimir({ ...tktData, items: ticketItems });
        setTicketItems([]);
      } else {
        alert(data.error || 'Error al cobrar');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCobro(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="pos-view">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Punto de Venta (POS)</h2>
          <div style={{ padding: '0.5rem 1rem', border: '3px solid var(--accent-secondary)', fontWeight: '900', color: 'var(--accent-secondary)' }}>
            CAJA: ABIERTA
          </div>
        </div>

        <div className="bento-grid animated-item">
          <div className="bento-card bento-col-8 animated-item" style={{ gap: '1rem' }}>
            <h3>Nueva Venta</h3>
            
            <div className="form-group animated-item">
              <label>Cliente (Opcional)</label>
              <select className="form-control" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">Cliente General (Público)</option>
                {catalogos.clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group animated-item">
              <label>Barbero que atiende</label>
              <select className="form-control" value={barberoId} onChange={e => setBarberoId(e.target.value)}>
                {catalogos.barberos.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group animated-item">
              <label>Servicio</label>
              <select className="form-control" value={servicioSeleccionado} onChange={e => setServicioSeleccionado(e.target.value)}>
                {catalogos.servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-secondary animated-item" style={{ width: 'fit-content' }} onClick={handleAgregar}>
              + Agregar al Ticket
            </button>
          </div>

          <div className="bento-card bento-col-4 animated-item" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid var(--accent-primary)' }}>
            <h3 style={{color: 'var(--accent-primary)'}}>Ticket Actual</h3>
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {ticketItems.map((item, index) => (
                  <div key={index} className="animated-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {item.imagen_url ? (
                        <img src={`http://localhost:3000${item.imagen_url}`} alt={item.nombre} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>N/A</div>
                      )}
                      <span style={{fontFamily: 'var(--font-sans)', fontWeight: '500'}}>{item.nombre}</span>
                    </div>
                    <span style={{fontFamily: 'var(--font-sans)', fontWeight: '500'}}>${item.precio.toFixed(2)}</span>
                  </div>
                ))}
                {ticketItems.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay servicios agregados.</p>}
              </div>
              
              <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border-color)', paddingTop: '1rem' }}>
                <div className="form-group animated-item">
                  <label>Método de Pago</label>
                  <select className="form-control" value={metodo} onChange={e => setMetodo(e.target.value)}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div className="animated-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                  <span>TOTAL</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary animated-item" 
                  style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                  onClick={handleCobrar}
                  disabled={loadingCobro || ticketItems.length === 0}
                >
                  {loadingCobro ? 'Cobrando...' : 'Cobrar Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal/Overlay para impresión */}
        {ticketImprimir && (
          <div className="ticket-modal-overlay">
            <div className="bento-card" style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
              <h2 style={{color: 'var(--accent-secondary)', marginBottom: '1rem'}}>Venta Registrada</h2>
              <p>ID Venta: {ticketImprimir.id}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={handlePrint}>Imprimir Ticket</button>
                <button className="btn btn-secondary" onClick={() => setTicketImprimir(null)}>Nueva Venta</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TICKET DE IMPRESIÓN (Oculto normalmente, visible solo en @media print) */}
      {ticketImprimir && (
        <div id="print-ticket" style={{ display: 'none' }}>
          <h2 style={{ textAlign: 'center' }}>BARBER POS</h2>
          <p style={{ textAlign: 'center', fontSize: '12px' }}>Fecha: {new Date(ticketImprimir.fecha).toLocaleString()}</p>
          <p style={{ textAlign: 'center', fontSize: '12px' }}>Ticket: #{ticketImprimir.id}</p>
          <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          <p><strong>Cliente:</strong> {ticketImprimir.cliente_nombre || 'Público General'}</p>
          <p><strong>Barbero:</strong> {ticketImprimir.barbero_nombre}</p>
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
    </>
  );
}
