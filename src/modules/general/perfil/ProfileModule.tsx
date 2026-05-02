import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { useUpdateUserData } from '../../../api/hooks/useUsers';
import { type UserData } from '../../../utils/auth';
import ChangePasswordModal from '../../../components/ChangePasswordModal';
import ModuleTitle from '../../../components/ModuleTitle';
import { showAlert } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AvatarUpload from '../../../components/ui/AvatarUpload';

export default function ProfileModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateUserDataMutation = useUpdateUserData();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    dpi: '',
    tipoParticipante: 'externo' as 'alumno' | 'externo',
    carnet: '',
    ciclo: '',
    telefono: '',
    sexo: '',
    avatarUrl: '',
  });

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        correo: user.correo || '',
        dpi: user.dpi || '',
        tipoParticipante: user.tipoParticipante || 'externo',
        carnet: user.carnet || '',
        ciclo: user.ciclo || '',
        telefono: user.telefono || '',
        sexo: user.sexo || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // Auto-detección en tiempo real en el perfil
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

    if (name === 'dpi') {
      const numbers = value.replace(/\D/g, '').substring(0, 13);
      let formatted = numbers;
      if (numbers.length > 4) formatted = numbers.substring(0, 4) + ' ' + numbers.substring(4);
      if (numbers.length > 9) formatted = formatted.substring(0, 10) + ' ' + numbers.substring(9);
      setFormData((prev: any) => ({ ...prev, dpi: formatted }));
      return;
    }

    if (name === 'carnet') {
      setFormData((prev: any) => ({ ...prev, [name]: formatCarnet(value) }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: UserData = {
      ...user,
      ...formData,
      carnet: formData.tipoParticipante === 'alumno' ? formData.carnet : '',
      ciclo: formData.tipoParticipante === 'alumno' ? formData.ciclo : ''
    };

    try {
      await updateUserDataMutation.mutateAsync(updatedUser);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      showAlert('Error', error?.message || 'Error al actualizar datos', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-module">
      <ModuleTitle title="Mi perfil" />
      <section className="dashboard-section profile-container">
        <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <AvatarUpload 
            userId={user.id!} 
            currentAvatarUrl={formData.avatarUrl} 
            initials={(user.nombres?.[0] || '') + (user.apellidos?.[0] || '')}
            onAvatarChange={async (newUrl) => {
              setFormData(prev => ({ ...prev, avatarUrl: newUrl }));
              // Auto-guardar la foto en la base de datos de inmediato
              try {
                await updateUserDataMutation.mutateAsync({ ...user, avatarUrl: newUrl });
              } catch (e) {
                console.error("Error auto-guardando avatar:", e);
              }
            }} 
          />
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px' }}>Información personal</h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Estos datos se usarán para tu identificación en el evento y para la gestión de tu cuenta.</p>
          <br />
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row">
            <FormField label="Nombres" style={{ flex: 1 }}>
              <input 
                type="text" 
                name="nombres" 
                value={formData.nombres} 
                onChange={handleChange} 
                placeholder="Nombres" 
                readOnly 
                className="dashboard-input"
              />
            </FormField>
            <FormField label="Apellidos" style={{ flex: 1 }}>
              <input 
                type="text" 
                name="apellidos" 
                value={formData.apellidos} 
                onChange={handleChange} 
                placeholder="Apellidos" 
                readOnly 
                className="dashboard-input"
              />
            </FormField>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <FormField label="DPI" required style={{ flex: 3 }}>
              <input type="text" name="dpi" value={formData.dpi} onChange={handleChange} placeholder="0000 00000 0000" required className="dashboard-input" />
            </FormField>
            <FormField label="Sexo" required style={{ flex: 1 }}>
              <select name="sexo" value={formData.sexo} onChange={handleChange} required className="dashboard-input">
                <option value="">Selección</option>
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
              </select>
            </FormField>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <FormField label="Correo de acceso" style={{ flex: 2 }}>
              <input 
                type="email" 
                name="correo" 
                value={formData.correo} 
                readOnly 
                className="dashboard-input"
              />
            </FormField>
            <FormField label="Tipo de participante" required style={{ flex: 1 }}>
              <select name="tipoParticipante" value={formData.tipoParticipante} onChange={handleChange} required className="dashboard-input">
                <option value="externo">Participante externo</option>
                <option value="alumno">Alumno UMG</option>
              </select>
            </FormField>
          </div>

          {formData.tipoParticipante === 'alumno' && (
            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="Número de carnet" required style={{ flex: 3 }}>
                <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} placeholder="Ej: 0902-20-698" required className="dashboard-input" />
              </FormField>
              <FormField label="Ciclo" required style={{ flex: 1 }}>
                <select name="ciclo" value={formData.ciclo} onChange={handleChange} required className="dashboard-input">
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
              </FormField>
            </div>
          )}

          <div className="form-row">
            <FormField label="Teléfono (opcional)" style={{ flex: 1 }}>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="0000 0000" className="dashboard-input" />
            </FormField>
          </div>

          <div className="profile-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '12px 32px' }}>
              Guardar cambios
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ width: 'auto', padding: '12px 24px', border: '1.5px solid var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'transparent' }}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </section>
      
      {/* Botón regresar al inicio */}
      <div style={{ display: 'flex', justifySelf: 'center', marginTop: '2rem', marginBottom: '1rem', width: '100%', justifyContent: 'center' }}>
        <button className="btn-lg btn-lg-primary" style={{ background: 'var(--accent-primary)', border: 'none', padding: '1rem 3rem', borderRadius: '100px', fontSize: '16px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Ir al Inicio
        </button>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="¡Cambios Guardados!"
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={64} color="var(--status-success)" />
          </div>
          <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tu información ha sido actualizada correctamente.</p>
          <button className="submit-btn" onClick={() => setIsSuccessModalOpen(false)}>Entendido</button>
        </div>
      </Modal>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
