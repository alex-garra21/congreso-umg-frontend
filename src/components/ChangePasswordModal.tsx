import React, { useState } from 'react';
import { verifyAndChangePassword } from '../utils/auth';
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
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFields = () => {
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
    setShowSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwords.oldPassword) {
      setError('Debes ingresar tu contraseña actual.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyAndChangePassword(passwords.oldPassword, passwords.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
              label="Contraseña Actual"
              value={passwords.oldPassword}
              onChange={e => setPasswords({...passwords, oldPassword: e.target.value})}
              placeholder="********"
              required
            />

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
              <button 
                type="submit" 
                className="submit-btn" 
                style={{ flex: 2, opacity: isSubmitting ? 0.7 : 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleClose}
                disabled={isSubmitting}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#fff5f5', 
                  color: '#e53e3e', 
                  border: '1px solid #fed7d7',
                  opacity: isSubmitting ? 0.7 : 1
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
