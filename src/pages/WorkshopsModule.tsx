import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';
import { agendaCompleta, type AgendaItem } from '../data/agendaData';
import WorkshopCard from '../components/workshops/WorkshopCard';

export default function WorkshopsModule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isPaid = user?.pagoValidado;

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

  const allWorkshops = agendaCompleta.filter(item => item.speaker);
  const timeSlots = Array.from(new Set(allWorkshops.map(w => w.time)));

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid || isConfirmed) return;
    setSaveStatus('idle');

    let newEnrolled;
    if (enrolledIds.includes(workshop.id)) {
      newEnrolled = enrolledIds.filter(id => id !== workshop.id);
    } else {
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
    const newEnrolledIds = newEnrolled;
    setEnrolledIds(newEnrolledIds);

    // Guardar estado actual (aunque no esté confirmado) para que el Dashboard lo vea
    if (user?.correo) {
      localStorage.setItem(`workshops_${user.correo}`, JSON.stringify(newEnrolledIds));
      window.dispatchEvent(new Event('sessionUpdate'));
    }
  };

  const handleConfirm = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      localStorage.setItem(`workshops_${user?.correo}`, JSON.stringify(enrolledIds));
      localStorage.setItem(`workshops_confirmed_${user?.correo}`, 'true');
      setSaveStatus('saved');
      setIsConfirmed(true);
      setShowSuccessModal(true);
      window.dispatchEvent(new Event('sessionUpdate'));
    }, 800);
  };

  const handleEdit = () => {
    setIsConfirmed(false);
    localStorage.setItem(`workshops_confirmed_${user?.correo}`, 'false');
    setSaveStatus('idle');
    window.dispatchEvent(new Event('sessionUpdate'));
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

      {isConfirmed && isPaid && (
        <div className="alert-banner success">
          <div className="alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="alert-text">
            <strong>Talleres confirmados ✅</strong>. Tu selección está guardada. Si deseas realizar cambios, usa el botón al final de la página.
          </div>
        </div>
      )}

      <div className={`slots-container ${isConfirmed ? 'confirmed-view' : ''}`}>
        {timeSlots.map(time => (
          <div key={time} className="slot-section">
            <div className="slot-header">
              <span className="slot-time-badge">{time}</span>
              <div className="slot-line"></div>
            </div>

            <div className="workshops-grid-compact">
              {allWorkshops.filter(w => w.time === time).map(workshop => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  isSelected={enrolledIds.includes(workshop.id)}
                  isConfirmed={isConfirmed}
                  isPaid={isPaid === true}
                  showOccupied={!enrolledIds.includes(workshop.id) && isTimeOccupied(time)}
                  onToggle={toggleEnroll}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isPaid && (
        <div className="confirm-section">
          {isConfirmed ? (
            <div className="confirmed-summary-box">
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--blue)' }}>Tu agenda está lista</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Has seleccionado {enrolledIds.length} talleres para el congreso.</p>
              <button className="btn-lg btn-lg-outline" onClick={handleEdit} style={{ minWidth: '220px' }}>
                Volver a elegir talleres
              </button>
            </div>
          ) : (
            <>
              <div className="confirm-summary">
                <span>Talleres seleccionados: <strong>{enrolledIds.length}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className={`btn-lg btn-lg-primary confirm-main-btn ${saveStatus === 'saving' ? 'loading' : ''}`}
                  onClick={handleConfirm}
                  disabled={enrolledIds.length === 0 || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Guardando...' : 'Confirmar talleres'}
                </button>
                <button
                  className="btn-lg btn-lg-outline confirm-secondary-btn"
                  onClick={() => {
                    setEnrolledIds([]);
                    setSaveStatus('idle');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ minWidth: '280px', height: '60px' }}
                >
                  Volver a elegir talleres
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-bg open" onClick={() => setShowSuccessModal(false)}>
          <div className="modal success-modal" onClick={e => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800 }}>¡Talleres confirmados!</h2>
            <p>Tu inscripción a los talleres ha sido guardada exitosamente. Podrás ver tu horario completo en el inicio.</p>
            <button className="btn-solid" onClick={() => setShowSuccessModal(false)}>Listo</button>
          </div>
        </div>
      )}

      <style>{`
        .workshops-module { padding-bottom: 8rem; position: relative; }
        .confirmed-view .workshop-card-compact:not(.enrolled) { display: none; }
        .confirmed-view .slot-section:not(:has(.enrolled)) { display: none; }

        .alert-banner.success {
          background: #e6fffa;
          border-color: #38b2ac;
          color: #234e52;
          margin-bottom: 2rem;
        }

        .confirm-section {
          margin-top: 5rem;
          padding: 3rem;
          background: #fff;
          border-radius: 20px;
          border: 1px solid var(--border-soft);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .confirm-summary { font-size: 16px; color: var(--text-secondary); }
        .confirm-summary strong { color: var(--blue); font-size: 20px; margin-left: 5px; }
        .confirm-main-btn { min-width: 280px; height: 60px; font-size: 18px; letter-spacing: 0.5px; }

        .success-modal { max-width: 400px; text-align: center; padding: 3rem 2rem; }
        .success-icon {
          width: 60px; height: 60px; background: #40c057; color: #fff;
          border-radius: 50%; display: flex; align-items: center; justifyContent: center;
          font-size: 30px; margin: 0 auto 1.5rem;
        }

        .slots-container { display: flex; flex-direction: column; gap: 2.5rem; margin-top: 1rem; }
        .slot-header { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.5rem; }
        .slot-time-badge {
          background: var(--blue-dark); color: #fff; padding: 5px 14px;
          border-radius: 6px; font-size: 12px; font-weight: 700; font-family: 'Syne', sans-serif;
        }
        .slot-line { height: 1px; flex: 1; background: var(--border-soft); }

        .workshops-grid-compact {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .workshop-card-compact {
          background: #fff;
          border-radius: 20px;
          border: 1px solid var(--border-soft);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }

        .card-body-compact {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .card-header-compact {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          margin-bottom: 12px;
        }

        .enrolled-status { 
          font-size: 10px; 
          font-weight: 500; 
          color: #40c057; 
          white-space: nowrap;
        }

        .workshop-title-small {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          line-height: 1.3;
          margin: 0;
          color: var(--text-primary);
        }

        .card-info-compact { display: flex; flex-direction: column; gap: 4px; }
        .workshop-speaker-small { font-size: 14px; font-weight: 600; color: var(--blue); margin: 0; }
        .location-small {
          font-size: 13px; color: var(--text-secondary); margin: 0;
          display: flex; align-items: center; gap: 4px;
        }


        .enrolled-status { font-size: 10px; font-weight: 700; color: #40c057; }

        .enroll-btn-small {
          margin-top: auto; width: 100%; padding: 12px; border-radius: 10px;
          border: 1.5px solid var(--blue); background: transparent; color: var(--blue);
          font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s;
        }

        .enroll-btn-small.active { background: #40c057; border-color: #40c057; color: #fff; }
        .enroll-btn-small.collision { opacity: 0.5; cursor: not-allowed; border-color: var(--border-soft); color: var(--text-secondary); }

        .workshop-card-compact.enrolled {
          border-color: #40c057; background: #f8fff9;
          box-shadow: 0 15px 35px rgba(64, 192, 87, 0.1);
        }

        .workshop-card-compact.blocked { opacity: 0.5; filter: grayscale(0.2); }

        .alert-banner {
          display: flex; gap: 1rem; padding: 1rem 1.5rem; border-radius: 12px;
          margin-bottom: 2rem; background: #fff9db; border: 1px solid #ffe066;
          color: #856404; font-size: 13px;
        }
      `}</style>
    </div>
  );
}
