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
  rol?: 'colaborador' | 'admin' | 'participante';
  talleres?: { id: string; category: string }[];
  diplomaEditado?: boolean;
  correoDiploma?: string;
  desactivado?: boolean;
  asistencias?: { workshopId: string; timestamp: string }[];
  dpi?: string;
  avatarUrl?: string;
  tokenCreatedBy?: string;
  codigoDocente?: string;
  limiteTokens?: number;
  tokensCreados?: number;
  alertaChoqueHorario?: boolean;
}

export const isStaff = (rol?: string) => rol === 'admin' || rol === 'colaborador';

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function validatePasswordStrength(password: string): { 
  isValid: boolean; 
  message: string;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    { id: 'length', label: '6 caracteres', met: password.length >= 6 },
    { id: 'uppercase', label: 'Mayúscula', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Minúscula', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Número', met: /[0-9]/.test(password) }
  ];

  const isValid = requirements.every(r => r.met);
  
  let message = '';
  if (!isValid) {
    const missing = requirements.find(r => !r.met);
    message = `La contraseña debe tener al menos ${missing?.label.toLowerCase()}.`;
  }

  return { isValid, message, requirements };
}

export interface TokenData {
  code: string;
  controlCode?: string;
  used: boolean;
  usedBy?: string;
  usedByName?: string;
  usedByType?: string;
  createdAt?: string;
  usedAt?: string;
  createdBy?: string;
  createdByName?: string;
  createdByRole?: 'admin' | 'colaborador' | 'participante';
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
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }

  // Obtener el perfil para saber el rol y otros datos
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authData.user?.id)
    .single();

  if (profile?.desactivado) {
    await supabase.auth.signOut();
    return { success: false, message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
  }

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: profile ? {
      id: profile.id,
      nombres: profile.nombres,
      apellidos: profile.apellidos,
      correo: profile.correo,
      rol: profile.rol,
      pagoValidado: profile.pago_validado,
      avatarUrl: profile.avatar_url,
      alertaChoqueHorario: profile.alerta_choque_horario
    } as UserData : undefined
  };
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  //Validación forzada antes de actualizar en el servidor remoto
  const validation = validatePasswordStrength(newPassword);
  if (!validation.isValid) {
    return { success: false, message: validation.message };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { success: false, message: 'No se pudo actualizar la contraseña. Inténtalo de nuevo.' };
  }
  return { success: true, message: 'Contraseña actualizada correctamente.' };
}

export async function verifyAndChangePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  // Obtener el usuario actual para tener su correo
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, message: 'No hay una sesión activa.' };

  // Verificar contraseña actual intentando hacer login
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (reauthError) {
    return { success: false, message: 'La contraseña anterior es incorrecta.' };
  }

  return changePassword(newPassword);
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    //Eliminación de console.error y ocultamiento de error.message
    return { success: false, message: 'Hubo un error al procesar la solicitud de recuperación.' };
  }
  return { success: true, message: 'Código enviado a tu correo' };
}


export async function resetPasswordWithOTP(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) return { success: false, message: 'Código inválido o expirado' };
  //Validación de fuerza de contraseña previa en la recuperación por OTP
  const validation = validatePasswordStrength(newPassword);
  if (!validation.isValid) {
    return { success: false, message: validation.message };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { success: false, message: 'Ocurrió un error al procesar el cambio de contraseña.' };
  }

  return { success: true, message: 'Contraseña actualizada con éxito' };
}
