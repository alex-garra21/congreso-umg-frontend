import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, setCurrentUser } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginUser(correo, contrasena);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setCorreo('');
      setContrasena('');
      onClose();
      navigate('/dashboard'); // Redirigir al dashboard
    } else {
      alert(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-bg open" onClick={onClose} style={{ zIndex: 9999 }}>
      {/* Detenemos la propagación para no cerrar al hacer click dentro del modal */}
      <div
        className="modal"
        style={{ maxWidth: '440px', padding: '2.5rem 2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Iniciar sesión</h3>
        <p className="modal-sub">Accede para ver tus charlas y estado de pago</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" required />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Contraseña</label>
            <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Tu contraseña" required />
          </div>

          <button type="submit" className="submit-btn" style={{ marginBottom: '1rem' }}>Ingresar</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-soft)' }}></div>
          <span style={{ margin: '0 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>o</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-soft)' }}></div>
        </div>

        <button
          className="btn-ghost"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar con Google
        </button>

        <p className="switch-link" style={{ marginTop: '1.5rem' }}>
          ¿Aún no tienes cuenta? <span onClick={onSwitchToRegister} style={{ cursor: 'pointer' }}>Regístrate aquí</span>
        </p>
      </div>
    </div>
  );
}
