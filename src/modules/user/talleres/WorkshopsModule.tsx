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
import BackButton from '../../../components/ui/BackButton';
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
  const [selectedWorkshop, setSelectedWorkshop] = useState<AgendaItem | null>(null);
  const isPaid = user?.pagoValidado;

  useEffect(() => {
    if (user?.correo) {
      const confirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`);
      
      if (!user.pagoValidado) {
        // Modo Preview: No puede elegir, pero debe ver lo que ya tiene asignado (GENERAL)
        setIsConfirmed(false);
        if (user.talleres) {
          const generalOnly = user.talleres.filter(t => t.category === 'GENERAL').map(t => t.id);
          setEnrolledIds(generalOnly);
        } else {
          setEnrolledIds([]);
        }
        return;
      }
      
      if (confirmed === 'true') {
        setIsConfirmed(true);
        if (user.talleres) {
          const onlyWorkshops = user.talleres.filter(t => t.category !== 'GENERAL').map(t => t.id);
          setEnrolledIds(onlyWorkshops);
        }
      } else {
        const saved = localStorage.getItem(`workshops_${user.correo}`);
        if (saved) {
          setEnrolledIds(JSON.parse(saved));
        } else if (user.talleres) {
          const onlyWorkshops = user.talleres.filter(t => t.category !== 'GENERAL').map(t => t.id);
          setEnrolledIds(onlyWorkshops);
        }
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

  let minHour = 8, maxHour = 17; 
  if (agenda.length > 0) {
    minHour = Math.min(...agenda.map((w: AgendaItem) => Math.floor(parseTime(w.time))));
    maxHour = Math.max(...agenda.map((w: AgendaItem) => Math.ceil(parseTime(w.endTime))));
  }
  const HOURS = []; for (let i = minHour; i <= maxHour; i++) HOURS.push(i);


  const roomColors = [
    { main: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)', card: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.2)' }, // Indigo
    { main: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.05)', card: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)' }, // Sky
    { main: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', card: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' }, // Emerald
    { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', card: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' }, // Amber
    { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)', card: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)' }, // Pink
    { main: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)', card: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' }, // Violet
    { main: '#f43f5e', bg: 'rgba(244, 63, 94, 0.05)', card: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.2)' },  // Rose
    { main: '#06b6d4', bg: 'rgba(6, 182, 212, 0.05)', card: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.2)' }   // Cyan
  ];

  const getWorkshopStyles = (w: AgendaItem, isSelected: boolean) => {
    const rowsPerHour = 12; // Cada fila son 5 minutos
    const startRow = Math.round((parseTime(w.time) - minHour) * rowsPerHour) + 2; 
    const endRow = Math.round((parseTime(w.endTime) - minHour) * rowsPerHour) + 2;
    const roomIndex = rooms.findIndex(r => r.id === w.locationId || r.name === w.room);
    const colIndex = roomIndex !== -1 ? roomIndex + 2 : 2; 
    const colorTheme = roomColors[(colIndex - 2) % roomColors.length];
    
    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: colIndex,
      backgroundColor: isSelected ? undefined : colorTheme.card,
      borderColor: isSelected ? undefined : colorTheme.border,
      color: isSelected ? undefined : colorTheme.main
    };
  };

  const isTimeCollision = (workshop: AgendaItem) => {
    if (workshop.tag === 'GENERAL') return false;
    const start = parseTime(workshop.time), end = parseTime(workshop.endTime);
    return enrolledIds.some(id => {
      const other = agenda.find((a: AgendaItem) => a.id === id);
      if (!other || other.id === workshop.id || other.tag === 'GENERAL') return false;
      const oStart = parseTime(other.time), oEnd = parseTime(other.endTime);
      return (start < oEnd) && (oStart < end);
    });
  };

  const toggleEnroll = (workshop: AgendaItem) => {
    if (!isPaid || isConfirmed || workshop.tag === 'GENERAL') return;
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

  const handleCardClick = (workshop: AgendaItem) => {
    setSelectedWorkshop(workshop);
  };

  const handleConfirm = async () => {
    setSaveStatus('saving');
    if (user?.id) {
      // Importante: No borrar las actividades GENERALES que ya tiene el usuario.
      const generalActivities = (user.talleres || []).filter(t => t.category === 'GENERAL');
      const generalIds = generalActivities.map(t => t.id);
      
      const allToSave = Array.from(new Set([...enrolledIds, ...generalIds]));
      const { success } = await syncUserEnrollmentsMutation(user.id, allToSave);
      
      if (success) {
        // Detectamos si esto fue una modificación (si ya estaba confirmado antes de esta sesión de edición)
        const wasAlreadyConfirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`) === 'true';
        if (wasAlreadyConfirmed) {
          localStorage.setItem(`modifications_count_${user.correo}`, '1');
        }

        // Obtenemos los objetos completos para actualizar el estado local de user
        const newTalleresObjects = [
          ...enrolledIds.map(id => ({ id, category: agenda.find(a => a.id === id)?.tag || '' })),
          ...generalActivities
        ];

        await updateUserDataMutation({ ...user, talleres: newTalleresObjects });
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
    
    const confirmed = await showConfirm(
      '¿Modificar selección?', 
      'Atención: Solo tienes derecho a UN cambio una vez guardes. ¿Deseas proceder?', 
      'Sí, modificar', 
      true
    );
    
    if (confirmed) {
      setIsConfirmed(false);
      setSaveStatus('idle');
    }
  };

  const handleCancelEdit = () => {
    // Restaurar los IDs desde el perfil del usuario
    if (user?.talleres) {
      const onlyWorkshops = user.talleres.filter(t => t.category !== 'GENERAL').map(t => t.id);
      setEnrolledIds(onlyWorkshops);
    } else {
      setEnrolledIds([]);
    }
    setIsConfirmed(true);
    setSaveStatus('idle');
  };


  return (
    <div className="workshops-module" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Inscripción de Talleres" />
      </div>

      <div style={{ padding: '0 2.5rem' }}>
        {!isPaid && (
          <div style={{ 
            marginBottom: '2rem', 
            borderRadius: '20px', 
            padding: '1.5rem 2rem', 
            background: 'linear-gradient(135deg, #fff9db 0%, #fff3bf 100%)',
            border: '1px solid #fab005',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ color: '#f08c00', display: 'flex' }}><Icons.AlertTriangle size={28} /></div>
            <div style={{ color: '#862e00', fontSize: '15px', lineHeight: '1.5' }}>
              <strong style={{ display: 'block', fontSize: '16px', marginBottom: '2px' }}>Modo Vista Previa</strong>
              Explora la agenda completa. Valida tu pago en el módulo de <span style={{ textDecoration: 'underline', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/dashboard/pago')}>Pagos</span> para habilitar tu inscripción.
            </div>
          </div>
        )}
        {isConfirmed && <Alert variant="success" style={{ marginBottom: '1.5rem' }}>Tu selección ha sido guardada exitosamente.</Alert>}

        <CalendarGrid
          rooms={rooms} HOURS={HOURS} minHour={minHour}
          roomColors={roomColors} agenda={agenda}
          enrolledIds={enrolledIds} isConfirmed={isConfirmed}
          isTimeCollision={isTimeCollision} toggleEnroll={handleCardClick}
          getWorkshopStyles={getWorkshopStyles}
        />

        {/* Listado de Talleres Seleccionados */}
        <div className="selection-summary-container" style={{ marginTop: '3rem' }}>
          <h3 style={{ 
            fontFamily: 'Source Sans 3', 
            fontWeight: 800, 
            fontSize: '18px', 
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Icons.ClipboardList size={22} color="var(--accent-primary)" />
            Talleres Seleccionados
          </h3>
          
          <div className="selection-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Actividades Generales (Obligatorias) */}
            {agenda.filter(a => a.tag === 'GENERAL').map(workshop => (
              <div key={`summary-${workshop.id}`} className="selection-item mandatory">
                <div className="selection-item-info">
                  <span className="selection-item-room">{workshop.room}</span>
                  <span className="selection-item-title">{workshop.title}</span>
                  <span className="selection-item-time">{workshop.time} - {workshop.endTime}</span>
                </div>
                <div className="selection-item-badge">Obligatorio</div>
              </div>
            ))}

            {/* Talleres Elegidos */}
            {enrolledIds.map(id => {
              const workshop = agenda.find(a => a.id === id);
              if (!workshop || workshop.tag === 'GENERAL') return null;
              return (
                <div key={`summary-${id}`} className="selection-item">
                  <div className="selection-item-info">
                    <span className="selection-item-room">{workshop.room}</span>
                    <span className="selection-item-title">{workshop.title}</span>
                    <span className="selection-item-time">{workshop.time} - {workshop.endTime}</span>
                  </div>
                  {!isConfirmed && (
                    <button 
                      className="selection-item-remove" 
                      onClick={() => toggleEnroll(workshop)}
                      title="Quitar selección"
                    >
                      <Icons.X size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {enrolledIds.length === 0 && (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: 'var(--bg-app)', 
                borderRadius: '16px',
                border: '1px dashed var(--border-soft)',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                Aún no has seleccionado ningún taller. Haz clic en las tarjetas del calendario para agregarlos.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '3rem 0' }}>
          {isPaid && (() => {
            const modCount = parseInt(localStorage.getItem(`modifications_count_${user?.correo}`) || '0');
            const wasAlreadyConfirmed = localStorage.getItem(`workshops_confirmed_${user.correo}`) === 'true';

            if (isConfirmed) {
              return modCount >= 1 
                ? <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', background: 'var(--bg-app)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.Shield size={16} color="var(--text-secondary)" /> Selección Definitiva Guardada
                  </div>
                : <AdminButton 
                    onClick={handleEdit} 
                    icon={<Icons.Edit size={18} />}
                    className="admin-btn-hover"
                    style={{ 
                      background: '#10b981', 
                      color: '#ffffff', 
                      border: 'none', 
                      padding: '0.8rem 2rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    Modificar Selección (1 oportunidad)
                  </AdminButton>;
            }
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
                <AdminButton 
                  size="lg" 
                  onClick={handleConfirm} 
                  disabled={enrolledIds.length === 0 || saveStatus === 'saving'}
                  icon={saveStatus === 'saving' ? <Icons.Clock size={20} /> : <Icons.Check size={20} />}
                  className="admin-btn-hover"
                  style={{ 
                    padding: '1.2rem 4.5rem', 
                    borderRadius: '100px', 
                    background: enrolledIds.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderColor: 'transparent',
                    boxShadow: enrolledIds.length === 0 ? 'none' : '0 15px 30px -10px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saveStatus === 'saving' ? 'Guardando...' : wasAlreadyConfirmed ? 'Confirmar Cambio' : `Inscribir ${enrolledIds.length} Talleres`}
                </AdminButton>

                {wasAlreadyConfirmed && (
                  <button 
                    onClick={handleCancelEdit}
                    className="btn-ghost"
                    style={{
                      padding: '1.2rem 3rem',
                      borderRadius: '100px',
                      border: '2px solid #cbd5e1',
                      background: 'transparent',
                      color: '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            );
          })()}

          <BackButton />
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="¡Inscripción Exitosa!" maxWidth="420px">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Icons.Check size={40} strokeWidth={3} />
          </div>
          <h3 style={{ fontFamily: 'Source Sans 3', fontWeight: 800, fontSize: '20px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Icons.Star size={24} color="#fab005" /> ¡Todo Listo!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>Tus talleres han sido registrados correctamente en el sistema. Puedes consultar tu horario detallado en el dashboard principal.</p>
          <AdminButton onClick={() => setShowSuccessModal(false)} style={{ width: '100%' }}>Excelente</AdminButton>
        </div>
      </Modal>

      {/* Modal de Detalle de Taller */}
      <Modal 
        isOpen={!!selectedWorkshop} 
        onClose={() => setSelectedWorkshop(null)} 
        title={selectedWorkshop?.title}
        maxWidth="550px"
      >
        {selectedWorkshop && (() => {
          const isSelected = enrolledIds.includes(selectedWorkshop.id) || selectedWorkshop.tag === 'GENERAL';
          const isCollision = !isSelected && isTimeCollision(selectedWorkshop);
          const isMandatory = selectedWorkshop.tag === 'GENERAL';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: 'rgba(24, 95, 165, 0.1)', 
                  color: 'var(--accent-primary)', 
                  padding: '6px 14px', 
                  borderRadius: '100px', 
                  fontSize: '13px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Icons.MapPin size={14} color="var(--accent-primary)" /> {selectedWorkshop.room}
                </span>
                <span style={{ 
                  background: 'rgba(0, 0, 0, 0.05)', 
                  padding: '6px 14px', 
                  borderRadius: '100px', 
                  fontSize: '13px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Icons.Clock size={14} /> {selectedWorkshop.time} - {selectedWorkshop.endTime}
                </span>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción</h4>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {selectedWorkshop.description || 'Sin descripción disponible para esta actividad.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.User size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ponente</h4>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedWorkshop.speaker?.name || 'Por definir'}</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Información de traslape sobre los botones */}
                {isCollision && !isSelected && (
                  <div style={{ 
                    color: '#862e00', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    background: '#fff3bf', 
                    padding: '10px', 
                    borderRadius: '10px',
                    border: '1px solid #fab005',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <Icons.AlertTriangle size={16} />
                    Conflicto de horario detectado
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <div style={{ flex: 1.5 }}>
                    {isPaid && !isConfirmed && !isMandatory ? (
                      <AdminButton 
                        fullWidth 
                        variant={isSelected ? 'outline' : 'primary'}
                        onClick={() => {
                          toggleEnroll(selectedWorkshop);
                          setSelectedWorkshop(null);
                        }}
                        disabled={isCollision}
                        icon={isSelected ? <Icons.Trash size={18} /> : <Icons.Check size={18} />}
                        style={isSelected ? { borderColor: '#e03131', color: '#e03131' } : {}}
                      >
                        {isSelected ? 'Quitar' : 'Inscribirme'}
                      </AdminButton>
                    ) : isMandatory ? (
                      <div style={{ height: '100%', padding: '0 1rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0f172a', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', textTransform: 'uppercase' }}>
                        Obligatorio
                      </div>
                    ) : !isPaid ? (
                      <AdminButton fullWidth disabled icon={<Icons.AlertTriangle size={16} />} style={{ fontSize: '13px' }}>
                        Bloqueado
                      </AdminButton>
                    ) : isConfirmed ? (
                      <div style={{ height: '100%', padding: '0 1rem', borderRadius: '12px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', textAlign: 'center', textTransform: 'uppercase' }}>
                        Finalizado
                      </div>
                    ) : null}
                  </div>

                  <div style={{ flex: 1 }}>
                    <AdminButton 
                      fullWidth
                      variant="ghost" 
                      onClick={() => setSelectedWorkshop(null)}
                      style={{ 
                        color: '#e03131',
                        background: 'rgba(224, 49, 49, 0.05)'
                      }}
                    >
                      Cerrar
                    </AdminButton>
                  </div>
                </div>

                {!isPaid && (
                  <p style={{ fontSize: '11px', textAlign: 'center', color: '#f08c00', fontWeight: 600, marginTop: '-5px' }}>
                    * Valida tu pago para habilitar la inscripción.
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <style>{`
        .calendar-container {
          background: #ffffff;
          border-radius: 28px;
          padding: 2rem;
          border: 1px solid var(--border-soft);
          overflow-x: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
        }
        .calendar-grid { 
          display: grid; 
          min-width: 900px; 
          position: relative; 
          border-radius: 16px;
          overflow: hidden;
          background: #f8fafc;
          grid-template-rows: 60px repeat(${HOURS.length * 12}, 6px);
        }
        .grid-header { 
          font-family: 'Source Sans 3', sans-serif; 
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 20; 
          background: #ffffff; 
          border-bottom: 1px solid #e2e8f0;
        }
        .time-label { 
          font-weight: 800; 
          font-size: 11px; 
          color: #64748b;
          letter-spacing: 0.5px;
        }
        .room-label { 
          font-weight: 900; 
          font-size: 12px;
          letter-spacing: 1.5px;
          transition: all 0.2s;
        }
        .hour-row-label {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          border-right: 1px solid #e2e8f0;
          background: #ffffff;
          z-index: 10;
        }
        .hour-grid-line {
          border-top: 1px dashed #e2e8f0;
          pointer-events: none;
          z-index: 5;
        }
        .calendar-workshop { 
          margin: 4px; 
          padding: 14px; 
          border-radius: 18px; 
          cursor: pointer; 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex; 
          flex-direction: column; 
          border: 1px solid transparent;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          background-clip: padding-box;
        }
        .calendar-workshop:hover:not(.blocked) { 
          transform: translateY(-3px); 
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15); 
          z-index: 50; 
        }
        .calendar-workshop .w-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .calendar-workshop.selected { 
          background: linear-gradient(135deg, #185fa5 0%, #0c3b69 100%) !important; 
          color: white !important; 
          border-color: #082d52; 
          box-shadow: 0 8px 16px -4px rgba(24, 95, 165, 0.4); 
          z-index: 25; 
        }
        .calendar-workshop.mandatory {
          background: rgba(15, 23, 42, 0.04);
          border: 1.5px dashed rgba(15, 23, 42, 0.1);
          cursor: default;
        }
        .calendar-workshop.mandatory.selected {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
          border-color: #000;
        }
        .w-title { 
          font-size: 13px; 
          font-weight: 800; 
          font-family: 'Source Sans 3', sans-serif; 
          line-height: 1.25; 
          margin: 8px 0; 
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .w-time { 
          font-size: 10px; 
          font-weight: 700; 
          background: rgba(0,0,0,0.05);
          padding: 3px 8px;
          border-radius: 8px;
          align-self: flex-start;
          color: inherit;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }
        .calendar-workshop.selected .w-time {
          background: rgba(255,255,255,0.2);
        }
        .w-speaker { 
          font-size: 10px; 
          font-weight: 600; 
          opacity: 0.85; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          margin-top: auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .selected-check { 
          position: absolute; 
          top: 10px; 
          right: 10px; 
          background: rgba(255,255,255,0.9); 
          color: #185fa5; 
          width: 22px; 
          height: 22px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          backdrop-filter: blur(4px);
        }
        .calendar-workshop.mandatory.selected .selected-check {
          color: #0f172a;
        }

        /* Selection Summary List Styles */
        .selection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border: 1px solid var(--border-soft);
          border-radius: 16px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .selection-item:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateX(5px);
        }
        .selection-item.mandatory {
          background: #f8fafc;
          border-left: 4px solid #0f172a;
        }
        .selection-item-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }
        .selection-item-room {
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--accent-primary);
          background: rgba(24, 95, 165, 0.08);
          padding: 4px 10px;
          border-radius: 6px;
          min-width: 90px;
          text-align: center;
        }
        .selection-item.mandatory .selection-item-room {
          color: #0f172a;
          background: rgba(15, 23, 42, 0.08);
        }
        .selection-item-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
          flex: 1;
        }
        .selection-item-time {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .selection-item-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          background: #0f172a;
          color: white;
          padding: 4px 12px;
          border-radius: 100px;
        }
        .selection-item-remove {
          background: none;
          border: none;
          color: #f03e3e;
          padding: 8px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
        }
        .selection-item-remove:hover {
          background: #fff5f5;
          transform: rotate(90deg);
        }

        /* RESPONSIVE ADJUSTMENTS */
        @media (max-width: 768px) {
          .workshops-module > div {
            padding: 1.5rem 1rem !important;
          }
          
          .calendar-container {
            padding: 1rem;
            border-radius: 16px;
            margin: 0 -0.5rem 2rem;
          }

          .calendar-grid {
            min-width: 800px; /* Un poco más compacto */
          }

          .selection-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
          }

          .selection-item-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            width: 100%;
          }

          .selection-item-room {
            min-width: unset;
            width: fit-content;
          }

          .selection-item-remove {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }

          .selection-item-title {
            font-size: 14px;
          }

          .w-title {
            font-size: 11px;
            -webkit-line-clamp: 2;
          }

          .w-time {
            font-size: 9px;
            padding: 2px 6px;
          }
          
          .w-speaker {
            font-size: 9px;
          }
        }

        /* Estilo de la barra de desplazamiento horizontal */
        .calendar-container::-webkit-scrollbar {
          height: 6px;
        }
        .calendar-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .calendar-container::-webkit-scrollbar-thumb {
          background: var(--accent-primary);
          border-radius: 10px;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

