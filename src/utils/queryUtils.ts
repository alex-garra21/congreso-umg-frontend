/**
 * Utilidades para configurar el comportamiento de React Query 
 * según el rol del usuario.
 */

export const getStaleTimeByRole = (rol?: string) => {
  if (!rol) return 1000 * 60 * 15; // 15 min por defecto para público/no logueado

  switch (rol) {
    case 'admin':
      return 1000 * 60 * 1; // 1 minuto (Alta frescura para gestión)
    case 'usuario':
      return 1000 * 60 * 5; // 5 minutos (Frescura media para personal)
    case 'participante':
      return 1000 * 60 * 15; // 15 minutos (Baja frescura para consulta)
    default:
      return 1000 * 60 * 5;
  }
};
