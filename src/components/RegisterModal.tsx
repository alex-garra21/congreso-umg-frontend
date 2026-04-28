import React, { useState, useEffect } from 'react';
import { registerUser } from '../utils/auth';
import PasswordField from './PasswordField';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
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
        setFormData(prev => ({ ...prev, tipoParticipante: 'alumno' }));
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
      setFormData(prev => ({ ...prev, [name]: formatCarnet(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    if (formData.contrasena !== formData.confirmarContrasena) {
      return;
    }

    const result = await registerUser({
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

  if (!isOpen) return null;

  const passwordsMatch = formData.contrasena.length > 0 && formData.contrasena === formData.confirmarContrasena;
  const showPasswordError = formData.confirmarContrasena.length > 0 && !passwordsMatch;

  return (
    <div className="modal-bg open" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '440px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {isRegistered ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#7ed321" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '80px', height: '80px' }}>
                <circle cx="12" cy="12" r="10" />
                {/* Checkmark SVG paths */}
                <path d="M8 12l3 3 5-5" strokeWidth="2.5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '28px', marginBottom: '12px', fontFamily: 'Syne', fontWeight: 800 }}>¡Registro Exitoso!</h3>
            <p className="modal-sub" style={{ marginBottom: '2rem' }}>Tu cuenta ha sido creada correctamente. Ahora puedes acceder a la plataforma.</p>

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
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Regístrate aquí</h3>
            <p className="modal-sub">Crea una cuenta para apartar tu lugar en el congreso</p>

            {error && (
              <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '1.5rem', border: '1px solid #feb2b2' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan Manuel" required />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Pérez López" required />
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Participante</label>
                <select name="tipoParticipante" value={formData.tipoParticipante} onChange={handleChange} required>
                  <option value="externo">Participante externo</option>
                  <option value="alumno">Alumno UMG</option>
                </select>
              </div>

              {formData.tipoParticipante === 'alumno' && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Número de Carnet</label>
                    <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} placeholder="Ej: 20230001234" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Ciclo</label>
                    <select name="ciclo" value={formData.ciclo} onChange={handleChange} required>
                      <option value="">Selección</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                      <option value="VI">VI</option>
                      <option value="VII">VII</option>
                      <option value="VIII">VIII</option>
                      <option value="IX">IX</option>
                      <option value="X">X</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Sexo</label>
                <select name="sexo" value={formData.sexo} onChange={handleChange} required>
                  <option value="">Selección</option>
                  <option value="M">Hombre</option>
                  <option value="F">Mujer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Correo Electrónico al que se enviarán los diplomas</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
              </div>

              <PasswordField
                label="Contraseña"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Tu contraseña"
                required
                success={passwordsMatch}
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirmar Contraseña"
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

            <p className="switch-link" style={{ marginTop: '1.5rem' }}>
              ¿Ya tienes cuenta? <span onClick={handleSwitch} style={{ cursor: 'pointer' }}>Inicia sesión aquí</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
