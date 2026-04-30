import { supabase } from '../../../utils/supabase';

/**
 * MUTATIONS - Escritura de inscripciones y asistencias
 */

export async function syncUserEnrollmentsMutation(userId: string, workshopIds: string[]): Promise<{ success: boolean; error?: any }> {
  // Primero borramos todas
  const { error: delError } = await supabase.from('inscripciones_talleres').delete().eq('id_usuario', userId);
  if (delError) return { success: false, error: delError };

  // Luego insertamos la lista actual
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
