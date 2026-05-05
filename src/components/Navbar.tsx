import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/hooks/useAuth';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { Icons } from './Icons';

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleOpenRegister = () => {
      setIsLoginOpen(false);
      setIsRegisterOpen(true);
    };
    window.addEventListener('openRegisterModal', handleOpenRegister);
    return () => window.removeEventListener('openRegisterModal', handleOpenRegister);
  }, []);

  const handleAuthAction = (action: 'login' | 'register') => {
    if (isAuthenticated && user) {
      // Si ya está logueado, redirigir al dashboard
      if (user.rol === 'admin') {
        navigate('/dashboard/admin-tokens');
      } else {
        navigate('/dashboard/inicio');
      }
    } else {
      // Si no, abrir modales
      setIsMenuOpen(false);
      if (action === 'login') {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
      } else {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
      }
    }
  };

  const openLogin = () => handleAuthAction('login');
  const openRegister = () => handleAuthAction('register');

  const navLinks = [
    { name: 'Inicio', path: '/', Icon: Icons.Home },
    { name: 'Agenda', path: '/agenda', Icon: Icons.Calendar },
    { name: 'Ponentes', path: '/ponentes', Icon: Icons.Users },
    { name: 'Comunidad', path: '/participantes-info', Icon: Icons.Users },
    { name: 'Asistencia', path: '/asistencia-info', Icon: Icons.Smartphone },
    { name: 'Inscripción', path: '/inscripcion', Icon: Icons.Info },
    { name: 'Pago', path: '/pago', Icon: Icons.CreditCard },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-mobile-left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
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
          <button className="btn-ghost" onClick={openLogin}>
            {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
          </button>
          <button className="btn-solid" onClick={openRegister}>
            {isAuthenticated ? 'Mi Cuenta' : 'Regístrate aquí'}
          </button>
        </div>
      </nav>

      {/* Sidebar Mobile */}
      <div className={`mobile-sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-header-mobile">
            <span className="logo-text">MENÚ</span>
            <button className="close-sidebar" onClick={() => setIsMenuOpen(false)}>
              <Icons.X size={24} />
            </button>
          </div>

          <ul className="mobile-nav-list">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.Icon size={20} className="nav-icon-svg" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer-mobile">
            <button className="btn-sidebar-login" onClick={openLogin}>Iniciar sesión</button>
            <button className="btn-sidebar-register" onClick={openRegister}>Regístrate aquí</button>
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