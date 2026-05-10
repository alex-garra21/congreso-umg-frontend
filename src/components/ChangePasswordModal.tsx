import React, { useState } from 'react';
import { verifyAndChangePassword, validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import Modal from './ui/Modal';
import LoadingButton from './ui/LoadingButton';
import { showToast } from '../utils/swal';
import PasswordRequirements from './PasswordRequirements';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFields = () => {
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.oldPassword) {
      showToast('Debes ingresar tu contraseña actual.', 'warning');
      return;
    }

    if (passwords.newPassword === passwords.oldPassword) {
      showToast('La nueva contraseña no puede ser igual a la actual.', 'warning');
      return;
    }

    const passwordValidation = validatePasswordStrength(passwords.newPassword);
    if (!passwordValidation.isValid) {
      // Ya mostramos los requisitos de forma reactiva, pero si intenta enviar sin cumplir:
      showToast(passwordValidation.message, 'warning');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Las nuevas contraseñas no coinciden.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyAndChangePassword(passwords.oldPassword, passwords.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(result.message, 'error');
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

          <form onSubmit={handleSubmit}>
            <PasswordField
              label="Contraseña Actual"
              value={passwords.oldPassword}
              onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
              placeholder="********"
              required
            />

            <PasswordField
              label="Nueva Contraseña"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              placeholder="********"
              required
            />

            <div style={{ marginTop: '-10px' }}>
              {passwords.newPassword.length > 0 && (
                <PasswordRequirements requirements={currentPasswordStrength?.requirements || []} />
              )}
              {!passwords.newPassword && (
                <div style={{ fontSize: '15px', color: '#ff0000', marginBottom: '20px', fontWeight: 500 }}>
                  Requisitos: 6 caracteres, Mayúscula, Minúscula y Número.
                </div>
              )}
            </div>

            <PasswordField
              label="Confirmar Nueva Contraseña"
              value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
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
