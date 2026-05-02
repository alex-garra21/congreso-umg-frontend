import React from 'react';
import { WorkshopCard } from './WorkshopCard';
import type { AgendaItem } from '../../../../data/agendaData';

interface CalendarGridProps {
  rooms: string[];
  HOURS: number[];
  minHour: number;
  roomColors: any[];
  agenda: AgendaItem[];
  enrolledIds: string[];
  isConfirmed: boolean;
  isTimeCollision: (w: AgendaItem) => boolean;
  toggleEnroll: (w: AgendaItem) => void;
  getWorkshopStyles: (w: AgendaItem, isSelected: boolean) => React.CSSProperties;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  rooms,
  HOURS,
  minHour,
  roomColors,
  agenda,
  enrolledIds,
  isConfirmed,
  isTimeCollision,
  toggleEnroll,
  getWorkshopStyles
}) => {
  return (
    <div className={`calendar-container ${isConfirmed ? 'confirmed' : ''}`}>
      <div className="calendar-grid" style={{ 
        gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)`, 
        gridTemplateRows: `60px repeat(${HOURS.length * 2}, 40px)` 
      }}>
        {/* Encabezados */}
        <div className="grid-header time-label" style={{ gridRow: 1, gridColumn: 1, background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>HORA</div>
        {rooms.map((room, idx) => {
          const colorTheme = roomColors[idx % roomColors.length];
          return (
            <div key={room} className="grid-header room-label" style={{ 
              gridRow: 1, 
              gridColumn: idx + 2,
              backgroundColor: colorTheme.text,
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {room}
            </div>
          );
        })}

        {/* Líneas divisorias y fondos de columnas */}
        {rooms.map((_room, idx) => {
          const colorTheme = roomColors[idx % roomColors.length];
          return (
            <div key={`col-bg-${idx}`} className="column-grid-bg" style={{ 
              gridColumn: idx + 2, 
              gridRow: `2 / span ${HOURS.length * 2}`,
              backgroundColor: colorTheme.bg
            }}></div>
          );
        })}

        {/* Etiquetas de Horas */}
        {HOURS.map(hour => (
          <div key={hour} className="hour-row-label" style={{ gridRow: (hour - minHour) * 2 + 2 }}>
            {hour > 12 ? `${hour - 12}:00` : `${hour}:00`}
          </div>
        ))}

        {/* Líneas Horizontales */}
        {HOURS.map(hour => (
          <div key={`line-${hour}`} className="hour-grid-line" style={{ gridRow: (hour - minHour) * 2 + 2 }}></div>
        ))}

        {/* Tarjetas de Talleres */}
        {agenda.filter((w: AgendaItem) => w.speaker || w.room === 'GENERAL').map((workshop: AgendaItem) => {
          const isGeneral = workshop.room === 'GENERAL';
          const isSelected = enrolledIds.includes(workshop.id) || isGeneral;
          const isBlocked = !isSelected && (isTimeCollision(workshop) || isConfirmed);
          
          return (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              isSelected={isSelected}
              isBlocked={isBlocked}
              isGeneral={isGeneral}
              styles={getWorkshopStyles(workshop, isSelected)}
              onClick={() => toggleEnroll(workshop)}
            />
          );
        })}
      </div>
    </div>
  );
};
