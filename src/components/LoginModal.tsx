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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await loginUser(correo, contrasena);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      setCorreo('');
      setContrasena('');
      onClose();
      navigate('/dashboard'); 
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-bg open" style={{ zIndex: 9999 }}>
      {/* Detenemos la propagación para no cerrar al hacer click dentro del modal */}
      <div
        className="modal"
        style={{ maxWidth: '440px', padding: '2.5rem 2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Iniciar sesión</h3>
        <p className="modal-sub">Accede para ver tus charlas y estado de pago</p>

        {error && (
          <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
            {error}
          </div>
        )}

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

        <p className="switch-link" style={{ marginTop: '1.5rem' }}>
          ¿Aún no tienes cuenta? <span onClick={onSwitchToRegister} style={{ cursor: 'pointer' }}>Regístrate aquí</span>
        </p>
      </div>
    </div>
  );
}
