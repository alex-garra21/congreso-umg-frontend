import type { Speaker } from '../pages/Ponentes';

interface SpeakerModalProps {
  speaker: Speaker | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpeakerModal({ speaker, isOpen, onClose }: SpeakerModalProps) {
  if (!isOpen || !speaker) return null;

  return (
    <div className="modal-bg open" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '600px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div
            className="speaker-avatar"
            style={{
              background: speaker.bgColor,
              color: speaker.textColor,
              flexShrink: 0,
              width: '90px',
              height: '90px',
              fontSize: '26px',
              margin: '0'
            }}
          >
            {speaker.initials}
          </div>

          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '4px' }}>{speaker.name}</h3>
            <p className="speaker-role" style={{ marginBottom: '8px' }}>{speaker.role}</p>
            <span
              className="speaker-tag"
              style={{ background: speaker.tagBgColor, color: speaker.tagTextColor }}
            >
              {speaker.tag}
            </span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-soft)', margin: '1.5rem 0' }}></div>

        <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>A cerca de {speaker.name}</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', whiteSpace: 'pre-line' }}>
          {speaker.bio}
        </p>
      </div>
    </div>
  );
}
