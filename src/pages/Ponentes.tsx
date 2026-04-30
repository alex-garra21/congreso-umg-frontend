import { useState, useEffect } from 'react';
import SpeakerModal from '../components/SpeakerModal';
import { getSpeakers, type Speaker } from '../utils/agendaStore';
import WorkshopBadge from '../components/workshops/WorkshopBadge';

export default function PonentesPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>(getSpeakers());

  useEffect(() => {
    const handleUpdate = () => setSpeakers(getSpeakers());
    window.addEventListener('agendaUpdate', handleUpdate);
    return () => window.removeEventListener('agendaUpdate', handleUpdate);
  }, []);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático copiado del Hero */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <span className="speakers-header-badge">Expertos</span>
          <h2>Ponentes invitados</h2>
        </div>

        <div className="speakers-grid">
          {speakers.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Ponentes próximamente</h3>
              <p style={{ fontSize: '0.95rem' }}>
                Los ponentes confirmados serán publicados en cuanto estén disponibles.<br />
                Vuelve pronto para conocer a los expertos del evento.
              </p>
            </div>
          ) : (
            speakers.map(speaker => (
              <div key={speaker.id} className="speaker-card" onClick={() => setSelectedSpeaker(speaker)}>
                <div
                  className="speaker-avatar"
                  style={{ background: speaker.bgColor, color: speaker.textColor }}
                >
                  {speaker.initials}
                </div>
                <h3 className="speaker-name">{speaker.name}</h3>
                <p className="speaker-role">{speaker.role}</p>
                <WorkshopBadge tag={speaker.tag} className="speaker-tag-component" />
              </div>
            ))
          )}
        </div>

        <SpeakerModal
          isOpen={selectedSpeaker !== null}
          speaker={selectedSpeaker}
          onClose={() => setSelectedSpeaker(null)}
        />

      </div>
    </div>
  );
}