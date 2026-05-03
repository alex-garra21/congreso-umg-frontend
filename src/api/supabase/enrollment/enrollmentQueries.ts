import { supabase } from '../../../utils/supabase';

/**
 * QUERIES - Lectura de inscripciones y asistencias
 */

export async function getEnrolledWorkshopsQuery(userId: string): Promise<{ id: string, category: string }[]> {
  const { data, error } = await supabase
    .from('inscripciones_talleres')
    .select(`
      id_charla,
      charlas!id_charla (
        categoria_id,
        categorias!categoria_id (nombre)
      )
    `)
    .eq('id_usuario', userId);
  
  if (error || !data) return [];
  
  return data.map(d => {
    const charla = d.charlas as any;
    const categoria = charla?.categorias?.nombre || '';
    return {
      id: d.id_charla,
      category: categoria
    };
  });
}

export async function getAttendancesQuery(userId: string): Promise<{ workshopId: string; timestamp: string }[]> {
  const { data, error } = await supabase
    .from('asistencias')
    .select('id_charla, fecha_hora')
    .eq('id_usuario', userId);
    
  if (error || !data) return [];
  return data.map(d => ({ workshopId: d.id_charla, timestamp: d.fecha_hora }));
}
