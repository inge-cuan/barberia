import { useState, useEffect } from "react";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    username: "",
    password: "",
    rol: "barbero",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    userId: null,
  });

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/admin/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!isActive) return;
        if (res.ok) setUsuarios(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const handleDelete = async (id) => {
    setDeleteConfirmModal({ isOpen: true, userId: id });
  };

  const confirmDelete = async () => {
    const { userId } = deleteConfirmModal;
    if (!userId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/api/admin/usuarios/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setUsuarios(usuarios.filter((u) => u.id !== userId));
        setDeleteConfirmModal({ isOpen: false, userId: null });
      } else {
        alert("Error al eliminar");
        setDeleteConfirmModal({ isOpen: false, userId: null });
      }
    } catch (error) {
      console.error(error);
      setDeleteConfirmModal({ isOpen: false, userId: null });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      nombre: user.nombre,
      username: user.username,
      password: "",
      rol: user.rol,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setFormData({
      id: null,
      nombre: "",
      username: "",
      password: "",
      rol: "barbero",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      id: null,
      nombre: "",
      username: "",
      password: "",
      rol: "barbero",
    });
  };

  const reloadUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      alert("LA CONTRASEÑA ES OBLIGATORIA.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `http://localhost:3000/api/admin/usuarios/${formData.id}`
        : "http://localhost:3000/api/admin/usuarios";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await reloadUsuarios();
        handleCloseModal();
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        color: "#e2e2e2",
        background:
          "radial-gradient(circle at top, rgba(111, 78, 55, 0.18), transparent 35%), linear-gradient(180deg, #121414 0%, #101212 100%)",
      }}
    >
      <style>{`
        .usuarios-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .usuarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .usuarios-card {
          background: rgba(40, 42, 43, 0.95);
          border: 1px solid #4d4635;
          border-radius: 1rem;
          padding: 1.25rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .usuarios-card:hover {
          transform: translateY(-2px);
          border-color: #6f4e37;
          box-shadow: 0 12px 40px rgba(111, 78, 55, 0.15);
        }

        .usuarios-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .usuarios-card-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #e2e2e2;
          margin: 0 0 0.25rem 0;
        }

        .usuarios-card-username {
          font-size: 0.9rem;
          color: #d0c5af;
          margin: 0;
        }

        .usuarios-card-rol {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(77, 70, 53, 0.5);
        }

        .usuarios-card-rol-label {
          font-size: 0.8rem;
          color: #d0c5af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.35rem 0;
        }

        .usuarios-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(77, 70, 53, 0.5);
        }

        .usuarios-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          border: 1px solid #4d4635;
          background: transparent;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .usuarios-icon-btn:hover {
          transform: scale(1.05);
        }

        .usuarios-edit-btn {
          color: #d0c5af;
        }

        .usuarios-edit-btn:hover {
          background: rgba(111, 78, 55, 0.25);
          border-color: #6f4e37;
          color: #e2e2e2;
        }

        .usuarios-delete-btn {
          background: #ffb4ab;
          color: #121414;
          border-color: #ffb4ab;
        }

        .usuarios-delete-btn:hover {
          background: #ff9a8f;
          border-color: #ff9a8f;
          opacity: 0.95;
        }

        .usuarios-hero {
          background: linear-gradient(135deg, rgba(40, 42, 43, 0.92), rgba(30, 32, 32, 0.96));
          border: 1px solid #4d4635;
          border-radius: 1.5rem;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
        }

        .usuarios-hero h2,
        .usuarios-hero p,
        .usuarios-panel h3,
        .usuarios-modal h3,
        .usuarios-empty,
        .usuarios-label,
        .usuarios-note {
          color: #e2e2e2;
        }

        .usuarios-hero p,
        .usuarios-note {
          color: #d0c5af;
        }

        .usuarios-panel {
          background: rgba(30, 32, 32, 0.94);
          border: 1px solid #4d4635;
          border-radius: 1.5rem;
          padding: 1.25rem;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
        }

        .usuarios-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .usuarios-action {
          background: #6f4e37;
          color: #ffffff;
          border: 1px solid #6f4e37;
          border-radius: 999px;
          padding: 0.8rem 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          box-shadow: 0 14px 30px rgba(111, 78, 55, 0.28);
        }

        .usuarios-action:hover {
          transform: translateY(-1px);
          opacity: 0.96;
        }

        .usuarios-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: #d0c5af;
        }



        .usuarios-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 10, 0.72);
          display: grid;
          place-items: center;
          padding: 1rem;
          z-index: 50;
          backdrop-filter: blur(10px);
        }

        .usuarios-modal {
          width: min(100%, 560px);
          background: linear-gradient(180deg, rgba(40, 42, 43, 0.98), rgba(30, 32, 32, 0.98));
          border: 1px solid #4d4635;
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 28px 100px rgba(0, 0, 0, 0.45);
        }

        .usuarios-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.1rem;
        }

        .usuarios-close {
          border: 1px solid #4d4635;
          background: transparent;
          color: #d0c5af;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 999px;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
        }

        .usuarios-form {
          display: grid;
          gap: 0.95rem;
        }

        .usuarios-form-grid {
          display: grid;
          gap: 0.95rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .usuarios-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .usuarios-form-group.full {
          grid-column: 1 / -1;
        }

        .usuarios-label {
          font-size: 0.92rem;
          color: #d0c5af;
        }

        .usuarios-input,
        .usuarios-select {
          width: 100%;
          box-sizing: border-box;
          background: rgba(18, 20, 20, 0.95);
          color: #e2e2e2;
          border: 1px solid #4d4635;
          border-radius: 0.95rem;
          padding: 0.9rem 1rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .usuarios-input:focus,
        .usuarios-select:focus {
          border-color: #6f4e37;
          box-shadow: 0 0 0 3px rgba(111, 78, 55, 0.2);
        }

        .usuarios-form-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
          margin-top: 0.35rem;
        }

        .usuarios-submit {
          background: #6f4e37;
          color: #ffffff;
          border-color: #6f4e37;
        }

        .usuarios-cancel {
          background: transparent;
          color: #d0c5af;
          border-color: #4d4635;
        }

        .usuarios-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 0.65rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
        }

        .usuarios-btn:hover {
          transform: translateY(-1px);
        }

        .usuarios-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 10, 0.72);
          display: grid;
          place-items: center;
          padding: 1rem;
          z-index: 51;
          backdrop-filter: blur(10px);
        }

        .usuarios-confirm-modal {
          width: min(100%, 420px);
          background: linear-gradient(180deg, rgba(40, 42, 43, 0.98), rgba(30, 32, 32, 0.98));
          border: 1px solid #4d4635;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 28px 100px rgba(0, 0, 0, 0.45);
          text-align: center;
        }

        .usuarios-confirm-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #e2e2e2;
          margin: 0 0 0.75rem 0;
        }

        .usuarios-confirm-text {
          color: #d0c5af;
          margin: 0 0 1.75rem 0;
          line-height: 1.5;
        }

        .usuarios-confirm-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .usuarios-confirm-cancel {
          background: transparent;
          color: #d0c5af;
          border-color: #4d4635;
          flex: 1;
        }

        .usuarios-confirm-delete {
          background: #ffb4ab;
          color: #121414;
          border-color: #ffb4ab;
          flex: 1;
        }

        .usuarios-confirm-delete:hover {
          background: #ff9a8f;
          border-color: #ff9a8f;
        }

        @media (max-width: 720px) {
          .usuarios-hero,
          .usuarios-modal-header {
            flex-direction: column;
            align-items: stretch;
          }

          .usuarios-form-grid {
            grid-template-columns: 1fr;
          }

          .usuarios-form-actions {
            justify-content: stretch;
          }

          .usuarios-form-actions .usuarios-btn,
          .usuarios-form-actions .usuarios-action {
            width: 100%;
          }
        }
      `}</style>

      <div className="usuarios-page">
        <section className="usuarios-hero">
          <div>
            <h2 style={{ marginBottom: 8 }}>Administrador de Empleados</h2>
          </div>
          <button
            type="button"
            className="usuarios-action"
            onClick={handleCreateNew}
          >
            + Agregar nuevo empleado
          </button>
        </section>

        <section className="usuarios-panel">
          <h3 style={{ margin: "0 0 1.25rem 0" }}>Lista de Empleados</h3>

          {loading ? (
            <p className="usuarios-empty">Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p className="usuarios-empty">Aún no hay empleados registrados.</p>
          ) : (
            <div className="usuarios-grid">
              {usuarios.map((u) => (
                <div key={u.id} className="usuarios-card">
                  <div className="usuarios-card-header">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="usuarios-card-title">{u.nombre}</h4>
                      <p className="usuarios-card-username">@{u.username}</p>
                    </div>
                    <div
                      className="usuarios-card-actions"
                      style={{
                        margin: 0,
                        padding: 0,
                        border: "none",
                        gap: "0.25rem",
                      }}
                    >
                      <button
                        className="usuarios-icon-btn usuarios-edit-btn"
                        onClick={() => handleEdit(u)}
                        title="Editar empleado"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      {u.id !== 1 && (
                        <button
                          className="usuarios-icon-btn usuarios-delete-btn"
                          onClick={() => handleDelete(u.id)}
                          title="Eliminar empleado"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="usuarios-card-rol">
                    <p className="usuarios-card-rol-label">Rol</p>
                    <span
                      className="usuarios-tag"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {u.rol}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div
          className="usuarios-overlay"
          role="presentation"
          onClick={handleCloseModal}
        >
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="usuarios-modal-header">
              <h3 id="usuarios-modal-title" style={{ margin: 0 }}>
                {isEditing ? "Editar Empleado" : "Nuevo Empleado"}
              </h3>
              <button
                type="button"
                className="usuarios-close"
                onClick={handleCloseModal}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form className="usuarios-form" onSubmit={handleSubmit}>
              <div className="usuarios-form-grid">
                <div className="usuarios-form-group full">
                  <label className="usuarios-label">Nombre Completo</label>
                  <input
                    required
                    className="usuarios-input"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>

                <div className="usuarios-form-group full">
                  <label className="usuarios-label">Usuario (Login)</label>
                  <input
                    required
                    className="usuarios-input"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div className="usuarios-form-group full">
                  <label className="usuarios-label">
                    Contraseña{" "}
                    <span style={{ color: "#ffb4ab" }}>*OBLIGATORIA*</span>
                  </label>
                  <input
                    required={!isEditing}
                    type="password"
                    className="usuarios-input"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={isEditing ? "Nueva contraseña" : ""}
                  />
                </div>

                <div className="usuarios-form-group full">
                  <label className="usuarios-label">Rol</label>
                  <select
                    className="usuarios-select"
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                  >
                    <option value="barbero">Barbero</option>
                    <option value="recepcionista">
                      Secretaria/Recepcionista
                    </option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="usuarios-form-actions">
                <button
                  type="button"
                  className="usuarios-btn usuarios-cancel"
                  onClick={handleCloseModal}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancelar
                </button>
                <button type="submit" className="usuarios-btn usuarios-submit">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {isEditing ? "Guardar Cambios" : "Crear Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmModal.isOpen && (
        <div
          className="usuarios-confirm-overlay"
          role="presentation"
          onClick={() => setDeleteConfirmModal({ isOpen: false, userId: null })}
        >
          <div
            className="usuarios-confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="usuarios-confirm-title">¿Eliminar empleado?</h3>
            <p className="usuarios-confirm-text">
              Esta acción no se puede deshacer. El empleado será eliminado
              permanentemente del sistema.
            </p>
            <div className="usuarios-confirm-actions">
              <button
                type="button"
                className="usuarios-btn usuarios-confirm-cancel"
                onClick={() =>
                  setDeleteConfirmModal({ isOpen: false, userId: null })
                }
              >
                Cancelar
              </button>
              <button
                type="button"
                className="usuarios-btn usuarios-confirm-delete"
                onClick={confirmDelete}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
