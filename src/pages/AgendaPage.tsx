import { useState } from 'react';
import AgendaModal from '../components/AgendaModal';
import { agendaCompleta, type AgendaItem } from '../data/agendaData';

export default function AgendaPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'Mañana' | 'Tarde'>('Mañana');
  const [charlaSeleccionada, setCharlaSeleccionada] = useState<AgendaItem | null>(null);

  const charlasMostradas = agendaCompleta.filter(c => c.period === periodoSeleccionado);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <span className="speakers-header-badge">Programa</span>
          <h2>Agenda del evento</h2>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Sábado 17 de Octubre — Campus Central UMG</p>
        </div>

        {/* TABS para Periodos */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', justifyContent: 'center' }}>
          {(['Mañana', 'Tarde'] as const).map(periodo => (
            <button
              key={periodo}
              className="btn-solid"
              style={{
                background: periodoSeleccionado === periodo ? 'var(--blue)' : 'var(--bg-secondary)',
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
          {charlasMostradas.map(charla => (
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
                  📍 {charla.location}
                </span>
                <h3>{charla.title}</h3>
                <p>
                  {charla.speaker
                    ? `${charla.speaker.name} — ${charla.speaker.role.substring(0, 40)}...`
                    : (charla.id.startsWith('reg') ? 'Comité Organizador UMG' : (charla.id === 'almuerzo' ? 'Área de comedores, Campus Central' : 'Clausura General'))
                  }
                </p>
              </div>

              <div>
                <span
                  className="agenda-badge"
                  style={{
                    background: charla.speaker?.tagBgColor || (charla.id.startsWith('reg') || charla.id === 'cierre' ? '#f5f5f5' : '#fff3e0'),
                    color: charla.speaker?.tagTextColor || (charla.id.startsWith('reg') || charla.id === 'cierre' ? '#616161' : '#e65100'),
                    border: 'none'
                  }}
                >
                  {charla.tag}
                </span>
              </div>
            </div>
          ))}
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