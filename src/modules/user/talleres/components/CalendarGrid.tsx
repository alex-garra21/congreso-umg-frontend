import React from 'react';
import { WorkshopCard } from './WorkshopCard';
import type { AgendaItem, Room } from '../../../../data/agendaData';

interface CalendarGridProps {
  rooms: Room[];
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
        gridTemplateRows: `60px repeat(${HOURS.length * 12}, var(--agenda-row-height, 14px))`
      }}>
        {/* Encabezados */}
        <div className="grid-header time-label" style={{
          gridRow: 1,
          gridColumn: 1,
          borderTopLeftRadius: '16px'
        }}>HORA</div>
        {rooms.map((room, idx) => {
          const colorTheme = roomColors[idx % roomColors.length];
          return (
            <div key={room.name} className="grid-header room-label" style={{
              gridRow: 1,
              gridColumn: idx + 2,
              backgroundColor: colorTheme.main,
              color: '#ffffff',
              borderTopRightRadius: idx === rooms.length - 1 ? '16px' : '0',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}>
              {room.name}
            </div>
          );
        })}

        {/* Líneas divisorias y fondos de columnas */}
        {rooms.map((_room, idx) => {
          const colorTheme = roomColors[idx % roomColors.length];
          return (
            <div key={`col-bg-${idx}`} className="column-grid-bg" style={{
              gridColumn: idx + 2,
              gridRow: `2 / span ${HOURS.length * 12}`,
              backgroundColor: colorTheme.bg,
              borderLeft: '1px solid var(--border-soft)',
              opacity: 0.5
            }}></div>
          );
        })}

        {/* Etiquetas de Horas y Medias Horas */}
        {HOURS.map(hour => (
          <React.Fragment key={`hour-label-group-${hour}`}>
            {/* Etiqueta de la hora en punto (MÁS GRANDE) */}
            <div className="hour-row-label" style={{ 
              gridRow: `${(hour - minHour) * 12 + 2} / span 6`,
              fontSize: '14px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              {hour > 12 ? `${hour - 12}:00` : `${hour}:00`}
            </div>
            {/* Etiqueta de la media hora (MÁS PEQUEÑA) */}
            <div className="hour-row-label" style={{ 
              gridRow: `${(hour - minHour) * 12 + 8} / span 6`, 
              color: 'var(--text-muted)', 
              opacity: 0.5,
              fontSize: '11px',
              fontWeight: 600
            }}>
              {hour > 12 ? `${hour - 12}:30` : `${hour}:30`}
            </div>
          </React.Fragment>
        ))}

        {/* Líneas Horizontales (Hora y Media Hora) */}
        {HOURS.map(hour => (
          <React.Fragment key={`line-group-${hour}`}>
            <div className="hour-grid-line" style={{ gridRow: (hour - minHour) * 12 + 2 }} />
            <div className="hour-grid-line" style={{ 
              gridRow: (hour - minHour) * 12 + 8, 
              borderTopStyle: 'dashed', 
              opacity: 0.4 
            }} />
          </React.Fragment>
        ))}

        {/* Tarjetas de Talleres */}
        {agenda.map((workshop: AgendaItem) => {
          const isGeneral = workshop.tag === 'GENERAL';
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
