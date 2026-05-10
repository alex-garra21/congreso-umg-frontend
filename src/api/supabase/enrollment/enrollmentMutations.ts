import { supabase } from '../../../utils/supabase';

/**
 * MUTATIONS - Escritura de inscripciones y asistencias
 */

export async function syncUserEnrollmentsMutation(userId: string, workshopIds: string[]): Promise<{ success: boolean; error?: any; message?: string }> {
  try {
    const { data, error } = await supabase.rpc('sincronizar_inscripciones', {
      p_user_id: userId,
      p_workshop_ids: workshopIds
    });

    if (error) {
      console.error("Error RPC (sincronizar_inscripciones):", error);
      return { success: false, error };
    }

    if (data === 'success') {
      return { success: true };
    } else if (data.startsWith('full:')) {
      const workshopTitle = data.split(':')[1];
      return { 
        success: false, 
        message: `El taller "${workshopTitle}" ya no tiene cupos disponibles.` 
      };
    }

    return { success: false, message: 'Error desconocido al sincronizar inscripciones.' };
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
