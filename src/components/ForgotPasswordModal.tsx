import { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from '../utils/auth';
import { Icons } from './Icons';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el contador de reenvío
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!correo) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { success, message } = await sendPasswordResetEmail(correo.trim());
      if (success) {
        setIsSent(true);
        setCountdown(60); // Iniciar contador de 60 segundos
      } else {
        setError(message);
      }
    } catch (err: any) {
      setError('Error al enviar el correo. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-bg open" style={{ zIndex: 10000 }}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {isSent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Icons.CheckCircle size={70} color="#7ed321" />
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Syne' }}>¡Enlace Enviado!</h2>
            <p className="modal-sub" style={{ marginBottom: '2rem' }}>
              Hemos enviado un enlace de recuperación a <strong>{correo}</strong>.
            </p>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                ¿No recibiste el correo? Revisa tu carpeta de spam o espera a que el contador termine para reenviar.
              </p>
            </div>

            <button 
              className="submit-btn" 
              onClick={() => handleSendCode()} 
              disabled={isLoading || countdown > 0}
              style={{ width: '100%', marginBottom: '1rem', opacity: countdown > 0 ? 0.6 : 1 }}
            >
              {isLoading ? 'Reenviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar correo'}
            </button>
            
            <button 
              className="ghost-btn" 
              onClick={onClose}
              style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}
            >
              Cerrar y revisar mi correo
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 style={{ fontSize: '22px', fontFamily: 'Syne' }}>Recuperar Contraseña</h2>
              <p className="modal-sub">
                Ingresa tu correo y te enviaremos un enlace para que puedas asignar una nueva contraseña.
              </p>
            </div>

            {error && <div className="error-banner" style={{ background: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px', fontWeight: 600, border: '1px solid #fed7d7' }}>{error}</div>}

            <form className="modal-form" onSubmit={handleSendCode}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--blue)', marginBottom: '8px', display: 'block' }}>CORREO ELECTRÓNICO</label>
                <input 
                  type="email" 
                  className="dashboard-input"
                  placeholder="ejemplo@correo.com" 
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{ width: '100%' }}
                />
              </div>

              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '1.5rem', fontStyle: 'italic', display: 'flex', gap: '5px', alignItems: 'center' }}>
                <Icons.AlertTriangle size={14} />
                Asegúrate de escribir tu correo correctamente para recibir el enlace.
              </p>
              
              <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: '100%' }}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
