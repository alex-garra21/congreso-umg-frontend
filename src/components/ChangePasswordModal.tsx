import React, { useState } from 'react';
import { verifyAndChangePassword, validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import Modal from './ui/Modal';
import Alert from './ui/Alert';
import LoadingButton from './ui/LoadingButton';

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

    const passwordValidation = validatePasswordStrength(passwords.newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
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

  const currentPasswordStrength = passwords.newPassword.length > 0 ? validatePasswordStrength(passwords.newPassword) : null;

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
          <LoadingButton fullWidth onClick={handleClose}>Cerrar</LoadingButton>
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

            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '-10px', marginBottom: '15px', lineHeight: '1.4' }}>
              La contraseña debe tener al menos: <strong>6 caracteres, una letra mayúscula, una minúscula y un número.</strong>
              {currentPasswordStrength && !currentPasswordStrength.isValid && (
                <span style={{ color: '#d32f2f', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                  * {currentPasswordStrength.message}
                </span>
              )}
              {currentPasswordStrength && currentPasswordStrength.isValid && (
                <span style={{ color: '#16a34a', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                  ✓ Contraseña segura
                </span>
              )}
            </div>

            <PasswordField
              label="Confirmar Nueva Contraseña"
              value={passwords.confirmPassword}
              onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
              placeholder="********"
              required
              style={{ marginBottom: '2rem' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <LoadingButton 
                type="submit" 
                isLoading={isSubmitting}
                loadingText="Actualizando..."
                style={{ flex: 2 }}
              >
                Actualizar
              </LoadingButton>
              <LoadingButton 
                type="button" 
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{ 
                  flex: 1,
                  color: '#e53e3e',
                  borderColor: '#fed7d7',
                  background: '#fff5f5'
                }}
              >
                Cancelar
              </LoadingButton>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
