/**
 * Utilidades para la gestión de tiempos en el dashboard administrativo.
 * Centraliza la configuración de intervalos para mantener consistencia.
 */

export const TIME_INTERVAL = 15; // Valor por defecto

// Opciones disponibles para configurar en el frontend
export const AVAILABLE_INTERVALS = [
  { value: '5', label: '5 Minutos' },
  { value: '10', label: '10 Minutos' },
  { value: '15', label: '15 Minutos' },
  { value: '20', label: '20 Minutos' },
  { value: '25', label: '25 Minutos' },
  { value: '30', label: '30 Minutos' },
  { value: '35', label: '35 Minutos' },
  { value: '40', label: '40 Minutos' },
  { value: '45', label: '45 Minutos' },
  { value: '50', label: '50 Minutos' },
  { value: '55', label: '55 Minutos' },
  { value: '60', label: '1 Hora' }
];

export const generateTimeOptions = (interval: number = TIME_INTERVAL, includeAll = false) => {
  const options = [];

  if (includeAll) {
    options.push({ value: 'all', label: 'Cualquier hora' });
  }

  const safeInterval = interval <= 0 ? 15 : interval;

  for (let hour = 7; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += safeInterval) {
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const timeStr = `${displayHour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
      options.push({ value: timeStr, label: timeStr });
    }
  }
  return options;
};

/**
 * Convierte un string de hora "HH:mm AM/PM" a minutos totales desde medianoche.
 */
export const timeToMinutes = (t: string) => {
  if (!t || t === 'all') return 0;
  try {
    const parts = t.trim().split(' ');
    const timePart = parts[0];
    const modifier = parts[1] || (timePart.toUpperCase().includes('PM') ? 'PM' : 'AM');
    
    const cleanTime = timePart.toUpperCase().replace('AM', '').replace('PM', '');
    let [hours, minutes] = cleanTime.split(':').map(Number);
    
    if (isNaN(hours)) hours = 0;
    if (isNaN(minutes)) minutes = 0;

    if (hours === 12) {
      hours = modifier.toUpperCase() === 'PM' ? 12 : 0;
    } else if (modifier.toUpperCase() === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  } catch (e) {
    console.error('Error parsing time:', t, e);
    return 0;
  }
};

/**
 * Normaliza un string de hora para comparaciones robustas.
 */
export const normalizeTime = (t: string) => {
  if (!t) return '';
  return t.replace(/^0/, '').trim().toUpperCase();
};
