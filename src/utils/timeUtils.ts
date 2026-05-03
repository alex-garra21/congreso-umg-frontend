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

  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const timeStr = `${displayHour < 10 ? '0' : ''}${displayHour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
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
  const [time, modifier] = t.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (hours === 12) {
    hours = modifier === 'PM' ? 12 : 0;
  } else if (modifier === 'PM') {
    hours += 12;
  }
  return hours * 60 + minutes;
};

/**
 * Normaliza un string de hora para comparaciones robustas.
 */
export const normalizeTime = (t: string) => {
  if (!t) return '';
  return t.replace(/^0/, '').trim().toUpperCase();
};
