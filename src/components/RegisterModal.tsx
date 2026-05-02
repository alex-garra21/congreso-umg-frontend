import React, { useState, useEffect } from 'react';
import { useRegisterUser } from '../api/hooks/useUsers';
import PasswordField from './PasswordField';
import { Icons } from './Icons';
import { showToast } from '../utils/swal';
import Modal from './ui/Modal';
import FormField from './ui/FormField';
import Alert from './ui/Alert';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const registerUserMutation = useRegisterUser();
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    sexo: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    tipoParticipante: 'externo' as 'alumno' | 'externo',
    carnet: '',
    ciclo: ''
  });

  const [error, setError] = useState<string | null>(null);

  // Auto-detección de dominio institucional
  useEffect(() => {
    if (formData.correo.toLowerCase().endsWith('@miumg.edu.gt')) {
      if (formData.tipoParticipante !== 'alumno') {
        setFormData((prev: any) => ({ ...prev, tipoParticipante: 'alumno' }));
      }
    }
  }, [formData.correo]);

  const formatCarnet = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
      if (digits.length > 4) {
        formatted += '-' + digits.substring(4, 6);
        if (digits.length > 6) {
          formatted += '-' + digits.substring(6, 12);
        }
      }
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'carnet') {
      setFormData((prev: any) => ({ ...prev, [name]: formatCarnet(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const clearFields = () => {
    setFormData({
      nombres: '', apellidos: '', sexo: '', correo: '', contrasena: '', confirmarContrasena: '',
      tipoParticipante: 'externo', carnet: '', ciclo: ''
    });
    setError(null);
    setIsRegistered(false);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  const handleSwitch = () => {
    clearFields();
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica adicional
    if (formData.contrasena !== formData.confirmarContrasena) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    const result = await registerUserMutation.mutateAsync({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      sexo: formData.sexo,
      correo: formData.correo,
      contrasena: formData.contrasena,
      tipoParticipante: formData.tipoParticipante,
      carnet: formData.tipoParticipante === 'alumno' ? formData.carnet : '',
      ciclo: formData.tipoParticipante === 'alumno' ? formData.ciclo : ''
    });

    if (result.success) {
      setIsRegistered(true);
      setFormData({
        nombres: '', apellidos: '', sexo: '', correo: '', contrasena: '', confirmarContrasena: '',
        tipoParticipante: 'externo', carnet: '', ciclo: ''
      });
    } else {
      setError(result.message);
    }
  };

  const passwordsMatch = formData.contrasena.length > 0 && formData.contrasena === formData.confirmarContrasena;
  const showPasswordError = formData.confirmarContrasena.length > 0 && !passwordsMatch;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isRegistered ? "¡Registro Exitoso!" : "Regístrate aquí"}
      maxWidth="440px"
      zIndex={9999}
    >
      {isRegistered ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={80} color="#7ed321" strokeWidth={1.5} />
          </div>
          <p className="modal-sub" style={{ marginBottom: '2rem' }}>
            Tu cuenta ha sido creada correctamente. Ahora puedes acceder a la plataforma.
          </p>
          <button
            className="submit-btn"
            onClick={() => {
              if (onSwitchToLogin) handleSwitch();
              else handleClose();
            }}
          >
            Ir al inicio de sesión
          </button>
        </div>
      ) : (
        <>
          <p className="modal-sub" style={{ marginBottom: '0.5rem' }}>Crea una cuenta para participar en el congreso</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>

          {error && (
            <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="Nombres" required style={{ flex: 1 }}>
                <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan Manuel" required className="dashboard-input" />
              </FormField>
              <FormField label="Apellidos" required style={{ flex: 1 }}>
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Pérez López" required className="dashboard-input" />
              </FormField>
            </div>

            <FormField label="Tipo de Participante" required>
              <select name="tipoParticipante" value={formData.tipoParticipante} onChange={handleChange} required className="dashboard-input">
                <option value="externo">Participante externo</option>
                <option value="alumno">Alumno UMG</option>
              </select>
            </FormField>

            {formData.tipoParticipante === 'alumno' && (
              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <FormField label="Carnet" required style={{ flex: 2 }}>
                  <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} placeholder="Ej: 2023-00-1234" required className="dashboard-input" />
                </FormField>
                <FormField label="Ciclo" required style={{ flex: 1 }}>
                  <select name="ciclo" value={formData.ciclo} onChange={handleChange} required className="dashboard-input">
                    <option value="">Selección</option>
                    {[ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X' ].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="Sexo" required style={{ flex: 1 }}>
                <select name="sexo" value={formData.sexo} onChange={handleChange} required className="dashboard-input">
                  <option value="">Selección</option>
                  <option value="M">Hombre</option>
                  <option value="F">Mujer</option>
                </select>
              </FormField>
              <FormField label="Correo Electrónico" required style={{ flex: 2 }}>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required className="dashboard-input" />
              </FormField>
            </div>

            <PasswordField
              label={<>Contraseña <span style={{ color: '#ef4444' }}>*</span></>}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
              success={passwordsMatch}
              autoComplete="new-password"
            />

            <PasswordField
              label={<>Confirmar Contraseña <span style={{ color: '#ef4444' }}>*</span></>}
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              success={passwordsMatch}
              error={showPasswordError}
              autoComplete="new-password"
              style={{ marginBottom: '1.5rem' }}
            />

            {showPasswordError && (
              <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', display: 'block', fontWeight: 500 }}>
                Las contraseñas no coinciden.
              </span>
            )}

            <button
              type="submit"
              className="submit-btn"
              style={{
                marginBottom: '1rem',
                opacity: !passwordsMatch || !formData.correo ? 0.6 : 1,
                cursor: !passwordsMatch || !formData.correo ? 'not-allowed' : 'pointer'
              }}
            >
              Crear Cuenta
            </button>
          </form>

          <p className="switch-link" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            ¿Ya tienes cuenta? <span onClick={handleSwitch} style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 700 }}>Inicia sesión aquí</span>
          </p>
        </>
      )}
    </Modal>
  );
}
