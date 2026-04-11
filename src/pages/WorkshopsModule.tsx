import { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';
import { agendaCompleta, type AgendaItem } from '../data/agendaData';

export default function WorkshopsModule() {
  const user = getCurrentUser();
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const isPaid = user?.pagoValidado;

  useEffect(() => {
    const saved = localStorage.getItem(`workshops_${user?.correo}`);
    if (saved) setEnrolledIds(JSON.parse(saved));
  }, [user]);

  // Filtramos la agenda para obtener solo los items de talleres (los que tienen speaker)
  const allWorkshops = agendaCompleta.filter(item => item.speaker);
  
  // Agrupamos por horario para la lógica de colisiones y visualización
  const timeSlots = Array.from(new Set(allWorkshops.map(w => w.time)));

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid) return;
    
    let newEnrolled;
    if (enrolledIds.includes(workshop.id)) {
      newEnrolled = enrolledIds.filter(id => id !== workshop.id);
    } else {
      // Bloqueo de colisiones: quitar cualquier otro taller en el mismo horario
      const sameTimeId = enrolledIds.find(id => {
        const item = allWorkshops.find(w => w.id === id);
        return item?.time === workshop.time;
      });
      
      if (sameTimeId) {
        newEnrolled = enrolledIds.filter(id => id !== sameTimeId);
        newEnrolled.push(workshop.id);
      } else {
        newEnrolled = [...enrolledIds, workshop.id];
      }
    }
    setEnrolledIds(newEnrolled);
    localStorage.setItem(`workshops_${user?.correo}`, JSON.stringify(newEnrolled));
  };

  const isTimeOccupied = (time: string) => enrolledIds.some(id => {
    const item = allWorkshops.find(w => w.id === id);
    return item?.time === time;
  });

  return (
    <div className="workshops-module">
      <ModuleTitle title="Mis talleres" />
      
      {!isPaid && (
        <div className="alert-banner warning">
          <div className="alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <div className="alert-text">
            <strong>Pago pendiente</strong>. Valida tu pago para inscribirte. Solo puedes elegir un taller por horario.
          </div>
        </div>
      )}

      <div className="slots-container">
        {timeSlots.map(time => (
          <div key={time} className="slot-section">
            <div className="slot-header">
              <span className="slot-time-badge">{time}</span>
              <div className="slot-line"></div>
            </div>

            <div className="workshops-grid-compact">
              {allWorkshops.filter(w => w.time === time).map(workshop => {
                const isSelected = enrolledIds.includes(workshop.id);
                const showOccupied = !isSelected && isTimeOccupied(time);
                
                return (
                  <div 
                    key={workshop.id} 
                    className={`workshop-card-compact ${isSelected ? 'enrolled' : ''} ${showOccupied ? 'blocked' : ''}`}
                  >
                    <div className="card-header-compact">
                      <span className="tag-badge-small" style={{ background: workshop.speaker?.tagBgColor, color: workshop.speaker?.tagTextColor }}>
                        {workshop.tag}
                      </span>
                      {isSelected && <span className="enrolled-status">✓ INSCRITO</span>}
                    </div>
                    
                    <div className="card-body-compact">
                      <h3 className="workshop-title-small">{workshop.title}</h3>
                      <p className="workshop-speaker-small">Con {workshop.speaker?.name}</p>
                      <p className="location-small">📍 {workshop.location}</p>
                      
                      <button 
                        className={`enroll-btn-small ${isSelected ? 'active' : ''} ${!isPaid ? 'disabled' : ''} ${showOccupied ? 'collision' : ''}`}
                        onClick={() => toggleEnroll(workshop)}
                        disabled={!isPaid}
                      >
                        {isSelected ? 'Quitar' : (showOccupied ? 'Ocupado' : 'Inscribirse')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .workshops-module {
          padding-bottom: 4rem;
        }

        .slots-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          margin-top: 1rem;
        }

        .slot-header {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .slot-time-badge {
          background: var(--blue-dark);
          color: #fff;
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
        }

        .slot-line {
          height: 1px;
          flex: 1;
          background: var(--border-soft);
        }

        .workshops-grid-compact {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .workshop-card-compact {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--border-soft);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          position: relative;
        }

        .workshop-card-compact.enrolled {
          border-color: #40c057;
          background: #f8fff9;
          box-shadow: 0 4px 12px rgba(64, 192, 87, 0.1);
        }

        .workshop-card-compact.blocked {
          opacity: 0.5;
          filter: grayscale(0.2);
        }

        .card-header-compact {
          padding: 12px 14px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tag-badge-small {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .enrolled-status {
          font-size: 10px;
          font-weight: 800;
          color: #2e7d32;
        }

        .card-body-compact {
          padding: 0 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .workshop-title-small {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 6px;
          line-height: 1.3;
          color: var(--text-primary);
        }

        .workshop-speaker-small {
          font-size: 12px;
          color: var(--blue);
          margin-bottom: 4px;
          font-weight: 600;
        }

        .location-small {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .enroll-btn-small {
          margin-top: auto;
          width: 100%;
          padding: 8px;
          border-radius: 7px;
          border: 1.5px solid var(--blue);
          background: transparent;
          color: var(--blue);
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .enroll-btn-small:hover:not(.disabled):not(.collision) {
          background: var(--blue);
          color: #fff;
        }

        .enroll-btn-small.active {
          background: #40c057;
          border-color: #40c057;
          color: #fff;
        }

        .enroll-btn-small.collision {
          border-color: #ced4da;
          color: #adb5bd;
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .enroll-btn-small.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .alert-banner {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          background: #fff9db;
          border: 1px solid #ffe066;
          color: #856404;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
