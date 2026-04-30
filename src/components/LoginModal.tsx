import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';
import ForgotPasswordModal from './ForgotPasswordModal';
import PasswordField from './PasswordField';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearFields = () => {
    setCorreo('');
    setContrasena('');
    setError(null);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSwitch = () => {
    clearFields();
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleForgotPassword = () => {
    setIsForgotOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await loginUser(correo, contrasena);

    if (result.success) {
      clearFields();
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
        <button className="modal-close" onClick={handleClose}>✕</button>

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

          <PasswordField
            label="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Tu contraseña"
            required
            autoComplete="current-password"
          />

          <button type="submit" className="submit-btn" style={{ marginBottom: '1rem' }}>Ingresar</button>
        </form>

        <p className="switch-link" style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '13px' }}>
          ¿Olvidaste tu contraseña? <span onClick={handleForgotPassword} style={{ cursor: 'pointer', fontWeight: 600, color: '#1a365d' }}>Recupérala aquí</span>
        </p>
        <p className="switch-link" style={{ fontSize: '13px' }}>
          ¿Aún no tienes cuenta? <span onClick={handleSwitch} style={{ cursor: 'pointer', fontWeight: 600, color: '#1a365d' }}>Regístrate aquí</span>
        </p>
      </div>

      {isForgotOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />
      )}
    </div>
  );
}
