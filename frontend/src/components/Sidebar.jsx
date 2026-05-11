import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scissors, LayoutDashboard, Users, History, DollarSign, CalendarPlus, CalendarCheck, LogOut, PanelLeftClose, PanelLeftOpen, Sun, Moon, UserCog } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const getLinks = (role) => [
  ...(role === 'admin' ? [{ to: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard }] : []),
  ...(role === 'admin' ? [{ to: "/dashboard/usuarios", label: "Usuarios", icon: Users }] : []),
  ...(role === 'recepcionista' ? [{ to: "/dashboard/usuarios", label: "Barberos", icon: UserCog }] : []),
  { to: "/dashboard/registrar-cita", label: "Registrar Cita", icon: CalendarPlus },
  { to: "/dashboard/gestion-citas", label: "Gestión Citas", icon: CalendarCheck },
  { to: "/dashboard/servicios", label: "Servicios", icon: Scissors },
  { to: "/dashboard/corte", label: "Corte de Caja", icon: DollarSign },

  ...(role === 'admin' ? [{ to: "/dashboard/historial-caja", label: "Historial Caja", icon: History }] : []),
];

export default function Sidebar({ user, isOpen, setIsOpen, collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const role = user?.rol || "recepcionista";
  const links = getLinks(role);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} role="presentation" />
      )}

      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <PanelLeftClose size={28} /> : <PanelLeftOpen size={28} />}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
        onMouseEnter={() => { if (window.innerWidth > 768) return; }}
      >
        <div className="sidebar-header" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }} title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}>
          <div className="sidebar-logo-icon">
            <Scissors size={18} color="#fff" />
          </div>
          <span className="sidebar-logo-text">BarberPOS</span>
        </div>

        <nav onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}>
          {links.map((l) => {
            const isActive = location.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link ${isActive ? "active" : ""}`}
                title={collapsed ? l.label : undefined}
              >
                <Icon size={18} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6f4e37, #8a6344)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
            }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar-user-name" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.nombre || user?.username}
                </div>
                <div className="sidebar-user-role" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{role}</div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <button onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} style={{ position: 'relative' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {!collapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>}
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: '2px solid var(--surface-color)',
              }} />
            </button>
            <button onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={16} />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
