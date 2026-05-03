import { type AgendaItem } from '../../data/agendaData';
import WorkshopBadge from './WorkshopBadge';

interface WorkshopCardProps {
  workshop: AgendaItem;
  isSelected?: boolean;
  isConfirmed?: boolean;
  isPaid?: boolean;
  showOccupied?: boolean;
  onToggle?: (workshop: AgendaItem) => void;
  readOnly?: boolean; // Nuevo prop para modo informativo
}

export default function WorkshopCard({
  workshop,
  isSelected = false,
  isConfirmed = false,
  isPaid = false,
  showOccupied = false,
  onToggle,
  readOnly = false
}: WorkshopCardProps) {
  return (
    <div
      className={`workshop-card-compact ${isSelected ? 'enrolled' : ''} ${showOccupied ? 'blocked' : ''} ${readOnly ? 'read-only' : ''}`}
    >
      <div className="card-body-compact">
        <div className="card-header-compact">
          <WorkshopBadge tag={workshop.tag} />
          {isSelected && <span className="enrolled-status">✓ INSCRITO</span>}
        </div>

        <h3 className="workshop-title-small">{workshop.title}</h3>
        
        <div className="card-info-compact">
          <p className="workshop-speaker-small">Con {workshop.speaker?.name}</p>
          <p className="location-small">📍 {workshop.room} {workshop.time && `· ${workshop.time}`}</p>
        </div>

        {!readOnly && !isConfirmed && onToggle && (
          <button
            className={`enroll-btn-small ${isSelected ? 'active' : ''} ${!isPaid ? 'disabled' : ''} ${showOccupied ? 'collision' : ''}`}
            onClick={() => onToggle(workshop)}
            disabled={!isPaid}
          >
            {isSelected ? 'Quitar' : (showOccupied ? 'Ocupado' : 'Inscribirse')}
          </button>
        )}
      </div>
    </div>
  );
}
