import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, setCurrentUser } from '../utils/auth';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearFields = () => {
    setCorreo('');
    setContrasena('');
    setError(null);
    setShowPassword(false);
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

    if (result.success && result.user) {
      setCurrentUser(result.user);
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

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={contrasena} 
                onChange={(e) => setContrasena(e.target.value)} 
                placeholder="Tu contraseña" 
                required 
                style={{ paddingRight: '40px' }} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

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
