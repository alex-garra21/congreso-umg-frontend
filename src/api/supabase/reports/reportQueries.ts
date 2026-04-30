import { supabase } from '../../../utils/supabase';
import type { UserData } from '../../../utils/auth';
import { getEnrolledWorkshopsQuery, getAttendancesQuery } from '../enrollment/enrollmentQueries';

/**
 * QUERIES - Reportes especializados para administración
 */

/**
 * Obtiene la lista completa de participantes para generar reportes y listas de diplomas.
 * Excluye a los administradores y usuarios desactivados por defecto para el reporte.
 */
export async function getGeneralReportQuery(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .neq('rol', 'admin')
    .order('apellidos', { ascending: true });

  if (error || !data) return [];

  // Mapeamos y cargamos la información extendida (talleres y asistencias)
  const reportData = await Promise.all(data.map(async (userData) => {
    const talleres = await getEnrolledWorkshopsQuery(userData.id);
    const asistencias = await getAttendancesQuery(userData.id);
    
    return {
      id: userData.id,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      sexo: userData.sexo || 'M',
      correo: userData.correo,
      contrasena: 'auth_managed',
      rol: userData.rol as any,
      pagoValidado: userData.pago_validado,
      nombreDiploma: userData.nombre_diploma,
      tipoParticipante: userData.tipo_participante,
      carnet: userData.carnet,
      ciclo: userData.ciclo,
      telefono: userData.telefono,
      correoDiploma: userData.correo_diploma,
      desactivado: userData.desactivado || false,
      dpi: userData.dpi,
      talleres,
      asistencias
    };
  }));

  return reportData;
}
