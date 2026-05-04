import { useState } from 'react';
import { usePonentes } from '../api/hooks/useAgenda';
import type { Speaker } from '../data/agendaData';
import SpeakerModal from '../components/SpeakerModal';
import { Icons } from '../components/Icons';
import PublicContainer from '../components/layout/PublicContainer';

export default function PonentesPage() {
  const { data: speakers = [], isLoading } = usePonentes();
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <PublicContainer
      title="Ponentes invitados"
      description="Conoce a los expertos que compartirán su conocimiento y experiencia en el congreso."
    >
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

              {speaker.socialLinks && Object.entries(speaker.socialLinks).some(([_, url]) => url && url.trim() !== '') && (
                <div className="speaker-card-socials" onClick={(e) => e.stopPropagation()}>
                  {Object.entries(speaker.socialLinks).map(([type, url]) => {
                    if (!url || typeof url !== 'string' || url.trim() === '') return null;

                    const getIcon = (type: string) => {
                      const t = type.toLowerCase();
                      if (t === 'x' || t === 'twitter') return Icons.TwitterX;
                      if (t === 'linkedin') return Icons.LinkedIn;
                      if (t === 'facebook') return Icons.Facebook;
                      if (t === 'instagram') return Icons.Instagram;
                      if (t === 'tiktok') return Icons.TikTok;
                      if (t === 'youtube') return Icons.Youtube;
                      if (t === 'whatsapp') return Icons.WhatsApp;
                      if (t === 'threads') return Icons.Threads;
                      if (t === 'website' || t === 'web' || t === 'globe') return Icons.Globe;

                      return (Icons as any)[type.charAt(0).toUpperCase() + type.slice(1)] || Icons.ExternalLink;
                    };

                    const IconComponent = getIcon(type);

                    return (
                      <a
                        key={type}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-link"
                        title={type.charAt(0).toUpperCase() + type.slice(1)}
                      >
                        <IconComponent size={14} color="var(--text-secondary)" />
                      </a>
                    );
                  })}
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

      <style>{`
        .speakers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-top: 2rem;
        }

        .speaker-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 32px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .speaker-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--accent-primary), #6366f1);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .speaker-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .speaker-card:hover::before {
          opacity: 1;
        }

        .speaker-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 32px;
          font-family: 'Source Sans 3', sans-serif;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border: 4px solid white;
          transition: transform 0.4s ease;
        }

        .speaker-card:hover .speaker-avatar {
          transform: scale(1.1);
        }

        .speaker-name {
          font-size: 22px;
          font-weight: 800;
          color: #1a365d;
          margin-bottom: 0.5rem;
          font-family: 'Source Sans 3', sans-serif;
        }

        .speaker-role {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .speaker-card-socials {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          width: 100%;
        }

        .social-icon-link {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .social-icon-link:hover {
          background: var(--accent-primary);
          color: white;
          transform: translateY(-2px);
        }

        .social-icon-link:hover svg {
          color: white !important;
        }

        @media (max-width: 640px) {
          .speakers-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .speaker-card {
            padding: 2rem;
          }
        }
      `}</style>
    </PublicContainer>
  );
}