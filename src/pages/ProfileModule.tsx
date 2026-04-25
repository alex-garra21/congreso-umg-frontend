import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUserData, type UserData } from '../utils/auth';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ModuleTitle from '../components/ModuleTitle';

export default function ProfileModule() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    tipoParticipante: '' as 'alumno' | 'externo',
    carnet: '',
    ciclo: '',
    telefono: '',
    sexo: '',
  });

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        correo: user.correo || '',
        tipoParticipante: user.tipoParticipante || 'externo',
        carnet: user.carnet || '',
        ciclo: user.ciclo || '',
        telefono: user.telefono || '',
        sexo: user.sexo || '',
      });
    }
  }, [user]);

  // Auto-detección en tiempo real en el perfil
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: UserData = {
      ...user,
      ...formData,
      // Aseguramos que si no es alumno, no se guarden carnet/ciclo
      carnet: formData.tipoParticipante === 'alumno' ? formData.carnet : '',
      ciclo: formData.tipoParticipante === 'alumno' ? formData.ciclo : ''
    };

    const result = updateUserData(updatedUser);
    if (result.success) {
      setIsSuccessModalOpen(true);
      setUser(getCurrentUser());
    } else {
      alert(result.message);
    }
  };



  if (!user) return null;

  return (
    <div className="profile-module">
      <ModuleTitle title="Mi perfil" />
      <section className="dashboard-section profile-container">
        <div className="profile-header">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px' }}>Información personal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Estos datos se usarán para tu identificación en el evento y para la generación de tus diplomas.</p>
          <br />
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>PRIMER NOMBRE</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Nombres" readOnly style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>PRIMER APELLIDO</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" readOnly style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 3 }}>
              <label>CORREO ELECTRÓNICO AL QUE SE ENVIARÁN LOS DIPLOMAS</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@miumg.edu.gt" readOnly style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>SEXO</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} required>
                <option value="">Selecciona una opción</option>
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>TIPO DE PARTICIPANTE</label>
            <select name="tipoParticipante" value={formData.tipoParticipante} onChange={handleChange} required>
              <option value="externo">Participante externo</option>
              <option value="alumno">Alumno UMG</option>
            </select>
          </div>

          {formData.tipoParticipante === 'alumno' && (
            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 3 }}>
                <label>NÚMERO DE CARNET</label>
                <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} placeholder="20230001234" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>CICLO</label>
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
            <label>TELÉFONO (OPCIONAL)</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+(502) 0000-0000" />
          </div>



          <div className="profile-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="submit-btn"
              style={{
                width: 'auto',
                padding: '12px 24px',
              }}
            >
              Guardar cambios
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ width: 'auto', padding: '12px 24px', border: '1.5px solid #000', color: '#000' }}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Cambiar contraseña
            </button>
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
            <h3 style={{ fontSize: '24px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>¡Cambios Guardados!</h3>
            <p className="modal-sub" style={{ marginBottom: '1.5rem' }}>Tu información ha sido actualizada correctamente.</p>
            <button className="submit-btn" onClick={() => setIsSuccessModalOpen(false)}>Entendido</button>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
