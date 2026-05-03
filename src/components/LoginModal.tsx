import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';
import ForgotPasswordModal from './ForgotPasswordModal';
import PasswordField from './PasswordField';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import Alert from './ui/Alert';
import LoadingButton from './ui/LoadingButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearFields = () => {
    setCorreo('');
    setContrasena('');
    setError(null);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSwitch = () => {
    clearFields();
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await loginUser(correo, contrasena);
    setIsLoading(false);

    if (result.success) {
      clearFields();
      onClose();
      if (result.user?.rol === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/inicio');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Iniciar sesión"
      maxWidth="440px"
      zIndex={9999}
    >
      <p className="modal-sub" style={{ marginBottom: '0.5rem' }}>Accede para ver tus charlas y estado de pago</p>
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
        Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
      </p>

      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormField label="Correo Electrónico" required>
          <input 
            type="email" 
            value={correo} 
            onChange={(e) => setCorreo(e.target.value)} 
            placeholder="correo@ejemplo.com" 
            required 
            className="dashboard-input"
          />
        </FormField>

        <PasswordField
          label={<>Contraseña <span style={{ color: '#ef4444' }}>*</span></>}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Tu contraseña"
          required
          autoComplete="current-password"
          style={{ marginBottom: '1.5rem' }}
        />

        <LoadingButton 
          type="submit" 
          isLoading={isLoading} 
          loadingText="Verificando..." 
          fullWidth
          style={{ marginBottom: '1rem' }}
        >
          Ingresar
        </LoadingButton>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="switch-link" style={{ fontSize: '13px', margin: 0 }}>
          ¿Olvidaste tu contraseña? <span onClick={() => setIsForgotOpen(true)} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent-primary)' }}>Recupérala aquí</span>
        </p>
        <p className="switch-link" style={{ fontSize: '13px', margin: 0 }}>
          ¿Aún no tienes cuenta? <span onClick={handleSwitch} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent-primary)' }}>Regístrate aquí</span>
        </p>
      </div>

      {isForgotOpen && (
        <ForgotPasswordModal onClose={() => setIsForgotOpen(false)} />
      )}
    </Modal>
  );
}
