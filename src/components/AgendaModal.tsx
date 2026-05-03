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
      title=""
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <WorkshopBadge tag={item.tag || 'General'} style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '28px', margin: '0 0 1rem 0', fontFamily: 'Source Sans 3', fontWeight: 800, lineHeight: 1.2 }}>
            {item.title}
          </h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--text-secondary)',
              background: 'var(--bg-app)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              <Icons.Clock size={14} color="var(--accent-primary)" />
              {item.time} - {item.endTime}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--text-secondary)',
              background: 'var(--bg-app)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              <Icons.MapPin size={14} color="var(--accent-primary)" />
              {item.room}
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            color: 'var(--accent-primary)',
            marginBottom: '10px' 
          }}>
            Descripción
          </h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line', margin: 0 }}>
            {item.description}
          </p>
        </div>

        {item.speaker && (
          <div style={{ 
            marginTop: '0.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div
              className="speaker-avatar"
              style={{
                background: item.speaker.bgColor,
                color: item.speaker.textColor,
                width: '60px',
                height: '60px',
                fontSize: '20px',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                borderRadius: '50%',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '3px solid white'
              }}
            >
              {item.speaker.avatar ? (
                <img src={item.speaker.avatar} alt={item.speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                item.speaker.initials
              )}
            </div>
            <div>
              <h4 style={{ fontSize: '11px', margin: '0 0 4px 0', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Ponente
              </h4>
              <h3 style={{ fontSize: '18px', margin: '0 0 2px 0', fontWeight: 800, color: 'var(--text-primary)' }}>{item.speaker.name}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.speaker.role}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
