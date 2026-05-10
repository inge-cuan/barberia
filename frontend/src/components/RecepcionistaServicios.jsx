import { useState, useEffect, useRef } from 'react';

export default function RecepcionistaServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, nombre: '', precio: '', costo_insumos: '' });
  const [imagen, setImagen] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/servicios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setServicios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este servicio/paquete?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/servicios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setServicios(servicios.filter(s => s.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (srv) => {
    setFormData({ id: srv.id, nombre: srv.nombre, precio: srv.precio, costo_insumos: srv.costo_insumos });
    setImagen(null); // Force upload new if wanted
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ id: null, nombre: '', precio: '', costo_insumos: '' });
    setImagen(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('precio', formData.precio);
    data.append('costo_insumos', formData.costo_insumos || 0);
    if (imagen) {
      data.append('imagen', imagen);
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `http://localhost:3000/api/servicios/${formData.id}` 
        : 'http://localhost:3000/api/servicios';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: data // FormData handles Content-Type automatically
      });

      if (res.ok) {
        fetchServicios();
        handleCancel();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al guardar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animated-item">
      <h2 style={{ marginBottom: '2rem' }}>Gestión de Paquetes y Cortes</h2>

      <div className="bento-grid" style={{ marginTop: '2rem' }}>
        <div className="bento-card bento-col-4 animated-item">
          <h3>{isEditing ? 'Editar Paquete' : 'Nuevo Paquete / Servicio'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre del Servicio</label>
              <input 
                required 
                className="form-control" 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                placeholder="Ej. Corte y Barba VIP"
              />
            </div>
            <div className="form-group">
              <label>Precio de Venta ($)</label>
              <input 
                required 
                type="number"
                step="0.01"
                className="form-control" 
                value={formData.precio} 
                onChange={(e) => setFormData({...formData, precio: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Imagen Representativa</label>
              <input 
                type="file" 
                accept="image/*"
                className="form-control" 
                ref={fileInputRef}
                onChange={(e) => setImagen(e.target.files[0])} 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
              {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{width: '100%', marginTop: '0.5rem'}} 
                onClick={handleCancel}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>

        <div className="bento-card bento-col-8 animated-item">
          <h3>Catálogo Actual</h3>
          {loading ? <p>Cargando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {servicios.map((s, idx) => (
                <div key={s.id} className="animated-item" style={{ animationDelay: `${idx * 0.1}s`, border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden', backgroundColor: 'var(--surface-color)' }}>
                  <div style={{ height: '120px', width: '100%', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.imagen_url ? (
                      <img src={`http://localhost:3000${s.imagen_url}`} alt={s.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Sin Imagen</span>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{s.nombre}</h4>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '1rem' }}>${s.precio}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => handleEdit(s)}>Editar</button>
                      <button className="btn btn-danger" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => handleDelete(s.id)}>Borrar</button>
                    </div>
                  </div>
                </div>
              ))}
              {servicios.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay servicios registrados.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
