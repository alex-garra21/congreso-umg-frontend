import { useState } from 'react';
import { usePonentes } from '../api/hooks/useAgenda';
import type { Speaker } from '../data/agendaData';
import SpeakerModal from '../components/SpeakerModal';
import { Icons } from '../components/Icons';

export default function PonentesPage() {
  const { data: speakers = [], isLoading } = usePonentes();
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
          {isLoading ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-secondary)'
            }}>
              Cargando ponentes...
            </div>
          ) : speakers.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                  background: 'var(--accent-light)', 
                  padding: '20px', 
                  borderRadius: '24px',
                  color: 'var(--accent-primary)'
                }}>
                  <Icons.Mic size={48} strokeWidth={1.5} />
                </div>
              </div>
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
                  {speaker.avatar ? (
                    <img src={speaker.avatar} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    speaker.initials
                  )}
                </div>
                <h3 className="speaker-name">{speaker.name}</h3>
                <p className="speaker-role">{speaker.role}</p>

                {speaker.socialLinks && Object.values(speaker.socialLinks).some(link => link) && (
                  <div className="speaker-card-socials" onClick={(e) => e.stopPropagation()}>
                    {speaker.socialLinks.facebook && (
                      <a href={speaker.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Facebook">
                        <Icons.Facebook size={14} color="var(--text-secondary)" />
                      </a>
                    )}
                    {speaker.socialLinks.instagram && (
                      <a href={speaker.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">
                        <Icons.Instagram size={14} color="var(--text-secondary)" />
                      </a>
                    )}
                    {speaker.socialLinks.tiktok && (
                      <a href={speaker.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="TikTok">
                        <Icons.TikTok size={14} color="var(--text-secondary)" />
                      </a>
                    )}
                    {speaker.socialLinks.x && (
                      <a href={speaker.socialLinks.x} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="X (Twitter)">
                        <Icons.TwitterX size={14} color="var(--text-secondary)" />
                      </a>
                    )}
                    {speaker.socialLinks.linkedin && (
                      <a href={speaker.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="LinkedIn">
                        <Icons.LinkedIn size={14} color="var(--text-secondary)" />
                      </a>
                    )}
                  </div>
                )}
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