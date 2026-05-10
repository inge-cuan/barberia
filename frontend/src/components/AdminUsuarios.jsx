import { useState, useEffect } from 'react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, nombre: '', username: '', password: '', rol: 'barbero' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/admin/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user) => {
    setFormData({ id: user.id, nombre: user.nombre, username: user.username, password: '', rol: user.rol });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      alert("LA CONTRASEÑA ES OBLIGATORIA.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `http://localhost:3000/api/admin/usuarios/${formData.id}` 
        : 'http://localhost:3000/api/admin/usuarios';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchUsuarios();
        setFormData({ id: null, nombre: '', username: '', password: '', rol: 'barbero' });
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Gestión de Personal</h2>

      <div className="bento-grid">
        <div className="bento-card bento-col-4">
          <h3>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                required 
                className="form-control" 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Usuario (Login)</label>
              <input 
                required 
                className="form-control" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Contraseña <span style={{color: 'var(--accent-primary)'}}>*OBLIGATORIA*</span></label>
              <input 
                required={!isEditing} 
                type="password" 
                className="form-control" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder={isEditing ? 'Nueva contraseña' : ''}
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select 
                className="form-control" 
                value={formData.rol} 
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
              >
                <option value="barbero">Barbero</option>
                <option value="recepcionista">Secretaria/Recepcionista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              {isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{width: '100%', marginTop: '1rem'}} 
                onClick={() => {setIsEditing(false); setFormData({ id: null, nombre: '', username: '', password: '', rol: 'barbero' })}}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>

        <div className="bento-card bento-col-8">
          <h3>Lista de Empleados</h3>
          {loading ? <p>Cargando...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.username}</td>
                      <td style={{textTransform: 'capitalize'}}>{u.rol}</td>
                      <td>
                        <button className="btn btn-secondary" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.5rem'}} onClick={() => handleEdit(u)}>
                          Editar
                        </button>
                        {u.id !== 1 && ( // Prevent deleting main admin
                          <button className="btn btn-danger" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}} onClick={() => handleDelete(u.id)}>
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
