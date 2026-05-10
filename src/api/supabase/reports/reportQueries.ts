import { supabase } from '../../../utils/supabase';
import type { UserData } from '../../../utils/auth';
import { getEnrolledWorkshopsQuery, getAttendancesQuery } from '../enrollment/enrollmentQueries';

/**
 * QUERIES - Reportes especializados para administración
 */

/**
 * Obtiene la lista completa de participantes para generar reportes y listas de diplomas.
 * Incluye a todos los usuarios (incluyendo administradores) pero excluye cuentas desactivadas.
 */
export async function getGeneralReportQuery(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('desactivado', false)
    .order('apellidos', { ascending: true });

  if (error || !data) return [];

  // Mapeamos y cargamos la información extendida (talleres y asistencias)
  const reportData = await Promise.all(data.map(async (userData) => {
    try {
      const talleres = await getEnrolledWorkshopsQuery(userData.id);
      const asistencias = await getAttendancesQuery(userData.id);
      
      // Si es admin, forzamos pagoValidado a true para evitar filtros accidentales
      const isActuallyPaid = userData.rol === 'admin' ? true : (userData.pago_validado || false);

      return {
        id: userData.id,
        nombres: userData.nombres || 'Usuario',
        apellidos: userData.apellidos || 'Sin Apellido',
        sexo: userData.sexo || 'M',
        correo: userData.correo || '',
        contrasena: 'auth_managed',
        rol: userData.rol as any,
        pagoValidado: isActuallyPaid,
        nombreDiploma: userData.nombre_diploma,
        tipoParticipante: userData.tipo_participante,
        carnet: userData.carnet,
        ciclo: userData.ciclo,
        telefono: userData.telefono,
        correoDiploma: userData.correo_diploma,
        desactivado: userData.desactivado || false,
        dpi: userData.dpi,
        codigoDocente: userData.codigo_docente,
        talleres,
        asistencias
      };
    } catch (e) {
      console.error("Error cargando usuario en reporte:", userData.id, e);
      return null;
    }
  }));

  // Filtramos nulos si hubo algún error catastrófico con un registro individual
  return reportData.filter(u => u !== null) as UserData[];
}
