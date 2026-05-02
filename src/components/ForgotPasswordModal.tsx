import { useState } from 'react';
import { sendPasswordResetEmail, resetPasswordWithOTP, validatePasswordStrength } from '../utils/auth';
import PasswordField from './PasswordField';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [correo, setCorreo] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const { success, message } = await sendPasswordResetEmail(correo);
      if (success) {
        setStep(2);
        setSuccessMsg(message);
      } else {
        setError(message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      setError('Por favor, ingresa el código y tu nueva contraseña.');
      return;
    }
    
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { success, message } = await resetPasswordWithOTP(correo, token, newPassword);
      if (success) {
        setSuccessMsg(message);
        setTimeout(() => {
          onClose(); // Cerrar modal después de un rato
        }, 2000);
      } else {
        setError(message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPasswordStrength = newPassword.length > 0 ? validatePasswordStrength(newPassword) : null;

  return (
    <div className="modal-bg open">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <h2>Recuperar Contraseña</h2>
          <p className="modal-sub">
            {step === 1 
              ? 'Ingresa tu correo y te enviaremos un código de seguridad.' 
              : 'Ingresa el código que enviamos a tu correo.'}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {successMsg && <div className="success-banner" style={{ background: '#ebfbee', color: '#2b8a3e', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px', fontWeight: 600 }}>{successMsg}</div>}

        {step === 1 ? (
          <form className="modal-form" onSubmit={handleSendCode}>
            <div className="form-group">
              <label>CORREO ELECTRÓNICO</label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>CÓDIGO DE RECUPERACIÓN</label>
              <input 
                type="text" 
                placeholder="Ingresa el código de 6 dígitos" 
                value={token}
                onChange={e => setToken(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
              />
            </div>
            
            <PasswordField
              label="NUEVA CONTRASEÑA"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
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
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
            <button type="button" className="ghost-btn" style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#868e96', cursor: 'pointer', fontWeight: 600, marginTop: '10px' }} onClick={() => { setStep(1); setSuccessMsg(''); setError(''); setToken(''); setNewPassword(''); }} disabled={isLoading}>
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
