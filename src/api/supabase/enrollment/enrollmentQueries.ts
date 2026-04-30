import { supabase } from '../../../utils/supabase';

/**
 * QUERIES - Lectura de inscripciones y asistencias
 */

export async function getEnrolledWorkshopsQuery(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('inscripciones_talleres')
    .select('id_charla')
    .eq('id_usuario', userId);
  
  if (error || !data) return [];
  return data.map(d => d.id_charla);
}

export async function getAttendancesQuery(userId: string): Promise<{ workshopId: string; timestamp: string }[]> {
  const { data, error } = await supabase
    .from('asistencias')
    .select('id_charla, fecha_hora')
    .eq('id_usuario', userId);
    
  if (error || !data) return [];
  return data.map(d => ({ workshopId: d.id_charla, timestamp: d.fecha_hora }));
}
