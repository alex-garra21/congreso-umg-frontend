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
        <button className="modal-close" onClick={onClose}>✕</button>

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
            <button className="submit-btn" onClick={() => { setShowSuccess(false); onClose(); }}>Cerrar</button>
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
                <input 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                  placeholder="********"
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword} 
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} 
                  placeholder="********"
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">Actualizar Contraseña</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
