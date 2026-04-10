import { useState } from 'react';

interface Taller {
  id: number;
  sala: number;
  nombre: string;
  inicio: number;
  fin: number;
  ponente: string;
}

// Constantes de configuración
const START_H = 8, END_H = 19, LUNCH_S = 13, LUNCH_E = 14;
const SLOT_H = 26;
const SALAS = ['A', 'B', 'C', 'D', 'E'];
const SALA_BG = ['#E6F1FB', '#E1F5EE', '#EEEDFE', '#FAECE7', '#FAEEDA'];
const SALA_COL = ['#0C447C', '#085041', '#3C3489', '#712B13', '#633806'];

const TALLERES = [
  { id: 1, sala: 0, nombre: 'IA y educación', inicio: 8, fin: 11, ponente: 'Dr. C. Méndez' },
  { id: 2, sala: 0, nombre: 'Ciberseguridad', inicio: 11, fin: 13, ponente: 'Ing. S. Torres' },
  { id: 3, sala: 0, nombre: 'Transformación digital', inicio: 14, fin: 17, ponente: 'Ing. R. Lima' },
  { id: 4, sala: 0, nombre: 'Innovación en datos', inicio: 17, fin: 19, ponente: 'Dr. L. Pérez' },
  { id: 5, sala: 1, nombre: 'Liderazgo universitario', inicio: 8, fin: 10, ponente: 'Lic. A. Ramírez' },
  { id: 6, sala: 1, nombre: 'Emprendimiento social', inicio: 10, fin: 13, ponente: 'Mtra. R. Díaz' },
  { id: 7, sala: 1, nombre: 'Gestión ágil', inicio: 14, fin: 16, ponente: 'Ing. M. Fuentes' },
  { id: 8, sala: 1, nombre: 'Finanzas personales', inicio: 16, fin: 19, ponente: 'Lic. P. Gómez' },
  { id: 9, sala: 2, nombre: 'Investigación científica', inicio: 8, fin: 13, ponente: 'Dra. M. Fuentes' },
  { id: 10, sala: 2, nombre: 'Redacción académica', inicio: 14, fin: 16, ponente: 'Dr. A. Vega' },
  { id: 11, sala: 2, nombre: 'Bioética y tecnología', inicio: 16, fin: 19, ponente: 'Dra. C. Ruiz' },
  { id: 12, sala: 3, nombre: 'Diseño UX/UI', inicio: 8, fin: 11, ponente: 'Dis. L. Estrada' },
  { id: 13, sala: 3, nombre: 'Desarrollo web', inicio: 11, fin: 13, ponente: 'Ing. D. Soto' },
  { id: 14, sala: 3, nombre: 'Aplicaciones móviles', inicio: 14, fin: 19, ponente: 'Ing. K. Méndez' },
  { id: 15, sala: 4, nombre: 'Salud mental', inicio: 8, fin: 10, ponente: 'Psic. S. Leal' },
  { id: 16, sala: 4, nombre: 'Oratoria', inicio: 10, fin: 13, ponente: 'Lic. H. Lima' },
  { id: 17, sala: 4, nombre: 'Fotografía', inicio: 14, fin: 16, ponente: 'Lic. C. Torres' },
  { id: 18, sala: 4, nombre: 'Arte digital', inicio: 16, fin: 19, ponente: 'Dis. F. Cruz' },
];

export default function ScheduleGrid() {
  const [selectedTalleres, setSelectedTalleres] = useState<Taller[]>([]);
  const [conflictMsg, setConflictMsg] = useState(false);

  // Función auxiliar para detectar cruces de horario
  const overlaps = (a: Taller, b: Taller) => a.inicio < b.fin && a.fin > b.inicio;

  const toggleTaller = (taller: Taller) => {
    const isSelected = selectedTalleres.some((s) => s.id === taller.id);

    if (isSelected) {
      // Si ya está seleccionado, lo quitamos
      setSelectedTalleres(selectedTalleres.filter((s) => s.id !== taller.id));
    } else {
      // Si no está seleccionado, revisamos conflictos
      const hasConflict = selectedTalleres.find((s) => overlaps(s, taller));
      
      if (hasConflict) {
        setConflictMsg(true);
        setTimeout(() => setConflictMsg(false), 2800);
        return;
      }
      
      // Si no hay conflicto, lo agregamos al estado
      setSelectedTalleres([...selectedTalleres, taller]);
    }
  };

  const getTallerStatus = (taller: Taller) => {
    const isSelected = selectedTalleres.some((s) => s.id === taller.id);
    if (isSelected) return 'selected';
    
    const isConflict = selectedTalleres.some((s) => overlaps(s, taller));
    if (isConflict) return 'conflict';
    
    return 'available';
  };

  const totalRows = END_H - START_H;

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <p style={{ fontSize: '12px', color: '#6b6b68', marginBottom: '8px' }}>
        Haz clic en un taller para seleccionarlo. Los bloques transparentes están en conflicto de horario con tu selección.
      </p>

      {/* Grid Principal */}
      <div style={{ 
        overflowX: 'auto', 
        border: '0.5px solid rgba(0,0,0,0.1)', 
        borderRadius: '10px' 
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(5, minmax(0, 1fr))',
          gridTemplateRows: `auto repeat(${totalRows}, ${SLOT_H}px)`,
          minWidth: '560px'
        }}>
          
          {/* Cabeceras */}
          <div style={{ padding: '7px 4px', textAlign: 'center', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '0.5px solid rgba(0,0,0,0.1)', borderRight: '0.5px solid rgba(0,0,0,0.1)', background: '#f5f5f3' }}>
            Hora
          </div>
          {SALAS.map((sala, i) => (
            <div key={sala} style={{ padding: '7px 4px', textAlign: 'center', fontSize: '11px', fontWeight: 700, borderBottom: '0.5px solid rgba(0,0,0,0.1)', borderRight: i === 4 ? 'none' : '0.5px solid rgba(0,0,0,0.1)', background: SALA_BG[i], color: SALA_COL[i] }}>
              Sala {sala}
            </div>
          ))}

          {/* Filas de tiempo y celdas */}
          {Array.from({ length: totalRows }).map((_, r) => {
            const hour = START_H + r;
            const isLunch = hour >= LUNCH_S && hour < LUNCH_E;

            return (
              <div key={hour} style={{ display: 'contents' }}>
                {/* Celda de la Hora */}
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#6b6b68', height: `${SLOT_H}px`, padding: '0 4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', borderRight: '0.5px solid rgba(0,0,0,0.1)', borderBottom: '0.5px solid rgba(0,0,0,0.1)', background: isLunch ? '#f5f5f3' : 'transparent' }}>
                  {hour}:00
                </div>

                {/* Celdas de las Salas */}
                {Array.from({ length: 5 }).map((_, c) => {
                  const taller = TALLERES.find(t => t.sala === c && t.inicio === hour);
                  
                  if (taller) {
                    const dur = taller.fin - taller.inicio;
                    const status = getTallerStatus(taller);
                    
                    return (
                      <div
                        key={taller.id}
                        onClick={() => toggleTaller(taller)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '5px 6px',
                          cursor: status === 'conflict' ? 'not-allowed' : 'pointer',
                          background: SALA_BG[c],
                          color: SALA_COL[c],
                          borderBottom: '0.5px solid rgba(0,0,0,0.1)',
                          borderRight: c === 4 ? 'none' : '0.5px solid rgba(0,0,0,0.1)',
                          height: `${dur * SLOT_H}px`,
                          gridRow: `span ${dur}`,
                          position: 'relative',
                          transition: 'opacity 0.15s, outline 0.15s',
                          userSelect: 'none',
                          opacity: status === 'conflict' ? 0.35 : 1,
                          outline: status === 'selected' ? '2px solid #185FA5' : 'none',
                          outlineOffset: '-2px'
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.3 }}>{taller.nombre}</div>
                        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{taller.inicio}:00–{taller.fin}:00</div>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '1px' }}>{taller.ponente}</div>
                        
                        {status === 'selected' && (
                          <div style={{ position: 'absolute', top: '5px', right: '5px', width: '14px', height: '14px', borderRadius: '50%', background: '#185FA5', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Si no hay taller iniciando aquí, verificar si la celda está ocupada por un taller anterior
                  const occupied = TALLERES.find(t => t.sala === c && t.inicio < hour && t.fin > hour);
                  if (!occupied) {
                    return (
                      <div key={`empty-${hour}-${c}`} style={{ height: `${SLOT_H}px`, borderBottom: '0.5px solid rgba(0,0,0,0.1)', borderRight: c === 4 ? 'none' : '0.5px solid rgba(0,0,0,0.1)', background: isLunch ? '#f5f5f3' : '#ffffff' }} />
                    );
                  }
                  
                  return null; // La celda está cubierta por el span de un taller anterior
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de Salas */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
        {SALAS.map((sala, i) => (
          <div key={`legend-${sala}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 500, color: '#6b6b68' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: SALA_BG[i], flexShrink: 0 }} />
            Sala {sala}
          </div>
        ))}
      </div>

      {/* Lista de Seleccionados y Conflictos */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6b6b68', marginBottom: '6px' }}>
          Talleres seleccionados
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '28px' }}>
          {selectedTalleres.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#6b6b68', fontStyle: 'italic' }}>Ningún taller seleccionado aún</span>
          ) : (
            selectedTalleres.map((t) => (
              <div key={`selected-${t.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f3', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 500, color: '#1a1a18' }}>
                <span>Sala {SALAS[t.sala]} · {t.nombre} ({t.inicio}:00–{t.fin}:00)</span>
                <button 
                  onClick={() => toggleTaller(t)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b68', fontSize: '13px', padding: 0, lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {conflictMsg && (
          <div style={{ fontSize: '11px', color: '#A32D2D', background: '#FCEBEB', borderRadius: '6px', padding: '5px 10px', marginTop: '8px' }}>
            ⚠ Ese taller se solapa con uno que ya elegiste.
          </div>
        )}
      </div>
    </div>
  );
}