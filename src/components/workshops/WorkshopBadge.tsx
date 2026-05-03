import { useCategorias } from '../../api/hooks/useAgenda';

interface WorkshopBadgeProps {
  tag: string;
  className?: string;
}

export default function WorkshopBadge({ tag, className = "" }: WorkshopBadgeProps) {
  const { data: dynamicCategories = [] } = useCategorias();
  
  // Buscar el estilo en las categorías dinámicas (ahora es un array)
  const categoryData = dynamicCategories.find(c => c.name === tag);
  
  // Estilo por defecto si no se encuentra (Gris suave)
  const style = categoryData ? { bg: categoryData.bg, text: categoryData.text } : { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };

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
