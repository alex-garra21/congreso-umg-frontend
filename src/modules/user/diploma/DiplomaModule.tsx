import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../api/hooks/useAuth';
import { updateUserDataMutation } from '../../../api/supabase/users/userMutations';
import type { UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import diplomaTemplate from '../../../assets/diploma-template.png';
import { showAlert } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';
import FormField from '../../../components/ui/FormField';
import LoadingButton from '../../../components/ui/LoadingButton';

export default function DiplomaModule() {
  const { user, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreDiploma: '',
    correoDiploma: ''
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Lógica de sugerencia inteligente:
      // Si el nombre completo cabe (<= 25 caracteres), se sugiere completo.
      // Si es más largo, se sugiere solo primer nombre y primer apellido.
      const fullName = `${user.nombres} ${user.apellidos}`.trim().toUpperCase();
      let suggestedName = '';

      if (fullName.length <= 25) {
        suggestedName = fullName;
      } else {
        const firstName = (user.nombres || '').trim().split(' ')[0] || '';
        const firstSurname = (user.apellidos || '').trim().split(' ')[0] || '';
        suggestedName = `${firstName} ${firstSurname}`.trim().toUpperCase().substring(0, 25);
      }

      setFormData({
        nombreDiploma: user.nombreDiploma || suggestedName,
        correoDiploma: user.correoDiploma || user.correo || ''
      });
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitimos letras, tildes, la Ñ, espacios, guiones y puntos
    const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ \-\.]/g, '');
    setFormData(prev => ({ ...prev, nombreDiploma: value.substring(0, 25) }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setFormData(prev => ({ ...prev, correoDiploma: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.diplomaEditado) return;
    setIsSaving(true);

    const updatedUser: UserData = {
      ...user,
      nombreDiploma: formData.nombreDiploma,
      correoDiploma: formData.correoDiploma,
      diplomaEditado: true
    };

    const result = await updateUserDataMutation(updatedUser);
    if (result.success) {
      setIsSuccessModalOpen(true);
      refetchProfile();
    } else {
      showAlert('Error', result.error?.message || 'Error al guardar los datos', 'error');
    }
    setIsSaving(false);
  };

  const isDiplomaNameTooLong = formData.nombreDiploma.length > 25;
  const isLocked = user?.diplomaEditado || false;
  const isPaid = user?.pagoValidado || false;

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

        {!isPaid ? (
          <Alert variant="warning" title="PAGO PENDIENTE">
            Debes validar tu pago para poder confirmar los datos de tu diploma. Una vez validado, podrás ingresar tu nombre y correo para la emisión de tus certificados.
          </Alert>
        ) : (
          !isLocked && (
            <Alert variant="error" title="ATENCIÓN">
              IMPORTANTE: Solo puedes modificar estos datos UNA VEZ. Una vez guardados, los campos se bloquearán permanentemente.
            </Alert>
          )
        )}

        <Alert variant="info" title="¿Cuándo recibirás tu diploma?" icon={<Icons.Award size={20} />}>
          <p>El diploma se genera y envía automáticamente por cada taller en el que cumplas <strong>los tres requisitos</strong>:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Estar inscrito al Congreso 2026 con pago validado</li>
            <li>Haber seleccionado el taller específico en tu agenda</li>
            <li>Haber confirmado tu asistencia escaneando el QR durante el taller</li>
          </ul>
        </Alert>

        <form onSubmit={handleSave} className="diploma-form" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', opacity: !isPaid ? 0.6 : 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            <FormField
              label="Nombre para el diploma"
              required
              error={isDiplomaNameTooLong ? "El nombre es demasiado largo (máximo 25 caracteres)." : undefined}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.nombreDiploma}
                  onChange={handleNameChange}
                  placeholder="EJ: MARÍA GARCÍA"
                  required
                  readOnly={isLocked || !isPaid}
                  className="dashboard-input"
                  style={{
                    borderColor: isDiplomaNameTooLong ? '#d32f2f' : undefined,
                    backgroundColor: (isLocked || !isPaid) ? '#f8fafc' : undefined,
                    color: (isLocked || !isPaid) ? '#64748b' : undefined,
                    cursor: (isLocked || !isPaid) ? 'not-allowed' : 'text'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: isDiplomaNameTooLong ? '#d32f2f' : '#718096' }}>
                    {formData.nombreDiploma.length} / 25 caracteres
                  </span>
                </div>
              </div>
            </FormField>

            <FormField
              label="Correo para recibir el diploma"
              required
              description="Se enviará un diploma por cada taller donde se confirme tu asistencia."
            >
              <input
                type="email"
                value={formData.correoDiploma}
                onChange={handleEmailChange}
                placeholder="ejemplo@correo.com"
                required
                readOnly={isLocked || !isPaid}
                className="dashboard-input"
                style={{
                  backgroundColor: (isLocked || !isPaid) ? '#f8fafc' : undefined,
                  color: (isLocked || !isPaid) ? '#64748b' : undefined,
                  cursor: (isLocked || !isPaid) ? 'not-allowed' : 'text'
                }}
              />
            </FormField>

            <Alert variant="warning" title="Verifica bien tus datos">
              Una vez emitido el diploma, el nombre <strong>no podrá modificarse</strong>. Asegúrate de que esté escrito correctamente y con las tildes correspondientes.
            </Alert>

            {!isLocked ? (
              <div className="diploma-actions" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <LoadingButton
                  type="submit"
                  isLoading={isSaving}
                  loadingText="Guardando..."
                  style={{
                    width: 'auto',
                    padding: '12px 32px',
                    opacity: (isDiplomaNameTooLong || !isPaid) && !isSaving ? 0.6 : 1,
                    cursor: (isDiplomaNameTooLong || !isPaid) ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isDiplomaNameTooLong || !isPaid}
                >
                  Guardar datos
                </LoadingButton>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={!isPaid}
                  style={{
                    width: 'auto',
                    padding: '12px 24px',
                    border: '1.5px solid #e2e8f0',
                    color: '#4a5568',
                    borderRadius: '12px',
                    opacity: !isPaid ? 0.6 : 1,
                    cursor: !isPaid ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    const fullName = `${user.nombres} ${user.apellidos}`.trim().toUpperCase();
                    let suggestedName = '';
                    if (fullName.length <= 25) {
                      suggestedName = fullName;
                    } else {
                      const firstName = (user.nombres || '').trim().split(' ')[0] || '';
                      const firstSurname = (user.apellidos || '').trim().split(' ')[0] || '';
                      suggestedName = `${firstName} ${firstSurname}`.trim().toUpperCase().substring(0, 25);
                    }
                    setFormData({
                      nombreDiploma: suggestedName,
                      correoDiploma: user.correo || ''
                    });
                  }}
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
              <img src={diplomaTemplate} alt="Template de Diploma" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

              <div style={{
                position: 'absolute',
                top: '42%',
                width: '80%',
                textAlign: 'center',
                fontSize: 'clamp(8px, 1.8vw, 24px)',
                fontFamily: 'Source Sans 3, sans-serif',
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

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="¡Datos bloqueados!"
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={64} color="#7ed321" />
          </div>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>
            Tus datos para diplomas han sido guardados y no podrán ser editados nuevamente.
          </p>
          <button className="submit-btn" onClick={() => setIsSuccessModalOpen(false)}>Entendido</button>
        </div>
      </Modal>

      {/* Botón regresar al inicio */}
      <div style={{ display: 'flex', justifySelf: 'center', marginTop: '2rem', marginBottom: '1rem', width: '100%', justifyContent: 'center' }}>
        <button className="btn-lg btn-lg-primary" style={{ background: 'var(--accent-primary)', border: 'none', padding: '1rem 3rem', borderRadius: '100px', fontSize: '16px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Ir al Inicio
        </button>
      </div>
    </div>
  );
}

