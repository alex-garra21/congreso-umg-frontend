import { supabase } from './supabase';

export interface UserData {
  id?: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  correo: string;
  contrasena: string;
  nombreDiploma?: string;
  telefono?: string;
  pagoValidado?: boolean;
  pagoEnviado?: boolean;
  tipoParticipante?: string;
  carnet?: string;
  ciclo?: string;
  rol?: 'usuario' | 'admin' | 'participante';
  talleres?: { id: string; category: string }[];
  diplomaEditado?: boolean;
  correoDiploma?: string;
  desactivado?: boolean;
  asistencias?: { workshopId: string; timestamp: string }[];
  dpi?: string;
  avatarUrl?: string;
}

export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número.' };
  }
  return { isValid: true, message: '' };
}

export interface TokenData {
  code: string;
  used: boolean;
  usedBy?: string;
  usedByName?: string;
  usedByType?: string;
  createdAt?: string;
  usedAt?: string;
  createdBy?: string;
  createdByName?: string;
}

/**
 * Lógica de Autenticación Centralizada
 * Nota: La mayoría de la gestión de estado ahora se maneja vía React Query (useAuth)
 */

export async function loginUser(correo: string, contrasena: string): Promise<{ success: boolean; message: string; user?: UserData }> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (authError) {
    const { data: profile } = await supabase.from('usuarios').select('id').eq('correo', correo).maybeSingle();
    if (!profile) {
      return { success: false, message: 'El correo electrónico no se encuentra registrado.' };
    } else {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }
  }

  // Obtener el perfil para saber el rol y otros datos
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authData.user?.id)
    .single();

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: profile ? {
      id: profile.id,
      nombres: profile.nombres,
      apellidos: profile.apellidos,
      correo: profile.correo,
      rol: profile.rol,
      pagoValidado: profile.pago_validado
    } as UserData : undefined
  };
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
  return { success: true, message: 'Contraseña actualizada correctamente.' };
}

export async function verifyAndChangePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  // 1. Obtener el usuario actual para tener su correo
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: 'No hay una sesión activa.' };

  // 2. Verificar contraseña actual intentando hacer login
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (reauthError) {
    return { success: false, message: 'La contraseña anterior es incorrecta.' };
  }

  // 3. Si es correcta, actualizar a la nueva
  return changePassword(newPassword);
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, message: `Error: ${error.message}` };
  return { success: true, message: 'Código enviado a tu correo' };
}

export async function resetPasswordWithOTP(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) return { success: false, message: 'Código inválido o expirado' };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { success: false, message: `Error: ${updateError.message}` };

  return { success: true, message: 'Contraseña actualizada con éxito' };
}
