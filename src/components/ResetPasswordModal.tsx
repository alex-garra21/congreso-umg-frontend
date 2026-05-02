import React, { useState, useEffect } from 'react';
import { changePassword, validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import Modal from './ui/Modal';
import Alert from './ui/Alert';
import { supabase } from '../utils/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('nombres, apellidos, correo, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile({
            name: `${profile.nombres} ${profile.apellidos}`,
            email: profile.correo,
            avatar: profile.avatar_url
          });
        }
      }
    } catch (err) {
      console.error("Error fetching profile for reset:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordValidation = validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(formData.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
    } else {
      setError(result.message);
    }
  };

  const handleClose = () => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setError(null);
    setShowSuccess(false);
    setUserProfile(null);
    onClose();
  };

  const currentPasswordStrength = formData.newPassword.length > 0 ? validatePasswordStrength(formData.newPassword) : null;
  const passwordsMatch = formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? "¡Contraseña Actualizada!" : "Nueva Contraseña"}
      maxWidth="400px"
      zIndex={10001}
    >
      {showSuccess ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={70} color="#7ed321" />
          </div>
          <p className="modal-sub" style={{ marginBottom: '2rem' }}>
            Tu contraseña ha sido restablecida correctamente. Ya puedes acceder a tu cuenta.
          </p>
          <button className="submit-btn" onClick={handleClose}>Ir al inicio</button>
        </div>
      ) : (
        <>
          {/* Perfil de Usuario Verificado */}
          <div style={{ 
            background: 'var(--blue-light)', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid var(--border-soft)'
          }}>
            {isLoadingProfile ? (
              <div style={{ height: '40px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--blue)' }}>Verificando cuenta...</span>
              </div>
            ) : (
              <>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'var(--blue)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  overflow: 'hidden',
                  flexShrink: 0,
                  fontSize: '18px',
                  fontWeight: 800
                }}>
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userProfile?.name.charAt(0) || '?'
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontFamily: 'Syne', color: 'var(--blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.name || 'Usuario'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userProfile?.email}
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="modal-sub" style={{ marginBottom: '1.5rem', fontSize: '13px' }}>
            Hola <strong>{userProfile?.name.split(' ')[0]}</strong>, ingresa tu nueva contraseña a continuación.
          </p>

          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              label="Nueva Contraseña"
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Min. 6 caracteres"
              required
              success={currentPasswordStrength?.isValid}
              autoComplete="new-password"
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
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="********"
              required
              success={passwordsMatch}
              error={showMatchError}
              autoComplete="new-password"
              style={{ marginBottom: '2rem' }}
            />

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting || isLoadingProfile}
              style={{ width: '100%', opacity: (isSubmitting || isLoadingProfile) ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Guardando...' : 'Restablecer Contraseña'}
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}
