import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../api/hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleOpenRegister = () => {
      setIsLoginOpen(false);
      setIsRegisterOpen(true);
    };
    window.addEventListener('openRegisterModal', handleOpenRegister);
    return () => window.removeEventListener('openRegisterModal', handleOpenRegister);
  }, []);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
    setIsMenuOpen(false);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Inicio', path: '/', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    { name: 'Agenda', path: '/agenda', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { name: 'Ponentes', path: '/ponentes', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { name: 'Comunidad', path: '/participantes-info', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></> },
    { name: 'Asistencia', path: '/asistencia-info', icon: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></> },
    { name: 'Inscripción', path: '/inscripcion', icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></> },
    { name: 'Pago', path: '/pago', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-mobile-left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
          <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            CONGRESO SISTEMAS UMG 2026
          </Link>
        </div>

        <ul className="nav-links">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link to={link.path} className={location.pathname === link.path ? 'active' : ''}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {isLoading ? (
            <div className="loader-mini" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : isAuthenticated ? (
            <Link to="/dashboard" className="btn-solid">
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => setIsLoginOpen(true)}>
                Iniciar sesión
              </button>
              <button className="btn-solid" onClick={() => setIsRegisterOpen(true)}>
                Regístrate aquí
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar Mobile */}
      <div className={`mobile-sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-header-mobile">
            <span className="logo-text">MENÚ</span>
            <button className="close-sidebar" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>

          <ul className="mobile-nav-list">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon-svg">
                    {link.icon}
                  </svg>
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer-mobile">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-sidebar-register" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <button className="btn-sidebar-login" onClick={openLogin}>Iniciar sesión</button>
                <button className="btn-sidebar-register" onClick={openRegister}>Regístrate aquí</button>
              </>
            )}
          </div>
        </aside>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}