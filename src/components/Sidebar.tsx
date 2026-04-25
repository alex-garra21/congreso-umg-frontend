import { useState, useEffect, type JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser, type UserData } from '../utils/auth';

interface SidebarProps {
  onModuleChange?: (moduleId: string) => void;
}

export default function Sidebar({ onModuleChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('sessionUpdate', handleUpdate);
    return () => window.removeEventListener('sessionUpdate', handleUpdate);
  }, []);

  const isPaid = user?.pagoValidado;

  const Icons = {
    Home: () => (
      <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    User: () => (
      <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    CreditCard: () => (
      <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
    ),
    Calendar: () => (
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    ),
    Award: () => (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
    ),
    Shield: () => (
      <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
    BarChart: () => (
      <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    ),
    Clipboard: () => (
      <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
    ),
    LogOut: () => (
      <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    ),
    CheckCircle: () => (
      <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: JSX.Element;
    section: string;
    badge?: string;
  }

  const isAdmin = user?.rol === 'admin';
  const menuItems: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', icon: <Icons.Home />, section: 'GENERAL' },
    { id: 'perfil', label: 'Mi perfil', icon: <Icons.User />, section: 'GENERAL' },
  ];

  if (isAdmin) {
    menuItems.push(
      { id: 'admin-tokens', label: 'Tokens de Pago', icon: <Icons.Shield />, section: 'ADMINISTRACIÓN' },
      { id: 'admin-usuarios', label: 'Validar Usuarios', icon: <Icons.User />, section: 'ADMINISTRACIÓN' },
      { id: 'admin-asistencia', label: 'Control Asistencia', icon: <Icons.CheckCircle />, section: 'ADMINISTRACIÓN' },
      { id: 'admin-reportes', label: 'Reportes', icon: <Icons.BarChart />, section: 'ADMINISTRACIÓN' },
      { id: 'admin-agenda', label: 'Gestión Agenda', icon: <Icons.Clipboard />, section: 'ADMINISTRACIÓN' }
    );
  } else {
    menuItems.push(
      { id: 'pago', label: 'Pago', icon: <Icons.CreditCard />, section: 'INSCRIPCIÓN', badge: isPaid ? 'OK' : 'PEND' },
      { id: 'talleres', label: 'Mis talleres', icon: <Icons.Calendar />, section: 'INSCRIPCIÓN' },
      { id: 'diploma', label: 'Diploma', icon: <Icons.Award />, section: 'INSCRIPCIÓN' }
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return '??';
    const n = user.nombres?.[0] || '';
    const a = user.apellidos?.[0] || '';
    return (n + a).toUpperCase() || 'U';
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {isExpanded ? (
            <div className="logo-full">
              <span className="logo-main">CONGRESO 2026</span>
              <span className="logo-sub">UMG PLATAFORMA</span>
            </div>
          ) : (
            <span className="logo-mini">UMG</span>
          )}
        </div>
        <button className="expand-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {getInitials()}
        </div>
        {isExpanded && (
          <div className="user-info" key={`${user?.correo}-${user?.nombres}-${user?.tipoParticipante}`}>
            <span className="user-name">
              {user?.nombres || 'Usuario'} {user?.apellidos || ''}
            </span>
            <span className="user-role">
              {user?.tipoParticipante === 'alumno' ? 'Alumno UMG' : 'Participante Externo'}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {['GENERAL', 'INSCRIPCIÓN', 'ADMINISTRACIÓN']
          .filter(section => {
            if (section === 'INSCRIPCIÓN' && isAdmin) return false;
            if (section === 'ADMINISTRACIÓN' && !isAdmin) return false;
            return true;
          })
          .map(section => (
          <div key={section} className="nav-section">
            {isExpanded && <span className="section-title">{section}</span>}
            <ul className="nav-list">
              {menuItems.filter(item => item.section === section).map(item => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${location.pathname.includes(item.id) ? 'active' : (item.id === 'inicio' && location.pathname === '/dashboard' ? 'active' : '')}`}
                    onClick={() => {
                      navigate(`/dashboard/${item.id}`);
                      onModuleChange?.(item.id);
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {isExpanded && <span className="nav-label">{item.label}</span>}
                    {isExpanded && item.badge && (
                      <span className={`nav-badge ${item.badge === 'PEND' ? 'pending' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><Icons.LogOut /></span>
          {isExpanded && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
