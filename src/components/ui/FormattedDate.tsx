import React from 'react';
import { formatFullDate, formatDateOnly, formatTimeOnly } from '../../utils/dateUtils';

interface FormattedDateProps {
  date: string | Date | undefined;
  type?: 'full' | 'date' | 'time';
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Componente para mostrar fechas formateadas automáticamente
 * según la zona horaria del dispositivo del usuario.
 */
const FormattedDate: React.FC<FormattedDateProps> = ({ 
  date, 
  type = 'full', 
  style, 
  className 
}) => {
  if (!date) return <span style={style} className={className}>-</span>;

  let text = '';
  switch (type) {
    case 'date': text = formatDateOnly(date); break;
    case 'time': text = formatTimeOnly(date); break;
    default: text = formatFullDate(date);
  }

  return (
    <span style={style} className={className}>
      {text}
    </span>
  );
};

export default FormattedDate;
