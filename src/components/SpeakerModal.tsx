import type { Speaker } from '../data/agendaData';
import { agendaCompleta } from '../data/agendaData';
import WorkshopCard from './workshops/WorkshopCard';
import { Icons } from './Icons';

interface SpeakerModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, isOpen, onClose }: SpeakerModalProps) {
  if (!isOpen || !speaker) return null;

  // Filtrar los talleres asignados a este ponente
  const speakerWorkshops = agendaCompleta.filter(w => w.speaker?.id === speaker.id);

  return (
    <div className="modal-bg open" style={{ zIndex: 9999 }}>
      <div
        className="modal"
        style={{ maxWidth: '650px', padding: '2.5rem 2rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div
            className="speaker-avatar"
            style={{
              background: speaker.bgColor,
              color: speaker.textColor,
              flexShrink: 0,
              width: '90px',
              height: '90px',
              fontSize: '26px',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              borderRadius: '50%'
            }}
          >
            {speaker.avatar ? (
              <img src={speaker.avatar} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              speaker.initials
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '24px', margin: 0, fontFamily: 'Syne', fontWeight: 800 }}>{speaker.name}</h3>
            <p className="speaker-role" style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)' }}>{speaker.role}</p>

            {speaker.socialLinks && Object.values(speaker.socialLinks).some(link => link) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {speaker.socialLinks.facebook && (
                  <a href={speaker.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Facebook">
                    <Icons.Facebook size={18} color="var(--text-secondary)" />
                  </a>
                )}
                {speaker.socialLinks.instagram && (
                  <a href={speaker.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">
                    <Icons.Instagram size={18} color="var(--text-secondary)" />
                  </a>
                )}
                {speaker.socialLinks.tiktok && (
                  <a href={speaker.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="TikTok">
                    <Icons.TikTok size={18} color="var(--text-secondary)" />
                  </a>
                )}
                {speaker.socialLinks.x && (
                  <a href={speaker.socialLinks.x} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="X (Twitter)">
                    <Icons.TwitterX size={18} color="var(--text-secondary)" />
                  </a>
                )}
                {speaker.socialLinks.linkedin && (
                  <a href={speaker.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="LinkedIn">
                    <Icons.LinkedIn size={18} color="var(--text-secondary)" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-soft)', margin: '1.5rem 0' }}></div>

        <h4 style={{ fontSize: '18px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>Acerca de {speaker.name}</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
          {speaker.bio}
        </p>

        {speakerWorkshops.length > 0 && (
          <div className="speaker-workshops-section">
            <h4 style={{ fontSize: '18px', marginBottom: '15px', fontFamily: 'Syne', fontWeight: 800, color: 'var(--blue)' }}>
              Talleres que impartirá
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {speakerWorkshops.map(workshop => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  readOnly={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
