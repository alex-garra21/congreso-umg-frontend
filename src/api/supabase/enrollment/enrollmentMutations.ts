import { supabase } from '../../../utils/supabase';

/**
 * MUTATIONS - Escritura de inscripciones y asistencias
 */

export async function syncUserEnrollmentsMutation(userId: string, workshopIds: string[]): Promise<{ success: boolean; error?: any; message?: string }> {
  // 1. Obtener cupos y conteo actual de los talleres solicitados
  if (workshopIds.length > 0) {
    const { data: workshops, error: fetchError } = await supabase
      .from('charlas')
      .select('id, titulo, cupo_maximo, inscripciones:inscripciones_talleres(count)')
      .in('id', workshopIds);

    if (fetchError) throw fetchError;

    // 2. Obtener las inscripciones actuales del usuario para saber cuáles son "nuevas"
    const { data: currentEnrollments } = await supabase
      .from('inscripciones_talleres')
      .select('id_charla')
      .eq('id_usuario', userId);
    
    const currentIds = currentEnrollments?.map(e => e.id_charla) || [];

    // 3. Verificar si algún taller NUEVO ha alcanzado su límite
    for (const w of workshops || []) {
      const isNew = !currentIds.includes(w.id);
      const currentCount = (w.inscripciones as any)?.[0]?.count || 0;
      
      // Si es nuevo y tiene límite configurado (> 0) y ya está lleno
      if (isNew && w.cupo_maximo > 0 && currentCount >= w.cupo_maximo) {
        return { 
          success: false, 
          message: `El taller "${w.titulo}" ya no tiene cupos disponibles.` 
        };
      }
    }
  }

  // 4. Proceder con el reemplazo (como estaba antes)
  const { error: delError } = await supabase.from('inscripciones_talleres').delete().eq('id_usuario', userId);
  if (delError) return { success: false, error: delError };

  if (workshopIds.length > 0) {
    const toInsert = workshopIds.map(id => ({ id_usuario: userId, id_charla: id }));
    const { error: insError } = await supabase.from('inscripciones_talleres').insert(toInsert);
    if (insError) return { success: false, error: insError };
  }
  
  return { success: true };
}

export async function markAttendanceMutation(userId: string, workshopId: string): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase
    .from('asistencias')
    .insert({ id_usuario: userId, id_charla: workshopId });
    
  return { success: !error, error };
}

export async function resetUserWorkshopsMutation(userId: string): Promise<{ success: boolean; error?: any }> {
  // Borramos inscripciones y asistencias relacionadas
  const { error: delEnrollError } = await supabase
    .from('inscripciones_talleres')
    .delete()
    .eq('id_usuario', userId);

  if (delEnrollError) return { success: false, error: delEnrollError };

  const { error: delAttendError } = await supabase
    .from('asistencias')
    .delete()
    .eq('id_usuario', userId);

  return { success: !delAttendError, error: delAttendError };
}
