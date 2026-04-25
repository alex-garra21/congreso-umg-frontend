import { supabase } from './supabase';

export async function getEnrolledWorkshopsCloud(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('inscripciones_talleres')
    .select('id_charla')
    .eq('id_usuario', userId);
  
  if (error || !data) return [];
  return data.map(d => d.id_charla);
}

export async function syncUserEnrollmentsCloud(userId: string, workshopIds: string[]): Promise<{ success: boolean; error?: any }> {
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

export async function getAttendancesCloud(userId: string): Promise<{ workshopId: string; timestamp: string }[]> {
  const { data, error } = await supabase
    .from('asistencias')
    .select('id_charla, fecha_hora')
    .eq('id_usuario', userId);
    
  if (error || !data) return [];
  return data.map(d => ({ workshopId: d.id_charla, timestamp: d.fecha_hora }));
}

export async function markAttendanceCloud(userId: string, workshopId: string): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase
    .from('asistencias')
    .insert({ id_usuario: userId, id_charla: workshopId });
    
  return { success: !error, error };
}
