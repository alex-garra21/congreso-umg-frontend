import React, { useState, useEffect } from 'react';
import { registerUser } from '../utils/auth';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.contrasena !== formData.confirmarContrasena) {
      return;
    }

    const result = registerUser({
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
      alert(result.message);
    }
  };

  if (!isOpen) return null;

  const passwordsMatch = formData.contrasena.length > 0 && formData.contrasena === formData.confirmarContrasena;
  const showPasswordError = formData.confirmarContrasena.length > 0 && !passwordsMatch;

  return (
    <div className="modal-bg open" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '440px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

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
                setIsRegistered(false);
                if (onSwitchToLogin) onSwitchToLogin();
                else onClose();
              }}
            >
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Regístrate aquí</h3>
            <p className="modal-sub">Crea una cuenta para apartar tu lugar en el congreso</p>

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

              <div className="form-group">
                <label>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Tu contraseña"
                    required
                    style={{
                      borderColor: passwordsMatch ? '#2e7d32' : undefined,
                      paddingRight: passwordsMatch ? '40px' : '12px'
                    }}
                  />
                  {passwordsMatch && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Confirmar Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    required
                    style={{
                      borderColor: passwordsMatch ? '#2e7d32' : showPasswordError ? '#d32f2f' : undefined,
                      paddingRight: passwordsMatch ? '40px' : '12px'
                    }}
                  />
                  {passwordsMatch && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                {showPasswordError && (
                  <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px', display: 'block', fontWeight: 500 }}>
                    Las contraseñas no coinciden.
                  </span>
                )}
              </div>

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

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-soft)' }}></div>
              <span style={{ margin: '0 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-soft)' }}></div>
            </div>

            <button className="btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Registrarse con Google
            </button>

            <p className="switch-link" style={{ marginTop: '1.5rem' }}>
              ¿Ya tienes cuenta? <span onClick={onSwitchToLogin} style={{ cursor: 'pointer' }}>Inicia sesión aquí</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
