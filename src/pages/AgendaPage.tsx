import { useState } from 'react';
import AgendaModal, { type AgendaItem } from '../components/AgendaModal';
import { mockSpeakers } from './Ponentes';

// Módulo para generar la agenda matemáticamente en un solo día sin choques
function generarAgenda(): AgendaItem[] {
  let charlas: AgendaItem[] = [];

  // Registro (Mañana)
  charlas.push({
    id: 'reg-manana',
    time: '8:00 AM',
    title: 'Registro y bienvenida',
    description: 'Entrega de gafetes, kits de bienvenida y validación de pagos QR en el lobby principal.',
    tag: 'General',
    period: 'Mañana',
    location: 'Lobby Principal'
  });

  const ponentes = [...mockSpeakers];
  const locations = ['Salón A', 'Salón B', 'Salón C', 'Auditorio'];

  // MAÑANA - 1 Charla por ponente (12 charlas, agrupadas de a 4 simultáneas)
  const morningTimes = ['9:00 AM', '10:00 AM', '11:00 AM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4); // Las primeras 4 a las 9am, siguientes 4 a las 10am...
    const locationIndex = i % 4; // Distribuidos en los 4 salones

    charlas.push({
      id: `m-${ponente.id}`,
      time: morningTimes[timeIndex],
      title: `${ponente.tag}: Conceptos Fundamentales`,
      speaker: ponente,
      description: `Una introducción profunda a los conceptos centrales de ${ponente.tag}. ${ponente.name} explicará las bases técnicas y cómo se aplican en la industria actual.`,
      tag: ponente.tag,
      period: 'Mañana',
      location: locations[locationIndex]
    });
  }

  // ALMUERZO (Tarde)
  charlas.push({
    id: 'almuerzo',
    time: '12:30 PM',
    title: 'Almuerzo y Networking',
    description: 'Descanso libre en el área de comedores del Campus Central para intercambiar ideas y socializar.',
    tag: 'Descanso',
    period: 'Tarde',
    location: 'Comedor General'
  });

  // TARDE BLOQUE 1 - 1 Charla por ponente (12 charlas, 4 simultáneas)
  const afternoonTimes1 = ['2:00 PM', '3:00 PM', '4:00 PM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4);
    const locationIndex = (i + 1) % 4; // Rotamos los salones para el ponente

    charlas.push({
      id: `t1-${ponente.id}`,
      time: afternoonTimes1[timeIndex],
      title: `${ponente.tag}: Casos Prácticos y Éxito`,
      speaker: ponente,
      description: `Aplicación en la vida real de ${ponente.tag}. ${ponente.name} presentará casos de éxito y retos experimentados en su rol como ${ponente.role}.`,
      tag: ponente.tag,
      period: 'Tarde',
      location: locations[locationIndex]
    });
  }

  // TARDE BLOQUE 2 - 1 Charla por ponente (12 charlas, 4 simultáneas)
  const afternoonTimes2 = ['5:00 PM', '6:00 PM', '7:00 PM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4);
    const locationIndex = (i + 2) % 4; // Rotamos salones

    charlas.push({
      id: `t2-${ponente.id}`,
      time: afternoonTimes2[timeIndex],
      title: `${ponente.tag}: Mitos, Futuro y Q&A`,
      speaker: ponente,
      description: `Discusión abierta sobre el futuro de ${ponente.tag}. Sesión interactiva de preguntas y respuestas entre el público y ${ponente.name}.`,
      tag: ponente.tag,
      period: 'Tarde',
      location: locations[locationIndex]
    });
  }

  // CIERRE (Tarde)
  charlas.push({
    id: 'cierre',
    time: '8:00 PM',
    title: 'Clausura del congreso',
    description: 'Palabras de cierre por el comité organizador, sorteos para los asistentes y despedida oficial del congreso.',
    tag: 'General',
    period: 'Tarde',
    location: 'Auditorio Principal'
  });

  return charlas;
}

const agendaCompleta = generarAgenda();

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