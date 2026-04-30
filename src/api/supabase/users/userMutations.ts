import { supabase } from '../../../utils/supabase';
import type { UserData } from '../../../utils/auth';

/**
 * MUTATIONS - Escritura y acciones de usuarios y tokens
 */

export async function registerUserMutation(user: UserData): Promise<{ success: boolean; message: string; userId?: string }> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.correo,
    password: user.contrasena,
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.status === 422) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }
    return { success: false, message: `Error: ${authError.message}` };
  }

  if (!authData.user) return { success: false, message: 'No se pudo crear el usuario.' };

  const { error: profileError } = await supabase.from('usuarios').insert({
    id: authData.user.id,
    nombres: user.nombres,
    apellidos: user.apellidos,
    sexo: user.sexo,
    correo: user.correo,
    contrasena: 'auth_managed',
    rol: 'participante',
    pago_validado: false,
    tipo_participante: user.tipoParticipante,
    carnet: user.carnet,
    ciclo: user.ciclo,
    desactivado: false,
    dpi: user.dpi
  });

  if (profileError) {
    return { success: false, message: `Error de perfil: ${profileError.message}` };
  }

  return { success: true, message: 'Registro exitoso.', userId: authData.user.id };
}

export async function updateUserDataMutation(updatedData: UserData): Promise<{ success: boolean; error?: any }> {
  if (!updatedData.id) return { success: false };

  const { error } = await supabase
    .from('usuarios')
    .update({
      nombres: updatedData.nombres,
      apellidos: updatedData.apellidos,
      pago_validado: updatedData.pagoValidado,
      pago_enviado: updatedData.pagoEnviado,
      dpi: updatedData.dpi,
      rol: updatedData.rol,
      desactivado: updatedData.desactivado,
      nombre_diploma: updatedData.nombreDiploma,
      tipo_participante: updatedData.tipoParticipante,
      carnet: updatedData.carnet,
      ciclo: updatedData.ciclo,
      telefono: updatedData.telefono,
      correo_diploma: updatedData.correoDiploma,
      diploma_editado: updatedData.diplomaEditado
    })
    .eq('id', updatedData.id);

  return { success: !error, error };
}

export async function invalidatePaymentMutation(userId: string): Promise<{ success: boolean; message: string }> {
  const { error: userError } = await supabase
    .from('usuarios')
    .update({ pago_validado: false })
    .eq('id', userId);

  if (userError) return { success: false, message: 'Error al invalidar el pago.' };

  await supabase
    .from('tokens_pago')
    .update({
      usado: false,
      usado_por: null,
      fecha_uso: null
    })
    .eq('usado_por', userId);

  return { success: true, message: 'Pago anulado correctamente.' };
}

export async function deleteTokenMutation(code: string): Promise<void> {
  await supabase.from('tokens_pago').delete().eq('codigo', code);
}

export async function generateTokenMutation(code: string, adminId?: string): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase.from('tokens_pago').insert({ 
    codigo: code,
    creado_por: adminId
  });
  return { success: !error, error };
}

export async function validateTokenMutation(code: string, userId: string): Promise<{ success: boolean; errorType?: 'not_found' | 'already_used' | 'error' }> {
  const { data: tokenData, error: fetchError } = await supabase
    .from('tokens_pago')
    .select('*')
    .eq('codigo', code.trim())
    .maybeSingle();

  if (fetchError) return { success: false, errorType: 'error' };
  if (!tokenData) return { success: false, errorType: 'not_found' };
  if (tokenData.usado) return { success: false, errorType: 'already_used' };

  const { error: updateError } = await supabase
    .from('tokens_pago')
    .update({
      usado: true,
      usado_por: userId,
      fecha_uso: new Date().toISOString()
    })
    .eq('codigo', tokenData.codigo);

  if (updateError) return { success: false, errorType: 'error' };

  await supabase.from('usuarios').update({ pago_validado: true }).eq('id', userId);

  return { success: true };
}
