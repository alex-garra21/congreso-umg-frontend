import { useCategorias } from '../../api/hooks/useAgenda';
import { categoryStyles as fallbackStyles } from '../../data/agendaData';

interface WorkshopBadgeProps {
  tag: string;
  className?: string;
}

export default function WorkshopBadge({ tag, className = "" }: WorkshopBadgeProps) {
  const { data: dynamicCategories = {} } = useCategorias();
  const style = dynamicCategories[tag] || fallbackStyles[tag] || fallbackStyles['General'];

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
