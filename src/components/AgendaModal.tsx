import type { Speaker } from "../data/agendaData";
import WorkshopBadge from "./workshops/WorkshopBadge";

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker?: Speaker;
  description: string;
  tag: string;
  period: 'Mañana' | 'Tarde';
  location: string;
}

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
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <WorkshopBadge tag={item.tag} />
          <h3 style={{ fontSize: '26px', marginBottom: '8px', lineHeight: '1.2' }}>{item.title}</h3>

          <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '14px', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Jornada: {item.period}
            </span>
            <span style={{ flex: 1, minWidth: '1px', maxWidth: '1px', height: '15px', background: 'var(--border-soft)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64b5f6', fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {item.time}
            </span>
            <span style={{ flex: 1, minWidth: '1px', maxWidth: '1px', height: '15px', background: 'var(--border-soft)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#81c784', fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {item.location}
            </span>
          </div>
        </div>

        {item.speaker && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
            <div
              className="speaker-avatar"
              style={{ background: item.speaker.bgColor, color: item.speaker.textColor, width: '50px', height: '50px', fontSize: '18px', margin: 0, flexShrink: 0 }}
            >
              {item.speaker.initials}
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
