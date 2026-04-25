import { useState } from 'react';
import { sendPasswordResetEmail, resetPasswordWithOTP } from '../utils/auth';

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
  const [showPassword, setShowPassword] = useState(false);

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
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
            <div className="form-group">
              <label>NUEVA CONTRASEÑA</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Mínimo 6 caracteres" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
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
