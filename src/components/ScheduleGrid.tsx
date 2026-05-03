import { useState } from 'react';
import { type AgendaItem } from '../data/agendaData';
import { useCharlas } from '../api/hooks/useAgenda';

// Constantes de configuración
const START_H = 8, END_H = 21; 
const SLOT_H = 40; 
const SALAS = ['Salón A', 'Salón B', 'Salón C', 'Auditorio'];

export default function ScheduleGrid() {
  const { data: agenda = [], isLoading } = useCharlas();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [conflictMsg, setConflictMsg] = useState(false);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Cargando agenda oficial...</div>;

  // Filtrar solo talleres con ponente
  const tallaresData = agenda.filter(item => item.speaker !== undefined);

  // Mapear salas a índices para el grid
  const getSalaIndex = (roomName: string) => {
    if (roomName.includes('Salón A')) return 0;
    if (roomName.includes('Salón B')) return 1;
    if (roomName.includes('Salón C')) return 2;
    if (roomName.includes('Auditorio')) return 3;
    return 0;
  };

  // Parsear la hora (ej: "9:00 AM" a 9)
  const parseHour = (timeStr: string) => {
    const [h, rest] = timeStr.split(':');
    let hour = parseInt(h);
    if (rest.includes('PM') && hour !== 12) hour += 12;
    if (rest.includes('AM') && hour === 12) hour = 0;
    return hour;
  };

  const toggleTaller = (workshop: AgendaItem) => {
    const isSelected = selectedIds.includes(workshop.id);

    if (isSelected) {
      setSelectedIds(selectedIds.filter(id => id !== workshop.id));
    } else {
      // Cruzamiento
      const tallerHora = workshop.time;
      const hasConflict = selectedIds.some(id => {
        const other = tallaresData.find(w => w.id === id);
        return other?.time === tallerHora;
      });

      if (hasConflict) {
        setConflictMsg(true);
        setTimeout(() => setConflictMsg(false), 2500);
        return;
      }

      setSelectedIds([...selectedIds, workshop.id]);
    }
  };

  const getTallerStatus = (workshop: AgendaItem) => {
    if (selectedIds.includes(workshop.id)) return 'selected';
    
    const hasConflict = selectedIds.some(id => {
      const other = tallaresData.find(w => w.id === id);
      return other?.time === workshop.time;
    });
    
    if (hasConflict) return 'conflict';
    return 'available';
  };

  const totalRows = END_H - START_H;

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", padding: '10px' }}>
      <p style={{ fontSize: '12px', color: '#6b6b68', marginBottom: '8px' }}>
        Agenda interactiva. Haz clic para simular tu selección. Los bloques con opacidad baja están en conflicto.
      </p>

      <div style={{
        overflowX: 'auto',
        border: '0.5px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
        background: '#fff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(4, minmax(140px, 1fr))',
          gridTemplateRows: `auto repeat(${totalRows}, ${SLOT_H}px)`,
          minWidth: '700px'
        }}>

          {/* Cabeceras */}
          <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', fontWeight: 800, background: '#f8f9fa', borderBottom: '1px solid #efefef', borderRight: '1px solid #efefef' }}>
            Hora
          </div>
          {SALAS.map((sala, i) => (
            <div key={sala} style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', fontWeight: 800, background: '#f8f9fa', borderBottom: '1px solid #efefef', borderRight: i === 3 ? 'none' : '1px solid #efefef' }}>
              {sala}
            </div>
          ))}

          {/* Grid de Horas y Talleres */}
          {Array.from({ length: totalRows }).map((_, r) => {
            const hour = START_H + r;
            const hourStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

            return (
              <div key={hour} style={{ display: 'contents' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', padding: '10px 8px', textAlign: 'right', borderBottom: '1px solid #f1f1f1', borderRight: '1px solid #f1f1f1' }}>
                  {hourStr}
                </div>

                {Array.from({ length: 4 }).map((_, c) => {
                  const workshop = tallaresData.find(w => {
                    const wHour = parseHour(w.time);
                    return wHour === hour && getSalaIndex(w.room) === c;
                  });

                  if (workshop) {
                    const status = getTallerStatus(workshop);
                    const style = workshop.tagStyle || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };

                    return (
                      <div
                        key={workshop.id}
                        onClick={() => toggleTaller(workshop)}
                        style={{
                          padding: '8px',
                          cursor: status === 'conflict' ? 'not-allowed' : 'pointer',
                          background: style.bg,
                          color: style.text,
                          borderLeft: `3px solid ${style.text}`,
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          borderRight: c === 3 ? 'none' : '1px solid #f1f1f1',
                          transition: 'all 0.2s',
                          opacity: status === 'conflict' ? 0.25 : 1,
                          position: 'relative',
                          zIndex: status === 'selected' ? 10 : 1,
                          boxShadow: status === 'selected' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                          transform: status === 'selected' ? 'scale(1.02)' : 'none'
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>{workshop.title}</div>
                        <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8, marginTop: '2px' }}>{workshop.speaker?.name}</div>
                        
                        {status === 'selected' && (
                          <div style={{ position: 'absolute', top: '4px', right: '4px', color: style.text, fontSize: '12px' }}>✓</div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={`empty-${hour}-${c}`} style={{ borderBottom: '1px solid #f1f1f1', borderRight: c === 3 ? 'none' : '1px solid #f1f1f1' }} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {conflictMsg && (
        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fff5f5', color: '#c53030', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px solid #feb2b2' }}>
          ⚠ Tienes otro taller seleccionado a esa misma hora.
        </div>
      )}

      {/* Resumen de Selección */}
      {selectedIds.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#999', marginBottom: '10px' }}>Tu Pre-selección</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedIds.map(id => {
              const workshop = tallaresData.find(w => w.id === id);
              const style = workshop?.tagStyle || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
              return (
                <div key={`sel-${id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: style.bg, color: style.text, borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                  <span>{workshop?.time} · {workshop?.title}</span>
                  <button onClick={() => toggleTaller(workshop!)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}