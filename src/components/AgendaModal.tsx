import type { AgendaItem } from "../data/agendaData";
import WorkshopBadge from "./workshops/WorkshopBadge";
import { Icons } from "./Icons";

interface AgendaModalProps {
  item: AgendaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgendaModal({ item, isOpen, onClose }: AgendaModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-bg open" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '600px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <Icons.X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          {/* Usamos el tag o el nombre de la categoría */}
          <WorkshopBadge tag={item.tag || 'General'} />
          <h3 style={{ fontSize: '26px', marginBottom: '8px', lineHeight: '1.2' }}>{item.title}</h3>

          <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '14px', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Calendar size={16} />
              Jornada: {item.period}
            </span>
            <span style={{ flex: 1, minWidth: '1px', maxWidth: '1px', height: '15px', background: 'var(--border-soft)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64b5f6', fontWeight: 600 }}>
              <Icons.Clock size={16} />
              {item.time}
            </span>
            <span style={{ flex: 1, minWidth: '1px', maxWidth: '1px', height: '15px', background: 'var(--border-soft)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#81c784', fontWeight: 600 }}>
              <Icons.MapPin size={16} />
              {item.room}
            </span>
          </div>
        </div>

        {item.speaker && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
            <div
              className="speaker-avatar"
              style={{ background: item.speaker.bgColor, color: item.speaker.textColor, width: '50px', height: '50px', fontSize: '18px', margin: 0, flexShrink: 0 }}
            >
              {item.speaker.avatar ? (
                <img src={item.speaker.avatar} alt={item.speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                item.speaker.initials
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px' }}>{item.speaker.name}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{item.speaker.role}</p>
            </div>
          </div>
        )}

        <div style={{ height: '1px', background: 'var(--border-soft)', margin: '1.5rem 0' }}></div>

        <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Sobre esta charla</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line' }}>
          {item.description}
        </p>

      </div>
    </div>
  );
}
