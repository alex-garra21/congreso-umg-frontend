import { supabase } from '../../../utils/supabase';
import type { UserData } from '../../../utils/auth';

export async function registerUserMutation(user: UserData): Promise<{ success: boolean; message: string; userId?: string }> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.correo,
    password: user.contrasena,
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered')) {
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }
    if (authError.status === 422 && authError.message.toLowerCase().includes('password')) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
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
      diploma_editado: updatedData.diplomaEditado,
      avatar_url: updatedData.avatarUrl,
      limite_tokens: updatedData.limiteTokens
    })
    .eq('id', updatedData.id);

  return { success: !error, error };
}

export async function invalidatePaymentMutation(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('anular_pago_usuario', {
      p_user_id: userId
    });

    if (error) {
      console.error("Error RPC (anular_pago_usuario):", error);
      return { success: false, message: `Error al invalidar el pago: ${error.message}` };
    }

    return { success: true, message: 'Pago anulado y datos de usuario reseteados completamente.' };
  } catch (error: any) {
    console.error("Error crítico en invalidatePaymentMutation:", error);
    return { success: false, message: 'Error inesperado al procesar la invalidación.' };
  }
}

export async function adminValidateUserMutation(userId: string, adminId?: string): Promise<{ success: boolean; message: string }> {
  // Generar código tipo ADMIN-XXXX-XXXX-XXXX
  const genPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const adminCode = `ADMIN-${genPart()}-${genPart()}-${genPart()}`;

  try {
    const { error } = await supabase.rpc('admin_validar_usuario', {
      p_user_id: userId,
      p_admin_id: adminId,
      p_admin_code: adminCode
    });

    if (error) {
      console.error("Error RPC (admin_validar_usuario):", error);
      return { success: false, message: 'Error al procesar la validación administrativa.' };
    }

    return { success: true, message: `Pago validado con token: ${adminCode}` };
  } catch (err) {
    console.error("Error crítico en adminValidateUserMutation:", err);
    return { success: false, message: 'Error de conexión al validar usuario.' };
  }
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

export async function generateTokenMutation(code: string, adminId?: string): Promise<{ success: boolean; error?: any; message?: string }> {
  if (adminId) {
    // 1. Obtener datos del creador
    const { data: creator } = await supabase
      .from('usuarios')
      .select('rol, limite_tokens')
      .eq('id', adminId)
      .single();

    if (creator && creator.rol === 'colaborador') {
      // 2. Contar tokens ya creados por este colaborador
      const { count, error: countError } = await supabase
        .from('tokens_pago')
        .select('*', { count: 'exact', head: true })
        .eq('creado_por', adminId);

      if (countError) throw countError;

      // 3. Validar contra el límite
      if (count !== null && count >= (creator.limite_tokens || 0)) {
        return {
          success: false,
          message: `Has alcanzado tu límite de ${creator.limite_tokens} tokens. Contacta a un administrador.`
        };
      }
    }
  }

  const { error } = await supabase.from('tokens_pago').insert({
    codigo: code,
    creado_por: adminId
  });

  if (error) return { success: false, error };
  return { success: true };
}

export async function validateTokenMutation(code: string, userId: string): Promise<{ success: boolean; errorType?: 'not_found' | 'already_used' | 'already_paid' | 'error' }> {
  try {
    const { data, error } = await supabase.rpc('validar_token_pago', {
      p_codigo: code.trim(),
      p_user_id: userId
    });

    if (error) {
      console.error("Error RPC (validar_token_pago):", error);
      return { success: false, errorType: 'error' };
    }

    if (data === 'success') return { success: true };
    return { success: false, errorType: data as any };
  } catch (err) {
    console.error("Error crítico en validateTokenMutation:", err);
    return { success: false, errorType: 'error' };
  }
}

export async function resetDiplomaStatusMutation(userId: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('usuarios')
    .update({
      diploma_editado: false
    })
    .eq('id', userId);

  if (error) return { success: false, message: 'Error al resetear el estado del diploma.' };
  return { success: true, message: 'Se ha habilitado de nuevo la edición del diploma para el usuario.' };
}
