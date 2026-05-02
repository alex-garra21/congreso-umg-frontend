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
  // 1. Obtener el token vinculado antes de desvincular
  const { data: tokenData } = await supabase
    .from('tokens_pago')
    .select('codigo')
    .eq('usado_por', userId)
    .maybeSingle();

  // 2. Limpieza PROFUNDA de datos del usuario que dependen de pago
  const { error: userError } = await supabase
    .from('usuarios')
    .update({ 
      pago_validado: false, 
      pago_enviado: false,
      talleres: null,
      nombre_diploma: null,
      correo_diploma: null,
      diploma_editado: false
    })
    .eq('id', userId);

  if (userError) return { success: false, message: 'Error al invalidar el pago del usuario.' };

  // 3. Liberar cupos en talleres y borrar asistencias
  await supabase.from('inscripciones_talleres').delete().eq('id_usuario', userId);
  await supabase.from('asistencias').delete().eq('id_usuario', userId);

  // 4. Manejar el token (liberar o borrar)
  if (tokenData) {
    if (tokenData.codigo.startsWith('ADMIN-')) {
      await supabase.from('tokens_pago').delete().eq('codigo', tokenData.codigo);
    } else {
      await supabase
        .from('tokens_pago')
        .update({
          usado: false,
          usado_por: null,
          fecha_uso: null
        })
        .eq('codigo', tokenData.codigo);
    }
  }

  return { success: true, message: 'Pago anulado y datos de usuario reseteados completamente.' };
}

export async function adminValidateUserMutation(userId: string, adminId?: string): Promise<{ success: boolean; message: string }> {
  // Generar código tipo ADMIN-XXXX-XXXX-XXXX
  const genPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const adminCode = `ADMIN-${genPart()}-${genPart()}-${genPart()}`;

  // 1. Insertar el token marcado como usado
  const { error: tokenError } = await supabase.from('tokens_pago').insert({
    codigo: adminCode,
    usado: true,
    usado_por: userId,
    creado_por: adminId,
    fecha_uso: new Date().toISOString()
  });

  if (tokenError) return { success: false, message: 'Error al generar el token de auditoría.' };

  // 2. Validar el pago del usuario
  const { error: userError } = await supabase
    .from('usuarios')
    .update({ pago_validado: true })
    .eq('id', userId);

  if (userError) return { success: false, message: 'Error al validar el perfil del usuario.' };

  return { success: true, message: `Pago validado con token: ${adminCode}` };
}

export async function deleteTokenMutation(code: string): Promise<void> {
  // 1. Obtener información del token antes de borrarlo
  const { data: tokenData } = await supabase
    .from('tokens_pago')
    .select('usado, usado_por')
    .eq('codigo', code)
    .maybeSingle();

  // 2. Si estaba siendo usado, realizar limpieza profunda del usuario
  if (tokenData?.usado && tokenData.usado_por) {
    const userId = tokenData.usado_por;

    // Reset de tabla usuarios
    await supabase
      .from('usuarios')
      .update({ 
        pago_validado: false, 
        pago_enviado: false,
        talleres: null,
        nombre_diploma: null,
        correo_diploma: null,
        diploma_editado: false
      })
      .eq('id', userId);

    // Liberar cupos y borrar asistencias
    await supabase.from('inscripciones_talleres').delete().eq('id_usuario', userId);
    await supabase.from('asistencias').delete().eq('id_usuario', userId);
  }

  // 3. Borrar el token definitivamente
  await supabase.from('tokens_pago').delete().eq('codigo', code);
}

export async function generateTokenMutation(code: string, adminId?: string): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase.from('tokens_pago').insert({ 
    codigo: code,
    creado_por: adminId
  });
  return { success: !error, error };
}

export async function validateTokenMutation(code: string, userId: string): Promise<{ success: boolean; errorType?: 'not_found' | 'already_used' | 'already_paid' | 'error' }> {
  // 1. Verificar si el usuario ya está validado para no quemar tokens innecesarios
  const { data: userData } = await supabase
    .from('usuarios')
    .select('pago_validado')
    .eq('id', userId)
    .maybeSingle();

  if (userData?.pago_validado) return { success: false, errorType: 'already_paid' };

  // 2. Buscar el token
  const { data: tokenData, error: fetchError } = await supabase
    .from('tokens_pago')
    .select('*')
    .eq('codigo', code.trim())
    .maybeSingle();

  if (fetchError) return { success: false, errorType: 'error' };
  if (!tokenData) return { success: false, errorType: 'not_found' };
  if (tokenData.usado) return { success: false, errorType: 'already_used' };

  // 3. Intentar usar el token con condición de carrera (Race Condition prevention)
  const { error: updateError, count } = await supabase
    .from('tokens_pago')
    .update({
      usado: true,
      usado_por: userId,
      fecha_uso: new Date().toISOString()
    })
    .eq('codigo', tokenData.codigo)
    .eq('usado', false); // Solo si sigue sin usarse

  // Si no se actualizó ninguna fila, es porque alguien más lo usó justo antes
  if (updateError || count === 0) return { success: false, errorType: 'already_used' };

  // 4. Activar al usuario
  await supabase.from('usuarios').update({ pago_validado: true }).eq('id', userId);

  return { success: true };
}
