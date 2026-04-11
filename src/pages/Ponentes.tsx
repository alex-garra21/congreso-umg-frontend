import { useState } from 'react';
import SpeakerModal from '../components/SpeakerModal';
import { mockSpeakers, type Speaker } from '../data/agendaData';

export default function PonentesPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

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
          {mockSpeakers.map(speaker => (
            <div key={speaker.id} className="speaker-card" onClick={() => setSelectedSpeaker(speaker)}>
              <div
                className="speaker-avatar"
                style={{ background: speaker.bgColor, color: speaker.textColor }}
              >
                {speaker.initials}
              </div>
              <h3 className="speaker-name">{speaker.name}</h3>
              <p className="speaker-role">{speaker.role}</p>
              <span
                className="speaker-tag"
                style={{ background: speaker.tagBgColor, color: speaker.tagTextColor }}
              >
                {speaker.tag}
              </span>
            </div>
          ))}
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