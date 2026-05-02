import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, validatePasswordStrength } from '../utils/auth';
import PasswordField from '../components/PasswordField';
import { Icons } from '../components/Icons';
import Alert from '../components/ui/Alert';
import { supabase } from '../utils/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
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
    // Verificar si venimos de un flujo de recuperación real
    const isRecovery = sessionStorage.getItem('is_recovering_pw') === 'true';
    
    if (!isRecovery) {
      navigate('/');
      return;
    }

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

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
    } catch (err) {
      console.error("Error fetching profile for reset page:", err);
      navigate('/');
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

  const currentPasswordStrength = formData.newPassword.length > 0 ? validatePasswordStrength(formData.newPassword) : null;
  const passwordsMatch = formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className="reset-password-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1e3a8a 0%, #0f172a 100%)',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--blue)', 
            borderRadius: '15px', 
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Icons.Check size={32} />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '24px', color: 'var(--blue)', margin: 0 }}>
            XIV Congreso de Ingeniería
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Sistemas UMG - Cobán 2026
          </p>
        </div>

        {showSuccess ? (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Icons.CheckCircle size={80} color="#16a34a" />
            </div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#16a34a', marginBottom: '1rem' }}>
              ¡Contraseña Actualizada!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '15px', lineHeight: '1.6' }}>
              Tu cuenta ha sido protegida con la nueva contraseña. Ya puedes cerrar esta ventana e iniciar sesión normalmente.
            </p>
            <button className="submit-btn" style={{ width: '100%' }} onClick={() => {
              sessionStorage.removeItem('is_recovering_pw');
              navigate('/');
            }}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            {/* Tarjeta de Identidad */}
            <div style={{ 
              background: 'rgba(241, 245, 249, 0.8)', 
              padding: '1.25rem', 
              borderRadius: '16px', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              textAlign: 'left',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: 'var(--blue)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                overflow: 'hidden',
                flexShrink: 0,
                fontSize: '20px',
                fontWeight: 800
              }}>
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  userProfile?.name.charAt(0) || '?'
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontFamily: 'Syne', color: 'var(--blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.name || 'Verificando...'}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile?.email}
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '1.5rem', fontFamily: 'Syne' }}>Restablecer Contraseña</h3>

            {error && (
              <Alert variant="error" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <PasswordField
                label="Nueva Contraseña"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Min. 6 caracteres"
                required
                success={currentPasswordStrength?.isValid}
                autoComplete="new-password"
              />

              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '-10px', marginBottom: '15px', lineHeight: '1.4' }}>
                Requisitos: <strong>6 caracteres, Mayúscula, Minúscula y Número.</strong>
                {currentPasswordStrength && !currentPasswordStrength.isValid && (
                  <span style={{ color: '#ef4444', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                    * {currentPasswordStrength.message}
                  </span>
                )}
                {currentPasswordStrength && currentPasswordStrength.isValid && (
                  <span style={{ color: '#16a34a', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                    ✓ Cumple con los requisitos
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
                style={{ marginBottom: '2.5rem' }}
              />

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isSubmitting || isLoadingProfile}
                style={{ width: '100%', height: '50px', fontSize: '16px', opacity: (isSubmitting || isLoadingProfile) ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
