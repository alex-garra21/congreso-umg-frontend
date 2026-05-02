import React, { useState } from 'react';
import { changePassword } from '../utils/auth';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import Modal from './ui/Modal';
import Alert from './ui/Alert';

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

  const clearFields = () => {
    setPasswords({ newPassword: '', confirmPassword: '' });
    setError(null);
    setShowSuccess(false);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "¡Contraseña Cambiada!" : "Cambiar contraseña"}
      maxWidth="400px"
      zIndex={10001}
    >
      {showSuccess ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={64} color="#7ed321" />
          </div>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tu contraseña ha sido actualizada con éxito.</p>
          <button className="submit-btn" onClick={handleClose}>Cerrar</button>
        </div>
      ) : (
        <>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Ingresa tu nueva contraseña a continuación.</p>

          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              label="Nueva Contraseña"
              value={passwords.newPassword}
              onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
              placeholder="********"
              required
            />

            <PasswordField
              label="Confirmar Nueva Contraseña"
              value={passwords.confirmPassword}
              onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              placeholder="********"
              required
              style={{ marginBottom: '2rem' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="submit-btn" style={{ flex: 2 }}>Actualizar</button>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleClose}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#fff5f5', 
                  color: '#e53e3e', 
                  border: '1px solid #fed7d7' 
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
