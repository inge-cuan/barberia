import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.rol || "cajero";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">BARBER POS</div>

        <nav onClick={() => window.innerWidth <= 768 && setIsOpen(false)}>
          {/* Servicios - Available to all */}
          <Link
            to="/dashboard/servicios"
            className={`nav-link ${location.pathname === "/dashboard/servicios" ? "active" : ""}`}
          >
            Servicios
          </Link>

          {/* Citas - Available to all */}
          <Link
            to="/dashboard/citas"
            className={`nav-link ${location.pathname === "/dashboard/citas" ? "active" : ""}`}
          >
            Citas
          </Link>

          {role === "admin" && (
            <>
              <Link
                to="/dashboard/admin"
                className={`nav-link ${location.pathname === "/dashboard/admin" ? "active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/usuarios"
                className={`nav-link ${location.pathname === "/dashboard/usuarios" ? "active" : ""}`}
              >
                Usuarios
              </Link>
            </>
          )}

          {(role === "recepcionista" ||
            role === "admin" ||
            role === "cajero") && (
            <>
              <Link
                to="/dashboard/caja"
                className={`nav-link ${location.pathname === "/dashboard/caja" ? "active" : ""}`}
              >
                Punto de Venta
              </Link>
              <Link
                to="/dashboard/corte"
                className={`nav-link ${location.pathname === "/dashboard/corte" ? "active" : ""}`}
              >
                Corte de Caja
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link
              to="/dashboard/historial-caja"
              className={`nav-link ${location.pathname === "/dashboard/historial-caja" ? "active" : ""}`}
            >
              Historial Caja
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              marginBottom: "1rem",
              fontWeight: "bold",
              color: "#d0c5af",
            }}
          >
            USER: {user?.username}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-primary"
            style={{
              width: "100%",
              backgroundColor: "#6f4e37",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
            }}
          >
            CERRAR SESIÓN
          </button>
        </div>
      </aside>
    </>
  );
}
