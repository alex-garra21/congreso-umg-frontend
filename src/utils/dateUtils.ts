/**
 * Utilidades para el manejo de fechas y zonas horarias.
 * Supabase almacena las fechas en UTC, y estas funciones ayudan a
 * visualizarlas en la zona horaria local del dispositivo del usuario.
 */

/**
 * Formatea una fecha (string ISO o Date) a un formato legible local.
 * Ejemplo: "28/04/2026, 11:30 AM"
 */
export const formatFullDate = (date: string | Date | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formatea solo la fecha.
 * Ejemplo: "28/04/2026"
 */
export const formatDateOnly = (date: string | Date | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea solo la hora.
 * Ejemplo: "11:30 AM"
 */
export const formatTimeOnly = (date: string | Date | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Verifica si una fecha está dentro de un rango local (inclusive).
 * Útil para filtrado en el frontend.
 */
export const isDateInRange = (date: string | Date, startDate?: string, endDate?: string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Caso 1: Ambos presentes -> Rango normal
  if (startDate && endDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    return d >= start && d <= end;
  }
  
  // Caso 2: Solo fecha inicio -> Ese día específico
  if (startDate && !endDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(startDate + 'T23:59:59');
    return d >= start && d <= end;
  }
  
  // Caso 3: Solo fecha fin -> Ese día específico
  if (!startDate && endDate) {
    const start = new Date(endDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    return d >= start && d <= end;
  }
  
  return true;
};
