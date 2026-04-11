import { categoryStyles } from '../../data/agendaData';

interface WorkshopBadgeProps {
  tag: string;
  className?: string; // Permitir clases personalizadas (ej: para la página de ponentes)
}

export default function WorkshopBadge({ tag, className = "" }: WorkshopBadgeProps) {
  const style = categoryStyles[tag] || categoryStyles['General'];

  return (
    <span 
      className={`tag-badge-small ${className}`}
      style={{ 
        background: style.bg, 
        color: style.text 
      }}
    >
      {tag}
    </span>
  );
}
