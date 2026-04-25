import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUserData, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';
import diplomaTemplate from '../assets/diploma-template.png';

export default function DiplomaModule() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const [formData, setFormData] = useState({
    nombreDiploma: '',
    correoDiploma: ''
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombreDiploma: user.nombreDiploma || `${user.nombres} ${user.apellidos}`.toUpperCase(),
        correoDiploma: user.correoDiploma || user.correo || ''
      });
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ ]/g, '');
    setFormData(prev => ({ ...prev, nombreDiploma: value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setFormData(prev => ({ ...prev, correoDiploma: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.diplomaEditado) return;

    const updatedUser: UserData = {
      ...user,
      nombreDiploma: formData.nombreDiploma,
      correoDiploma: formData.correoDiploma,
      diplomaEditado: true
    };

    const result = updateUserData(updatedUser);
    if (result.success) {
      setIsSuccessModalOpen(true);
      setUser(getCurrentUser());
    } else {
      alert(result.message);
    }
  };

  const isDiplomaNameTooLong = formData.nombreDiploma.length > 25;
  const isLocked = user?.diplomaEditado || false;

  if (!user) return null;

  return (
    <div className="diploma-module">
      <ModuleTitle title="Datos para diploma" />
      <section className="dashboard-section diploma-container">
        <div className="diploma-header">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '2rem' }}>
            Ingresa exactamente cómo deseas que aparezca tu nombre en el diploma y el correo donde quieres recibirlo.
          </p>
        </div>

        {/* Warning Only Once */}
        {!isLocked && (
          <div style={{ 
            backgroundColor: '#fff5f5', 
            border: '1.5px solid #feb2b2', 
            borderRadius: '12px', 
            padding: '1rem 1.5rem', 
            marginBottom: '2rem',
            color: '#c53030',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              IMPORTANTE: Solo puedes modificar estos datos UNA VEZ. Una vez guardados, los campos se bloquearán permanentemente.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div style={{ 
          backgroundColor: '#eef6ff', 
          border: '1px solid #cce3ff', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          color: '#2c5282'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', marginBottom: '10px', color: '#1a365d' }}>
            <span role="img" aria-label="grad-cap">🎓</span> ¿Cuándo recibirás tu diploma?
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '1rem' }}>
            El diploma se genera y envía automáticamente por cada taller en el que cumplas <strong>los tres requisitos</strong>:
          </p>
          <ul style={{ fontSize: '14px', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Estar inscrito al Congreso 2026 con pago validado</li>
            <li>Haber seleccionado el taller específico en tu agenda</li>
            <li>Haber confirmado tu asistencia escaneando el QR durante el taller</li>
          </ul>
        </div>

        <form onSubmit={handleSave} className="diploma-form" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* Columna Izquierda: Campos y Avisos */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                NOMBRE PARA EL DIPLOMA *
              </label>
              <input
                type="text"
                name="nombreDiploma"
                value={formData.nombreDiploma}
                onChange={handleNameChange}
                placeholder="EJ: MARÍA ELENA GARCÍA LÓPEZ"
                required
                readOnly={isLocked}
                style={{ 
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  borderColor: isDiplomaNameTooLong ? '#d32f2f' : '#e2e8f0',
                  backgroundColor: isLocked ? '#f8fafc' : '#fff',
                  color: isLocked ? '#64748b' : 'inherit',
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: isDiplomaNameTooLong ? '#d32f2f' : '#718096' }}>
                  {formData.nombreDiploma.length} / 25 caracteres
                </span>
              </div>
              {isDiplomaNameTooLong && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  El nombre es demasiado largo (máximo 25 caracteres).
                </span>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', display: 'block' }}>
                CORREO PARA RECIBIR EL DIPLOMA *
              </label>
              <input 
                type="email" 
                name="correoDiploma" 
                value={formData.correoDiploma} 
                onChange={handleEmailChange}
                placeholder="ejemplo@correo.com"
                required
                readOnly={isLocked}
                style={{ 
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '16px',
                  backgroundColor: isLocked ? '#f8fafc' : '#fff',
                  color: isLocked ? '#64748b' : 'inherit',
                  cursor: isLocked ? 'not-allowed' : 'text'
                }} 
              />
              <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
                Se enviará un diploma por cada taller donde se confirme tu asistencia.
              </p>
            </div>

            {/* Warning Box */}
            <div style={{ 
              backgroundColor: '#fffaf0', 
              border: '1px solid #feebc8', 
              borderRadius: '12px', 
              padding: '1.25rem', 
              color: '#7b341e',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Verifica bien tus datos</strong>
                <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  Una vez emitido el diploma, el nombre <strong>no podrá modificarse</strong>. Asegúrate de que esté escrito correctamente y con las tildes correspondientes.
                </p>
              </div>
            </div>

            {/* Botones / Mensaje de bloqueo */}
            {!isLocked ? (
              <div className="diploma-actions" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{
                    width: 'auto',
                    padding: '12px 32px',
                    opacity: isDiplomaNameTooLong ? 0.6 : 1,
                    cursor: isDiplomaNameTooLong ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isDiplomaNameTooLong}
                >
                  Guardar datos
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: 'auto', padding: '12px 24px', border: '1.5px solid #e2e8f0', color: '#4a5568', borderRadius: '12px' }}
                  onClick={() => setFormData({
                    nombreDiploma: `${user.nombres} ${user.apellidos}`.toUpperCase(),
                    correoDiploma: user.correo || ''
                  })}
                >
                  Limpiar
                </button>
              </div>
            ) : (
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: '#f0fff4', 
                border: '1px solid #c6f6d5', 
                borderRadius: '12px', 
                color: '#2f855a',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Los datos han sido guardados y bloqueados. No se permiten más modificaciones.
              </div>
            )}
          </div>

          {/* Columna Derecha: Previsualización */}
          <div style={{ flex: 1, position: 'sticky', top: '2rem' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', display: 'block' }}>
              ASÍ APARECERÁ EN TU DIPLOMA
            </label>
            <div style={{ 
              position: 'relative',
              width: '100%',
              aspectRatio: '1.414',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img 
                src={diplomaTemplate} 
                alt="Template de Diploma" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              
              <div style={{
                position: 'absolute',
                top: '49%',
                width: '80%',
                textAlign: 'center',
                fontSize: 'clamp(8px, 1.8vw, 24px)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                color: '#1a365d',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {formData.nombreDiploma || 'TU NOMBRE AQUÍ'}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Previsualización Ilustrativa
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#718096', marginTop: '12px', textAlign: 'center', fontStyle: 'italic', maxWidth: '400px', margin: '12px auto 0' }}>
              * Esta imagen es puramente ilustrativa y no representa el diseño final del diploma oficial.
            </p>
          </div>

        </form>
      </section>

      {/* Modal de Éxito */}
      {isSuccessModalOpen && (
        <div className="modal-bg open" onClick={() => setIsSuccessModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#7ed321" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>¡Datos bloqueados!</h3>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tus datos para diplomas han sido guardados y no podrán ser editados nuevamente.</p>
            <button className="submit-btn" onClick={() => setIsSuccessModalOpen(false)}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}
