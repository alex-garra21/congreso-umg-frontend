import React, { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from '../utils/auth';
import { Icons } from './Icons';
import LoadingButton from './ui/LoadingButton';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import Alert from './ui/Alert';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setError(null);
    
    try {
      const { success, message } = await sendPasswordResetEmail(correo.trim());
      if (success) {
        setIsSent(true);
        setCountdown(60);
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isSent ? "¡Enlace Enviado!" : "Recuperar Contraseña"}
      maxWidth="420px"
      blur={false} // Evitar duplicar el blur sobre el login
      overlayColor="rgba(0, 0, 0, 0.4)" // Fondo más suave para no oscurecer demasiado
      zIndex={10001}
    >
      {isSent ? (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={80} color="#7ed321" strokeWidth={1.5} />
          </div>
          <p className="modal-sub" style={{ marginBottom: '2rem' }}>
            Hemos enviado un enlace de recuperación a <br />
            <strong style={{ color: 'var(--text-primary)' }}>{correo}</strong>
          </p>
          
          <div style={{ 
            background: 'var(--bg-app)', 
            padding: '1.2rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            border: '1px solid var(--border-soft)'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              ¿No recibiste el correo? Revisa tu carpeta de spam o espera a que el contador termine para reenviar.
            </p>
          </div>

          <LoadingButton 
            isLoading={isLoading} 
            loadingText="Reenviando..." 
            disabled={countdown > 0}
            onClick={() => handleSendCode()} 
            fullWidth
            style={{ marginBottom: '1rem' }}
          >
            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar enlace'}
          </LoadingButton>
          
          <button 
            className="btn-ghost" 
            onClick={onClose}
            style={{ width: '100%', border: 'none' }}
          >
            Cerrar y revisar mi correo
          </button>
        </div>
      ) : (
        <>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>
            Ingresa tu correo y te enviaremos un enlace para que puedas asignar una nueva contraseña.
          </p>

          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSendCode}>
            <FormField label="Correo Electrónico" required>
              <input 
                type="email" 
                className="dashboard-input"
                placeholder="ejemplo@correo.com" 
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                required
                disabled={isLoading}
              />
            </FormField>

            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              marginBottom: '2rem', 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'flex-start',
              background: 'var(--bg-app)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border-soft)'
            }}>
              <span style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b', display: 'flex' }}>
                <Icons.AlertTriangle size={16} />
              </span>
              <span>Asegúrate de escribir tu correo correctamente para recibir el enlace de recuperación.</span>
            </div>
            
            <LoadingButton 
              type="submit" 
              isLoading={isLoading} 
              loadingText="Enviando..." 
              fullWidth
            >
              Enviar enlace de recuperación
            </LoadingButton>
          </form>
        </>
      )}
    </Modal>
  );
}
