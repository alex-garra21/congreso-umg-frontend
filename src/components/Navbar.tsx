import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          CONGRESO 2026 · UMG
        </Link>

        <ul className="nav-links">
          <li><Link to="/agenda">Agenda</Link></li>
          <li><Link to="/ponentes">Ponentes</Link></li>
          <li><Link to="/inscripcion">Cómo inscribirse</Link></li>
          <li><Link to="/pago">Pago</Link></li>
        </ul>

        <div className="nav-right">
          <button className="btn-ghost" onClick={() => setIsLoginOpen(true)}>
            Iniciar sesión
          </button>
          <button className="btn-solid" onClick={() => setIsRegisterOpen(true)}>
            Regístrate aquí
          </button>
        </div>
      </nav>

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