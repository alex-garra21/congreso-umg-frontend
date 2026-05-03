import { useState } from 'react';
import { useCharlas } from '../api/hooks/useAgenda';
import type { AgendaItem } from '../data/agendaData';
import WorkshopBadge from '../components/workshops/WorkshopBadge';
import AgendaModal from '../components/AgendaModal';
import CalendarLink from '../components/CalendarLink';
import LocationLink from '../components/LocationLink';

export default function AgendaPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'Mañana' | 'Tarde'>('Mañana');
  const [charlaSeleccionada, setCharlaSeleccionada] = useState<AgendaItem | null>(null);
  const { data: agenda = [], isLoading } = useCharlas();

  // Función para convertir "8:00 AM" en un valor numérico comparable
  const parseTimeToNumber = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  };

  const charlasMostradas = agenda
    .filter(c => c.period === periodoSeleccionado)
    .sort((a, b) => parseTimeToNumber(a.time) - parseTimeToNumber(b.time));

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <span className="speakers-header-badge">Programa</span>
          <h2>Agenda del evento</h2>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
            <CalendarLink>
              <p style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                📅 Sábado 23 de Mayo —
              </p>
            </CalendarLink>
            <LocationLink>
              <p style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                Hotel Alcazar doña Victoria, Cobán
              </p>
            </LocationLink>
          </div>
        </div>

        {/* TABS para Periodos */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', justifyContent: 'center' }}>
          {(['Mañana', 'Tarde'] as const).map(periodo => (
            <button
              key={periodo}
              className="btn-solid"
              style={{
                background: periodoSeleccionado === periodo ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: periodoSeleccionado === periodo ? 'white' : 'var(--text-primary)',
                border: periodoSeleccionado !== periodo ? '1px solid var(--border-soft)' : 'none',
                minWidth: '150px'
              }}
              onClick={() => setPeriodoSeleccionado(periodo)}
            >
              JORNADA {periodo.toUpperCase()}
            </button>
          ))}
        </div>

        {/* LISTA DE LA AGENDA */}
        <div className="agenda-list">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              Cargando agenda...
            </div>
          ) : charlasMostradas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Programa próximamente</h3>
              <p style={{ fontSize: '0.95rem' }}>
                La jornada de la {periodoSeleccionado.toLowerCase()} aún no ha sido publicada.<br />
                Vuelve pronto para ver las charlas y talleres confirmados.
              </p>
            </div>
          ) : (
            charlasMostradas.map(charla => (
              <div
                key={charla.id}
                className="agenda-list-item"
                onClick={() => setCharlaSeleccionada(charla)}
              >
                <div className="agenda-time">
                  {charla.time}
                </div>

                <div className="agenda-content">
                  <span style={{ fontSize: '13px', color: '#81c784', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    📍 {charla.room}
                  </span>
                  <h3>{charla.title}</h3>
                  <p>
                    {charla.speaker
                      ? `${charla.speaker.name} — ${charla.speaker.role.substring(0, 40)}...`
                      : (charla.id.startsWith('reg') ? 'Comité Organizador UMG' : (charla.id === 'almuerzo' ? 'Hotel Alcázar doña Victoria' : 'Clausura General'))
                    }
                  </p>
                </div>

                <div>
                  <WorkshopBadge tag={charla.tag} />
                </div>
              </div>
            ))
          )}
        </div>

        <AgendaModal
          isOpen={charlaSeleccionada !== null}
          item={charlaSeleccionada}
          onClose={() => setCharlaSeleccionada(null)}
        />

      </div>
    </div>
  );
}