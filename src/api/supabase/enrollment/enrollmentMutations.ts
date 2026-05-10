import { supabase } from '../../../utils/supabase';

/**
 * MUTATIONS - Escritura de inscripciones y asistencias
 */

export async function syncUserEnrollmentsMutation(userId: string, workshopIds: string[]): Promise<{ success: boolean; error?: any; message?: string }> {
  try {
    // 1. Limpiamos las inscripciones actuales del usuario
    const { error: deleteError } = await supabase
      .from('inscripciones_talleres')
      .delete()
      .eq('id_usuario', userId);

    if (deleteError) {
      console.error("Error al limpiar inscripciones previas:", deleteError);
      return { success: false, error: deleteError };
    }

    // 2. Si no hay talleres que inscribir, terminamos con éxito
    if (workshopIds.length === 0) return { success: true };

    // 3. Preparamos las nuevas inserciones
    const newEnrollments = workshopIds.map(id => ({
      id_usuario: userId,
      id_charla: id
    }));

    // 4. Insertamos las nuevas inscripciones
    const { error: insertError } = await supabase
      .from('inscripciones_talleres')
      .insert(newEnrollments);

    if (insertError) {
      console.error("Error al insertar nuevas inscripciones:", insertError);
      return { success: false, error: insertError, message: 'No se pudieron registrar los talleres. Verifica la disponibilidad.' };
    }

    return { success: true };
  } catch (err) {
    console.error("Error crítico en syncUserEnrollmentsMutation:", err);
    return { success: false, message: 'Error de red al sincronizar inscripciones.' };
  }
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
