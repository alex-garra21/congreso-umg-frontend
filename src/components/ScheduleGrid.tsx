import { useCharlas, useSalas } from '../api/hooks/useAgenda';
import { timeToMinutes } from '../utils/timeUtils';

// Constantes de diseño
const SLOT_H = 40; 

export default function ScheduleGrid() {
  const { data: agenda = [], isLoading: loadingAgenda } = useCharlas();
  const { data: rooms = [], isLoading: loadingRooms } = useSalas();

  if (loadingAgenda || loadingRooms) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Cargando agenda...</div>;
  }

  // Filtrar actividades que tengan ponente (talleres)
  const tallaresData = agenda.filter(item => item.speaker !== undefined);

  // --- CONFIGURACIÓN REACTIVA DE TIEMPO ---
  let START_H = 8;
  let END_H = 17;

  if (tallaresData.length > 0) {
    const times = tallaresData.map(w => timeToMinutes(w.time) / 60);
    const endTimes = tallaresData.map(w => timeToMinutes(w.endTime) / 60);
    START_H = Math.floor(Math.min(...times));
    END_H = Math.ceil(Math.max(...endTimes));
    if (START_H >= END_H) END_H = START_H + 1;
  }
  
  const totalRows = END_H - START_H;
  // ----------------------------------------

  // Definir las columnas: 1 para la hora + N para las salas
  const gridColumns = `70px repeat(${rooms.length}, minmax(140px, 1fr))`;

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", padding: '10px' }}>
      <p style={{ fontSize: '12px', color: '#6b6b68', marginBottom: '8px' }}>
        Cronograma dinámico de actividades por sala.
      </p>

      <div style={{
        overflowX: 'auto',
        border: '0.5px solid rgba(0,0,0,0.1)',
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gridTemplateRows: `auto repeat(${totalRows}, ${SLOT_H}px)`,
          minWidth: rooms.length * 140 + 70 + 'px'
        }}>

          {/* Cabeceras de Sala (Dinámicas) */}
          <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '11px', fontWeight: 800, background: '#f8f9fa', borderBottom: '1px solid #efefef', borderRight: '1px solid #efefef' }}>
            Hora
          </div>
          {rooms.map((room, i) => (
            <div key={room.id} style={{ 
              padding: '10px 4px', 
              textAlign: 'center', 
              fontSize: '11px', 
              fontWeight: 800, 
              background: '#f8f9fa', 
              borderBottom: '1px solid #efefef', 
              borderRight: i === rooms.length - 1 ? 'none' : '1px solid #efefef',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}>
              {room.name}
            </div>
          ))}

          {/* Grid de Horas y Actividades */}
          {Array.from({ length: totalRows }).map((_, r) => {
            const hour = START_H + r;
            const hourStr = `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

            return (
              <div key={hour} style={{ display: 'contents' }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  color: '#94a3b8', 
                  padding: '10px 8px', 
                  textAlign: 'right', 
                  borderBottom: '1px solid #f1f1f1', 
                  borderRight: '1px solid #f1f1f1' 
                }}>
                  {hourStr}
                </div>

                {rooms.map((room, colIdx) => {
                  // Buscar actividad para esta hora y esta sala específica por ID o Nombre
                  const workshop = tallaresData.find(w => {
                    const wHour = Math.floor(timeToMinutes(w.time) / 60);
                    const matchesRoom = w.locationId === room.id || w.room === room.name;
                    return wHour === hour && matchesRoom;
                  });

                  if (workshop) {
                    const style = workshop.tagStyle || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };

                    return (
                      <div
                        key={workshop.id}
                        style={{
                          padding: '8px',
                          background: style.bg,
                          color: style.text,
                          borderLeft: `3px solid ${style.text}`,
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          borderRight: colIdx === rooms.length - 1 ? 'none' : '1px solid #f1f1f1',
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>{workshop.title}</div>
                        <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.8, marginTop: '2px' }}>{workshop.speaker?.name}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={`empty-${hour}-${room.id}`} style={{ 
                      borderBottom: '1px solid #f1f1f1', 
                      borderRight: colIdx === rooms.length - 1 ? 'none' : '1px solid #f1f1f1' 
                    }} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
