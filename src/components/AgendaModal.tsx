import type { AgendaItem } from "../data/agendaData";
import WorkshopBadge from "./workshops/WorkshopBadge";
import { Icons } from "./Icons";
import Modal from "./ui/Modal";

interface AgendaModalProps {
  item: AgendaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgendaModal({ item, isOpen, onClose }: AgendaModalProps) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="600px"
      title="" // El título lo manejamos personalizado abajo para el badge
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <WorkshopBadge tag={item.tag || 'General'} style={{ marginBottom: '8px' }} />
        <h3 style={{
          fontSize: '28px',
          marginBottom: '4px',
          lineHeight: '1.2',
          fontFamily: 'Source Sans 3, sans-serif',
          fontWeight: 800
        }}>
          {item.title}
        </h3>

        <div style={{
          display: 'flex',
          gap: '10px',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          alignItems: 'center',
          marginTop: '10px',
          flexWrap: 'wrap'
        }}>
          {/* Badge Jornada */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-app)',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-soft)',
            fontWeight: 600
          }}>
            <Icons.Calendar size={14} />
            Jornada: {item.period}
          </div>

          {/* Badge Hora */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#185FA5',
            background: '#E6F1FB',
            padding: '4px 12px',
            borderRadius: '8px',
            fontWeight: 700
          }}>
            <Icons.Clock size={14} />
            {item.time}
          </div>

          {/* Badge Salón */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#16a34a',
            background: '#E1F5EE',
            padding: '4px 12px',
            borderRadius: '8px',
            fontWeight: 700
          }}>
            <Icons.MapPin size={14} />
            {item.room}
          </div>
        </div>
      </div>

      {item.speaker && (
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          background: 'var(--bg-app)',
          padding: '1.2rem',
          borderRadius: '16px',
          border: '1px solid var(--border-soft)',
          marginBottom: '2rem'
        }}>
          <div
            className="speaker-avatar"
            style={{
              background: item.speaker.bgColor,
              color: item.speaker.textColor,
              width: '56px',
              height: '56px',
              fontSize: '20px',
              margin: 0,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {item.speaker.avatar ? (
              <img src={item.speaker.avatar} alt={item.speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              item.speaker.initials
            )}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{item.speaker.name}</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{item.speaker.role}</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--text-secondary)',
          marginBottom: '12px'
        }}>
          Sobre esta charla
        </h4>
        <p style={{
          color: 'var(--text-primary)',
          lineHeight: '1.7',
          fontSize: '15px',
          whiteSpace: 'pre-line',
          background: 'var(--bg-card)',
          padding: '0',
          margin: 0
        }}>
          {item.description}
        </p>
      </div>
    </Modal>
  );
}

