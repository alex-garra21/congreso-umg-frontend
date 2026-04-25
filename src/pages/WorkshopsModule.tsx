import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';
import { getAgenda } from '../utils/agendaStore';
import type { AgendaItem } from '../data/agendaData';

export default function WorkshopsModule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isPaid = user?.pagoValidado;

  useEffect(() => {
    setAgenda(getAgenda());
    
    const handleAgendaUpdate = () => setAgenda(getAgenda());
    window.addEventListener('agendaUpdate', handleAgendaUpdate);
    return () => window.removeEventListener('agendaUpdate', handleAgendaUpdate);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const handleUpdate = () => {
      const updatedUser = getCurrentUser();
      if (updatedUser) setUser(updatedUser);
    };

    window.addEventListener('sessionUpdate', handleUpdate);

    return () => {
      window.removeEventListener('sessionUpdate', handleUpdate);
    };
  }, [navigate, user]);

  useEffect(() => {
    if (user?.correo) {
      const saved = localStorage.getItem(`workshops_${user.correo}`);
      const confirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`);
      if (saved) setEnrolledIds(JSON.parse(saved));
      if (confirmed === 'true') setIsConfirmed(true);
    }
  }, [user?.correo]);

  const ROOMS = ['SALA A', 'SALA B', 'SALA C', 'SALA D', 'SALA E'];
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours;
  };

  const getWorkshopStyles = (w: AgendaItem) => {
    const startRow = parseTime(w.time) - 7; 
    const endRow = parseTime(w.endTime) - 7;
    const colIndex = ROOMS.indexOf(w.room) + 2; 
    
    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: colIndex,
    };
  };

  const isTimeCollision = (workshop: AgendaItem) => {
    const start = parseTime(workshop.time);
    const end = parseTime(workshop.endTime);
    
    return enrolledIds.some(id => {
      const other = agenda.find(a => a.id === id);
      if (!other || other.id === workshop.id) return false;
      const oStart = parseTime(other.time);
      const oEnd = parseTime(other.endTime);
      
      return (start < oEnd) && (oStart < end);
    });
  };

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid || isConfirmed) return;
    setSaveStatus('idle');

    if (enrolledIds.includes(workshop.id)) {
      setEnrolledIds(prev => prev.filter(id => id !== workshop.id));
    } else {
      if (isTimeCollision(workshop)) {
        alert('Este taller tiene un traslape de horario con uno que ya seleccionaste.');
        return;
      }
      setEnrolledIds(prev => [...prev, workshop.id]);
    }
  };

  const handleConfirm = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      if (user) {
        updateUserData({ ...user, talleres: enrolledIds });
        localStorage.setItem(`workshops_${user.correo}`, JSON.stringify(enrolledIds));
        localStorage.setItem(`workshops_confirmed_${user.correo}`, 'true');
      }
      setIsConfirmed(true);
      setShowSuccessModal(true);
      setSaveStatus('saved');
      window.dispatchEvent(new Event('sessionUpdate'));
    }, 800);
  };

  const handleEdit = () => {
    setIsConfirmed(false);
    setSaveStatus('idle');
    if (user) {
      localStorage.setItem(`workshops_confirmed_${user.correo}`, 'false');
    }
    window.dispatchEvent(new Event('sessionUpdate'));
  };

  return (
    <div className="workshops-module">
      <ModuleTitle title="Inscripción de Talleres" />

      {!isPaid && (
        <div className="alert-banner warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-text">
            <strong>Pago pendiente</strong>. Valida tu pago para inscribirte. No puedes seleccionar talleres con traslape de horario.
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="alert-banner success">
          <div className="alert-icon">✅</div>
          <div className="alert-text">
            <strong>Talleres confirmados</strong>. Tu selección ha sido guardada.
          </div>
        </div>
      )}

      <div className={`calendar-container ${isConfirmed ? 'confirmed' : ''}`}>
        <div className="calendar-grid">
          <div className="grid-header time-label">HORA</div>
          {ROOMS.map(room => (
            <div key={room} className={`grid-header room-label ${room.replace(' ', '-').toLowerCase()}`}>
              {room}
            </div>
          ))}

          {HOURS.map(hour => (
            <div key={hour} className="hour-row-label" style={{ gridRow: hour - 7 }}>
              {hour > 12 ? `${hour - 12}:00` : `${hour}:00`}
            </div>
          ))}

          {HOURS.map(hour => (
            <div key={`line-${hour}`} className="hour-grid-line" style={{ gridRow: hour - 7 }}></div>
          ))}

          {agenda.filter(w => w.speaker).map(workshop => {
            const isSelected = enrolledIds.includes(workshop.id);
            const isBlocked = !isSelected && (isTimeCollision(workshop) || isConfirmed);
            
            return (
              <div 
                key={workshop.id} 
                className={`calendar-workshop ${isSelected ? 'selected' : ''} ${isBlocked ? 'blocked' : ''}`}
                style={getWorkshopStyles(workshop)}
                onClick={() => toggleEnroll(workshop)}
              >
                <div className="workshop-content">
                  <span className="w-title">{workshop.title}</span>
                  <span className="w-time">{workshop.time.replace(' AM', '').replace(' PM', '')} - {workshop.endTime.replace(' AM', '').replace(' PM', '')}</span>
                  <span className="w-speaker">{workshop.speaker?.name}</span>
                </div>
                {isSelected && <div className="selected-check">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        {ROOMS.map(room => (
          <div key={room} className="legend-item">
            <span className={`legend-dot ${room.replace(' ', '-').toLowerCase()}`}></span>
            {room}
          </div>
        ))}
      </div>

      {isPaid && (
        <div className="confirm-section-new">
          {isConfirmed ? (
            <button className="btn-edit" onClick={handleEdit}>Modificar selección</button>
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
      )}

      {showSuccessModal && (
        <div className="modal-bg open" onClick={() => setShowSuccessModal(false)}>
          <div className="modal success-modal" onClick={e => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h3>¡Inscripción Exitosa!</h3>
            <p>Tus talleres han sido registrados. Puedes ver tu horario en la sección de inicio.</p>
            <button className="btn-solid" onClick={() => setShowSuccessModal(false)}>Aceptar</button>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid var(--border-soft);
          overflow-x: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          margin-bottom: 2rem;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: 80px repeat(5, 1fr);
          grid-template-rows: 60px repeat(11, 80px);
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
        }

        .time-label { color: var(--text-secondary); }
        .room-label { padding: 10px; border-radius: 8px 8px 0 0; }
        
        .sala-a { background: rgba(33, 150, 243, 0.1); color: #1976d2; }
        .sala-b { background: rgba(76, 175, 80, 0.1); color: #388e3c; }
        .sala-c { background: rgba(156, 39, 176, 0.1); color: #7b1fa2; }
        .sala-d { background: rgba(255, 87, 34, 0.1); color: #e64a19; }
        .sala-e { background: rgba(255, 193, 7, 0.1); color: #ffa000; }

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
          border-top: 1px solid #f1f3f5;
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

        .grid-header.sala-a ~ .calendar-workshop[style*="grid-column: 2"] { background: rgba(33, 150, 243, 0.05); color: #1976d2; border-color: rgba(33, 150, 243, 0.1); }
        .grid-header.sala-b ~ .calendar-workshop[style*="grid-column: 3"] { background: rgba(76, 175, 80, 0.05); color: #388e3c; border-color: rgba(76, 175, 80, 0.1); }
        .grid-header.sala-c ~ .calendar-workshop[style*="grid-column: 4"] { background: rgba(156, 39, 176, 0.05); color: #7b1fa2; border-color: rgba(156, 39, 176, 0.1); }
        .grid-header.sala-d ~ .calendar-workshop[style*="grid-column: 5"] { background: rgba(255, 87, 34, 0.05); color: #e64a19; border-color: rgba(255, 87, 34, 0.1); }
        .grid-header.sala-e ~ .calendar-workshop[style*="grid-column: 6"] { background: rgba(255, 193, 7, 0.05); color: #ffa000; border-color: rgba(255, 193, 7, 0.1); }

        .calendar-workshop.selected {
          background: var(--blue) !important;
          color: white !important;
          border-color: var(--blue-dark);
          box-shadow: 0 10px 25px rgba(34, 139, 230, 0.3);
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
          color: var(--blue);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .legend-dot { width: 12px; height: 12px; border-radius: 3px; }

        .confirm-section-new { display: flex; justify-content: center; padding: 2rem 0; }
        .btn-confirm {
          background: var(--blue);
          color: white;
          border: none;
          padding: 1.25rem 3rem;
          border-radius: 100px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(34, 139, 230, 0.2);
        }
        .btn-confirm:hover:not(.disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(34, 139, 230, 0.3); }
        .btn-confirm.disabled { background: #adb5bd; cursor: not-allowed; box-shadow: none; }
        
        .btn-edit {
          background: transparent;
          color: var(--blue);
          border: 2px solid var(--blue);
          padding: 1rem 2.5rem;
          border-radius: 100px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-edit:hover { background: rgba(34, 139, 230, 0.05); }

        .alert-banner { display: flex; gap: 1rem; padding: 1.25rem; border-radius: 16px; margin-bottom: 2rem; align-items: center; }
        .alert-banner.warning { background: #fff9db; border: 1px solid #ffe066; color: #856404; }
        .alert-banner.success { background: #ebfbee; border: 1px solid #c3fae8; color: #087f5b; }

        @media (max-width: 768px) {
          .calendar-container { padding: 1rem; border-radius: 0; margin: 0 -1.5rem 2rem; }
        }
      `}</style>
    </div>
  );
}
