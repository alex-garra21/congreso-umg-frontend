import React from 'react';
import { Icons } from '../../../../components/Icons';
import type { AgendaItem } from '../../../../data/agendaData';

interface WorkshopCardProps {
  workshop: AgendaItem;
  isSelected: boolean;
  isBlocked: boolean;
  isGeneral: boolean;
  styles: React.CSSProperties;
  onClick: () => void;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({
  workshop,
  isSelected,
  isBlocked,
  isGeneral,
  styles,
  onClick
}) => {
  return (
    <div 
      className={`calendar-workshop ${isSelected ? 'selected' : ''} ${isBlocked ? 'blocked' : ''} ${isGeneral ? 'mandatory' : ''}`}
      style={styles}
      onClick={onClick}
    >
      <div className="workshop-content">
        <span className="w-title">{workshop.title}</span>
        <span className="w-time">
          {workshop.time.replace(' AM', '').replace(' PM', '')} - {workshop.endTime.replace(' AM', '').replace(' PM', '')}
        </span>
        <span className="w-speaker">
          {isGeneral ? 'Actividad General' : (workshop.speaker?.name || 'General')}
        </span>
      </div>
      {isSelected && (
        <div className="selected-check">
          {isGeneral ? <Icons.Award size={12} strokeWidth={4} /> : <Icons.Check size={12} strokeWidth={4} />}
        </div>
      )}
    </div>
  );
};
