import React from 'react';
import { useCategorias } from '../../api/hooks/useAgenda';

interface WorkshopBadgeProps {
  tag: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WorkshopBadge({ tag, className = "", style = {} }: WorkshopBadgeProps) {
  const { data: dynamicCategories = [] } = useCategorias();

  // Buscar el estilo en las categorías dinámicas
  const categoryData = dynamicCategories.find(c => c.name === tag);

  // Estilo por defecto si no se encuentra
  const defaultStyle = categoryData
    ? { bg: categoryData.bg, text: categoryData.text }
    : { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };

  const combinedStyle: React.CSSProperties = {
    background: defaultStyle.bg,
    color: defaultStyle.text,
    ...style
  };

  return (
    <span
      className={`tag-badge-small ${className}`}
      style={combinedStyle}
    >
      {tag}
    </span>
  );
}
