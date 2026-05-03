import type { Speaker, AgendaItem } from '../data/agendaData';
import { useCharlas } from '../api/hooks/useAgenda';
import WorkshopCard from './workshops/WorkshopCard';
import { Icons } from './Icons';

interface SpeakerModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, isOpen, onClose }: SpeakerModalProps) {
  const { data: agenda = [] } = useCharlas();

  if (!isOpen || !speaker) return null;

  // Filtrar las charlas/talleres asignados a este ponente dinámicamente
  const speakerWorkshops = agenda.filter((w: AgendaItem) => w.speaker?.id === speaker.id);

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

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              {speaker.socialLinks && Object.entries(speaker.socialLinks).map(([type, url]) => {
                if (!url) return null;
                
                // Mapeo seguro de iconos
                const IconComponent = (Icons as any)[type.charAt(0).toUpperCase() + type.slice(1)] || Icons.ExternalLink;

                return (
                  <a 
                    key={type} 
                    href={url as string} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon-link" 
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <IconComponent size={18} color="var(--text-secondary)" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-soft)', margin: '1.5rem 0' }}></div>

        <h4 style={{ fontSize: '18px', marginBottom: '10px', fontFamily: 'Syne', fontWeight: 800 }}>Acerca de {speaker.name}</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
          {speaker.bio}
        </p>

        {speakerWorkshops.length > 0 && (
          <div className="speaker-workshops-section">
            <h4 style={{ fontSize: '18px', marginBottom: '15px', fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent-primary)' }}>
              Talleres que impartirá
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {speakerWorkshops.map((workshop: AgendaItem) => (
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
