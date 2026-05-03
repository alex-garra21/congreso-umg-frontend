import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { updateUserDataMutation } from '../../../api/supabase/users/userMutations';
import ModuleTitle from '../../../components/ModuleTitle';
import { useCharlas, useSalas } from '../../../api/hooks/useAgenda';
import { syncUserEnrollmentsMutation } from '../../../api/supabase/enrollment/enrollmentMutations';
import type { AgendaItem } from '../../../data/agendaData';
import { showAlert, showConfirm, showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';
import AdminButton from '../../../components/ui/AdminButton';

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
    if (user?.correo) {
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
        if (user.talleres) setEnrolledIds(user.talleres);
      } else {
        const saved = localStorage.getItem(`workshops_${user.correo}`);
        if (saved) setEnrolledIds(JSON.parse(saved));
        else if (user.talleres) setEnrolledIds(user.talleres);
      }
    }
  }, [user?.correo, user?.talleres, user?.pagoValidado]);

  useEffect(() => {
    if (user?.correo) localStorage.setItem(`workshops_${user.correo}`, JSON.stringify(enrolledIds));
  }, [enrolledIds, user?.correo]);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 8;
    const [time, modifier] = timeStr.trim().split(' ');
    let [h, m] = time.split(':').map(Number);
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return h + (m / 60);
  };

  let minHour = 8, maxHour = 18;
  if (agenda.length > 0) {
    minHour = Math.min(...agenda.map((w: AgendaItem) => Math.floor(parseTime(w.time))));
    maxHour = Math.max(...agenda.map((w: AgendaItem) => Math.ceil(parseTime(w.endTime))));
  }
  const HOURS = []; for (let i = minHour; i <= maxHour; i++) HOURS.push(i);

  const roomColors = [
    { bg: 'rgba(33, 150, 243, 0.03)', hoverBg: 'rgba(33, 150, 243, 0.05)', border: 'rgba(33, 150, 243, 0.1)', text: '#1976d2' },
    { bg: 'rgba(76, 175, 80, 0.03)', hoverBg: 'rgba(76, 175, 80, 0.05)', border: 'rgba(76, 175, 80, 0.1)', text: '#388e3c' },
    { bg: 'rgba(156, 39, 176, 0.03)', hoverBg: 'rgba(156, 39, 176, 0.05)', border: 'rgba(156, 39, 176, 0.1)', text: '#7b1fa2' },
    { bg: 'rgba(255, 87, 34, 0.03)', hoverBg: 'rgba(255, 87, 34, 0.05)', border: 'rgba(255, 87, 34, 0.1)', text: '#e64a19' },
    { bg: 'rgba(0, 188, 212, 0.03)', hoverBg: 'rgba(0, 188, 212, 0.05)', border: 'rgba(0, 188, 212, 0.1)', text: '#0097a6' },
    { bg: 'rgba(103, 58, 183, 0.03)', hoverBg: 'rgba(103, 58, 183, 0.05)', border: 'rgba(103, 58, 183, 0.1)', text: '#673ab7' }
  ];

  const getWorkshopStyles = (w: AgendaItem, isSelected: boolean) => {
    const startRow = Math.floor((parseTime(w.time) - minHour) * 2) + 2; 
    const endRow = Math.floor((parseTime(w.endTime) - minHour) * 2) + 2;
    const roomIndex = rooms.findIndex(r => r.id === w.locationId || r.name === w.room);
    const colIndex = roomIndex !== -1 ? roomIndex + 2 : 2; 
    const colorTheme = roomColors[(colIndex - 2) % roomColors.length];
    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: colIndex,
      ...(isSelected ? {} : { backgroundColor: colorTheme.hoverBg, color: colorTheme.text, borderColor: colorTheme.border })
    };
  };

  const isTimeCollision = (workshop: AgendaItem) => {
    if (workshop.room === 'GENERAL') return false;
    const start = parseTime(workshop.time), end = parseTime(workshop.endTime);
    return enrolledIds.some(id => {
      const other = agenda.find((a: AgendaItem) => a.id === id);
      if (!other || other.id === workshop.id || other.room === 'GENERAL') return false;
      const oStart = parseTime(other.time), oEnd = parseTime(other.endTime);
      return (start < oEnd) && (oStart < end);
    });
  };

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid || isConfirmed || workshop.room === 'GENERAL') return;
    if (enrolledIds.includes(workshop.id)) {
      setEnrolledIds(prev => prev.filter(id => id !== workshop.id));
    } else {
      if (isTimeCollision(workshop)) {
        showAlert('Traslape detectado', 'Este taller choca con tu selección actual.', 'warning');
        return;
      }
      setEnrolledIds(prev => [...prev, workshop.id]);
    }
  };

  const handleConfirm = async () => {
    setSaveStatus('saving');
    if (user?.id) {
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
        showAlert('Error', 'No se pudo guardar la selección.', 'error');
        setSaveStatus('idle');
      }
    }
  };

  const handleEdit = async () => {
    const count = parseInt(localStorage.getItem(`modifications_count_${user?.correo}`) || '0');
    if (count >= 1) { showToast('Ya no tienes más cambios disponibles.', 'error'); return; }
    const confirmed = await showConfirm('¿Modificar selección?', 'Atención: Solo tienes derecho a UN cambio. ¿Deseas proceder?', 'Sí, modificar', true);
    if (confirmed) {
      localStorage.setItem(`modifications_count_${user?.correo}`, '1');
      setIsConfirmed(false);
      setSaveStatus('idle');
      localStorage.setItem(`workshops_confirmed_${user?.correo}`, 'false');
      refetchProfile();
    }
  };

  return (
    <div className="workshops-module" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Inscripción de Talleres" />
      </div>

      <div style={{ padding: '0 2.5rem' }}>
        {!isPaid && <Alert variant="warning" style={{ marginBottom: '1.5rem' }}>Valida tu pago para inscribirte en los talleres.</Alert>}
        {isConfirmed && <Alert variant="success" style={{ marginBottom: '1.5rem' }}>Tu selección ha sido guardada exitosamente.</Alert>}

        <CalendarGrid
          rooms={rooms} HOURS={HOURS} minHour={minHour}
          roomColors={roomColors} agenda={agenda}
          enrolledIds={enrolledIds} isConfirmed={isConfirmed}
          isTimeCollision={isTimeCollision} toggleEnroll={toggleEnroll}
          getWorkshopStyles={getWorkshopStyles}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 0' }}>
          {isPaid && (() => {
            const modCount = parseInt(localStorage.getItem(`modifications_count_${user?.correo}`) || '0');
            if (isConfirmed) {
              return modCount >= 1 
                ? <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', background: 'var(--bg-app)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>✨ Selección Definitiva Guardada</div>
                : <AdminButton variant="outline" onClick={handleEdit} icon={<Icons.Edit size={18} />}>Modificar Selección (1 oportunidad)</AdminButton>;
            }
            return <AdminButton 
              size="lg" 
              onClick={handleConfirm} 
              disabled={enrolledIds.length === 0 || saveStatus === 'saving'}
              icon={saveStatus === 'saving' ? <Icons.Clock size={20} /> : <Icons.Check size={20} />}
              style={{ padding: '1.2rem 4rem' }}
            >
              {saveStatus === 'saving' ? 'Guardando...' : `Inscribir ${enrolledIds.length} Talleres`}
            </AdminButton>;
          })()}

          <AdminButton variant="secondary" onClick={() => navigate('/dashboard')} icon={<Icons.ArrowLeft size={18} />}>
            Regresar al Inicio
          </AdminButton>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="¡Inscripción Exitosa!" maxWidth="420px">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Icons.Check size={40} strokeWidth={3} />
          </div>
          <h3 style={{ fontFamily: 'Source Sans 3', fontWeight: 800, fontSize: '20px', marginBottom: '1rem' }}>¡Todo Listo!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tus talleres han sido registrados correctamente en el sistema. Puedes consultar tu horario detallado en el dashboard principal.</p>
          <AdminButton onClick={() => setShowSuccessModal(false)} style={{ width: '100%' }}>Excelente</AdminButton>
        </div>
      </Modal>

      <style>{`
        .calendar-container {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 2.5rem;
          border: 1px solid var(--border-soft);
          overflow-x: auto;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        .calendar-grid { display: grid; min-width: 1000px; position: relative; }
        .grid-header { font-family: 'Source Sans 3', sans-serif; font-weight: 800; font-size: 13px; border-bottom: 2px solid var(--border-soft); position: sticky; top: 0; z-index: 20; background: var(--bg-card); }
        .calendar-workshop { margin: 6px; padding: 14px; border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: space-between; border: 1px solid transparent; }
        .calendar-workshop:hover:not(.blocked) { transform: translateY(-4px) scale(1.01); box-shadow: 0 12px 25px rgba(0,0,0,0.08); z-index: 10; }
        .calendar-workshop.selected { background: var(--accent-primary) !important; color: white !important; border-color: var(--accent-dark); box-shadow: 0 15px 35px rgba(24, 95, 165, 0.25); z-index: 5; }
        .w-title { font-size: 13px; font-weight: 800; font-family: 'Source Sans 3', sans-serif; line-height: 1.25; margin-bottom: 4px; }
        .w-time { font-size: 11px; font-weight: 700; opacity: 0.9; }
        .w-speaker { font-size: 10px; font-weight: 600; opacity: 0.7; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
        .selected-check { position: absolute; top: 10px; right: 10px; background: white; color: var(--accent-primary); width: 22px; height: 22px; border-radius: 50%; display: flex; alignItems: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}

