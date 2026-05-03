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
      <div className="workshop-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', pointerEvents: 'none' }}>
        <div className="w-time">
          <Icons.Clock size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {workshop.time.replace(' AM', '').replace(' PM', '')} - {workshop.endTime.replace(' AM', '').replace(' PM', '')}
        </div>
        
        <div className="w-title">{workshop.title}</div>
        
        <div className="w-speaker">
          {isGeneral ? (
            <Icons.Star size={11} strokeWidth={3} />
          ) : (
            <Icons.User size={11} />
          )}
          <span>{isGeneral ? 'Actividad General' : (workshop.speaker?.name || 'Ponente por definir')}</span>
        </div>
      </div>
      
      {isSelected && (
        <div className="selected-check">
          {isGeneral ? <Icons.Award size={14} strokeWidth={3} /> : <Icons.Check size={14} strokeWidth={3} />}
        </div>
      )}
    </div>
  );
};
