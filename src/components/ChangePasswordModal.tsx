import React, { useState } from 'react';
import { changePassword } from '../utils/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearFields = () => {
    setPasswords({ newPassword: '', confirmPassword: '' });
    setError(null);
    setShowSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const result = await changePassword(passwords.newPassword);
    if (result.success) {
      setShowSuccess(true);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-bg open" style={{ zIndex: 10001 }}>
      <div className="modal" style={{ maxWidth: '400px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {showSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#7ed321" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>¡Contraseña Cambiada!</h3>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tu contraseña ha sido actualizada con éxito.</p>
            <button className="submit-btn" onClick={handleClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'Syne', fontWeight: 800 }}>Cambiar contraseña</h3>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Ingresa tu nueva contraseña a continuación.</p>

            {error && (
              <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.newPassword} 
                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                    placeholder="********"
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
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Confirmar Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={passwords.confirmPassword} 
                    onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} 
                    placeholder="********"
                    required 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    {showConfirmPassword ? (
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
              <button type="submit" className="submit-btn">Actualizar Contraseña</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
