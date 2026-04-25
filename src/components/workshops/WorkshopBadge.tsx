import { getCategories } from '../../utils/agendaStore';
import { categoryStyles as fallbackStyles } from '../../data/agendaData';

interface WorkshopBadgeProps {
  tag: string;
  className?: string;
}

export default function WorkshopBadge({ tag, className = "" }: WorkshopBadgeProps) {
  const dynamicCategories = getCategories();
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
