import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { updateUserDataMutation } from '../../../api/supabase/users/userMutations';
import ModuleTitle from '../../../components/ModuleTitle';
import { useCharlas, useSalas } from '../../../api/hooks/useAgenda';
import { syncUserEnrollmentsMutation } from '../../../api/supabase/enrollment/enrollmentMutations';
import type { AgendaItem } from '../../../data/agendaData';
import { showAlert, showConfirm } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';

import { CalendarGrid } from './components/CalendarGrid';

export default function WorkshopsModule() {
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();
  const { data: charlas } = useCharlas();
  const { data: salas } = useSalas();
  
  const agenda = charlas || [];
  const rooms = salas || [];

  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isPaid = user?.pagoValidado;

  useEffect(() => {
    if (!user) {
      return;
    }
  }, [navigate, user]);

  useEffect(() => {
    if (user?.correo) {
      // Si el pago no está validado (por ejemplo, un admin lo anuló),
      // debemos limpiar toda la memoria local residual para que vuelva al estado de cuenta nueva.
      if (!user.pagoValidado) {
        localStorage.removeItem(`workshops_confirmed_${user.correo}`);
        localStorage.removeItem(`workshops_${user.correo}`);
        localStorage.removeItem(`modifications_count_${user.correo}`);
        setIsConfirmed(false);
        setEnrolledIds([]);
        return;
      }

      const confirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`);
      if (confirmed === 'true') {
        setIsConfirmed(true);
        if (user.talleres) {
          setEnrolledIds(user.talleres);
        }
      } else {
        const saved = localStorage.getItem(`workshops_${user.correo}`);
        if (saved) {
          setEnrolledIds(JSON.parse(saved));
        } else if (user.talleres) {
          setEnrolledIds(user.talleres);
        }
      }
    }
  }, [user?.correo, user?.talleres, user?.pagoValidado]);

  useEffect(() => {
    if (user?.correo) {
      localStorage.setItem(`workshops_${user.correo}`, JSON.stringify(enrolledIds));
    }
  }, [enrolledIds, user?.correo]);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 8; // fallback
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  let minHour = 8;
  let maxHour = 18;
  if (agenda.length > 0) {
    const startHours = agenda.map((w: AgendaItem) => Math.floor(parseTime(w.time)));
    const endHours = agenda.map((w: AgendaItem) => Math.ceil(parseTime(w.endTime)));
    minHour = Math.min(...startHours);
    maxHour = Math.max(...endHours);
  }
  
  const HOURS = [];
  for (let i = minHour; i <= maxHour; i++) HOURS.push(i);

  const roomColors = [
    { bg: 'rgba(33, 150, 243, 0.03)', hoverBg: 'rgba(33, 150, 243, 0.05)', border: 'rgba(33, 150, 243, 0.1)', text: '#1976d2' },
    { bg: 'rgba(76, 175, 80, 0.03)', hoverBg: 'rgba(76, 175, 80, 0.05)', border: 'rgba(76, 175, 80, 0.1)', text: '#388e3c' },
    { bg: 'rgba(156, 39, 176, 0.03)', hoverBg: 'rgba(156, 39, 176, 0.05)', border: 'rgba(156, 39, 176, 0.1)', text: '#7b1fa2' },
    { bg: 'rgba(255, 87, 34, 0.03)', hoverBg: 'rgba(255, 87, 34, 0.05)', border: 'rgba(255, 87, 34, 0.1)', text: '#e64a19' },
    { bg: 'rgba(255, 193, 7, 0.03)', hoverBg: 'rgba(255, 193, 7, 0.05)', border: 'rgba(255, 193, 7, 0.1)', text: '#ffa000' },
    { bg: 'rgba(0, 188, 212, 0.03)', hoverBg: 'rgba(0, 188, 212, 0.05)', border: 'rgba(0, 188, 212, 0.1)', text: '#0097a6' },
    { bg: 'rgba(233, 30, 99, 0.03)', hoverBg: 'rgba(233, 30, 99, 0.05)', border: 'rgba(233, 30, 99, 0.1)', text: '#c2185b' },
    { bg: 'rgba(103, 58, 183, 0.03)', hoverBg: 'rgba(103, 58, 183, 0.05)', border: 'rgba(103, 58, 183, 0.1)', text: '#673ab7' }, // Deep Purple
    { bg: 'rgba(0, 150, 136, 0.03)', hoverBg: 'rgba(0, 150, 136, 0.05)', border: 'rgba(0, 150, 136, 0.1)', text: '#009688' }   // Teal
  ];

  const getWorkshopStyles = (w: AgendaItem, isSelected: boolean) => {
    // Usamos precisión de 30 minutos (2 filas por hora)
    // Sumamos 2 porque la fila 1 es para los encabezados
    const startRow = Math.floor((parseTime(w.time) - minHour) * 2) + 2; 
    const endRow = Math.floor((parseTime(w.endTime) - minHour) * 2) + 2;
    const roomIndex = rooms.indexOf(w.room);
    const colIndex = roomIndex !== -1 ? roomIndex + 2 : 2; 
    
    const colorTheme = roomColors[colIndex - 2 % roomColors.length];
    if (!colorTheme) return {}; // fallback

    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: colIndex,
      ...(isSelected ? {} : {
        backgroundColor: colorTheme.hoverBg,
        color: colorTheme.text,
        borderColor: colorTheme.border
      })
    };
  };

  const isTimeCollision = (workshop: AgendaItem) => {
    if (workshop.room === 'GENERAL') return false; // GENERAL no choca
    const start = parseTime(workshop.time);
    const end = parseTime(workshop.endTime);
    
    return enrolledIds.some(id => {
      const other = agenda.find((a: AgendaItem) => a.id === id);
      if (!other || other.id === workshop.id || other.room === 'GENERAL') return false;
      const oStart = parseTime(other.time);
      const oEnd = parseTime(other.endTime);
      
      return (start < oEnd) && (oStart < end);
    });
  };

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid || isConfirmed || workshop.room === 'GENERAL') return;
    setSaveStatus('idle');

    if (enrolledIds.includes(workshop.id)) {
      setEnrolledIds(prev => prev.filter(id => id !== workshop.id));
    } else {
      if (isTimeCollision(workshop)) {
        showAlert('Traslape detectado', 'Este taller tiene un traslape de horario con uno que ya seleccionaste.', 'warning');
        return;
      }
      setEnrolledIds(prev => [...prev, workshop.id]);
    }
  };

  const handleConfirm = async () => {
    setSaveStatus('saving');
    
    if (user && user.id) {
      // Al guardar, incluimos los de GENERAL para que aparezcan en su agenda confirmada
      const generalIds = agenda.filter((a: AgendaItem) => a.room === 'GENERAL').map((a: AgendaItem) => a.id);
      const allToSave = Array.from(new Set([...enrolledIds, ...generalIds]));

      const { success } = await syncUserEnrollmentsMutation(user.id, allToSave);
      
      if (success) {
        await updateUserDataMutation({ ...user, talleres: allToSave });
        localStorage.setItem(`workshops_confirmed_${user.correo}`, 'true');
        
        setIsConfirmed(true);
        setShowSuccessModal(true);
        setSaveStatus('saved');
        refetchProfile();
      } else {
        showAlert('Error', 'Hubo un error al guardar tus inscripciones en la nube.', 'error');
        setSaveStatus('idle');
      }
    } else {
      setSaveStatus('idle');
    }
  };

  const handleEdit = async () => {
    if (!user) return;
    
    const count = parseInt(localStorage.getItem(`modifications_count_${user.correo}`) || '0');
    if (count >= 1) {
      showAlert('Límite alcanzado', 'Ya has utilizado tu única oportunidad para modificar talleres.', 'error');
      return;
    }

    const confirmed = await showConfirm(
      '¿Modificar selección?', 
      'Atención: Solo tienes derecho a UN cambio de talleres en caso de que te arrepientas de tu elección inicial. Si continúas, esta será tu ÚLTIMA oportunidad para modificar tu agenda. ¿Deseas proceder?', 
      'Sí, modificar', 
      true
    );

    if (confirmed) {
      localStorage.setItem(`modifications_count_${user.correo}`, '1');
      setIsConfirmed(false);
      setSaveStatus('idle');
      localStorage.setItem(`workshops_confirmed_${user.correo}`, 'false');
      refetchProfile();
    }
  };

  return (
    <div className="workshops-module">
      <ModuleTitle title="Inscripción de Talleres" />

      {!isPaid && (
        <Alert variant="warning" title="Pago pendiente">
          Valida tu pago para inscribirte. No puedes seleccionar talleres con traslape de horario.
        </Alert>
      )}

      {isConfirmed && (
        <Alert variant="success" title="Talleres confirmados">
          Tu selección ha sido guardada.
        </Alert>
      )}

      <CalendarGrid
        rooms={rooms}
        HOURS={HOURS}
        minHour={minHour}
        roomColors={roomColors}
        agenda={agenda}
        enrolledIds={enrolledIds}
        isConfirmed={isConfirmed}
        isTimeCollision={isTimeCollision}
        toggleEnroll={toggleEnroll}
        getWorkshopStyles={getWorkshopStyles}
      />

      {isPaid && (() => {
        const modificationsCount = user ? parseInt(localStorage.getItem(`modifications_count_${user.correo}`) || '0') : 0;
        return (
          <div className="confirm-section-new">
            {isConfirmed ? (
              modificationsCount >= 1 ? (
                <div style={{ textAlign: 'center', margin: '2rem auto', padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-soft)', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>✔️ Ya has utilizado tu única oportunidad para modificar talleres. Tu selección es definitiva.</p>
                </div>
              ) : (
                <button className="btn-edit" onClick={handleEdit}>Modificar selección (1 cambio disponible)</button>
              )
            ) : (
              <button 
                className={`btn-confirm ${enrolledIds.length === 0 ? 'disabled' : ''} ${saveStatus === 'saving' ? 'loading' : ''}`}
                onClick={handleConfirm}
                disabled={enrolledIds.length === 0 || saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Guardando...' : `Confirmar ${enrolledIds.length} talleres`}
              </button>
            )}
          </div>
        );
      })()}

      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="¡Inscripción Exitosa!"
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center' }}>
          <div className="success-icon" style={{ 
            width: '64px', 
            height: '64px', 
            background: '#22c55e', 
            color: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}>
            <Icons.Check size={32} strokeWidth={3} />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Tus talleres han sido registrados. Puedes ver tu horario en la sección de inicio.
          </p>
          <button className="btn-solid" onClick={() => setShowSuccessModal(false)}>Aceptar</button>
        </div>
      </Modal>

      {/* Botón regresar al inicio */}
      <div style={{ display: 'flex', justifySelf: 'center', marginTop: '2rem', marginBottom: '1rem', width: '100%', justifyContent: 'center' }}>
        <button className="btn-lg btn-lg-primary" style={{ background: 'var(--accent-primary)', border: 'none', padding: '1rem 3rem', borderRadius: '100px', fontSize: '16px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Ir al Inicio
        </button>
      </div>

      <style>{`
        .calendar-container {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid var(--border-soft);
          overflow-x: auto;
          box-shadow: var(--shadow-md);
          margin-bottom: 2rem;
        }

        .calendar-grid {
          display: grid;
          min-width: 1000px;
          position: relative;
        }

        .grid-header {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          border-bottom: 2px solid var(--border-soft);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .column-grid-bg {
          border-left: 1px solid var(--border-soft);
          grid-row: 2 / -1;
          pointer-events: none;
        }

        .time-label { color: var(--text-secondary); }
        .room-label { padding: 10px; border-radius: 8px 8px 0 0; }

        .hour-row-label {
          grid-column: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .hour-grid-line {
          grid-column: 2 / -1;
          border-top: 1px solid var(--border-soft);
          pointer-events: none;
        }

        .calendar-workshop {
          margin: 4px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          border: 1px solid transparent;
        }

        .calendar-workshop:hover:not(.blocked) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .calendar-workshop.selected {
          background: var(--accent-primary) !important;
          color: white !important;
          border-color: var(--accent-dark);
          box-shadow: 0 10px 25px rgba(24, 95, 165, 0.3);
          z-index: 5;
        }

        .calendar-workshop.blocked {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .workshop-content { display: flex; flex-direction: column; gap: 4px; }
        .w-title { font-size: 13px; font-weight: 800; font-family: 'Syne', sans-serif; line-height: 1.2; }
        .w-time { font-size: 11px; font-weight: 600; opacity: 0.8; }
        .w-speaker { font-size: 10px; font-weight: 500; opacity: 0.7; margin-top: 4px; }

        .selected-check {
          position: absolute;
          top: 8px;
          right: 8px;
          background: white;
          color: var(--accent-primary);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-workshop.mandatory {
          background: var(--accent-light) !important;
          color: var(--accent-dark) !important;
          border: 2px dashed var(--accent-primary);
          cursor: default;
          box-shadow: none;
        }

        .calendar-workshop.mandatory .selected-check {
          background: #2196f3;
          color: white;
        }

        .column-grid-line {
          display: none; /* Reemplazado por column-grid-bg */
        }

        .confirm-section-new { display: flex; justify-content: center; padding: 2rem 0; }
        .btn-confirm {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 1.25rem 3rem;
          border-radius: 100px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(24, 95, 165, 0.2);
        }
        .btn-confirm:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(24, 95, 165, 0.3); }
        .btn-confirm.disabled { background: var(--border-med); cursor: not-allowed; box-shadow: none; }
        
        .btn-edit {
          background: transparent;
          color: var(--accent-primary);
          border: 2px solid var(--accent-primary);
          padding: 1rem 2.5rem;
          border-radius: 100px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-edit:hover { background: rgba(34, 139, 230, 0.05); }

        @media (max-width: 768px) {
          .calendar-container { padding: 1rem; border-radius: 0; margin: 0 -1.5rem 2rem; }
        }
      `}</style>
    </div>
  );
}
