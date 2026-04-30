import { supabase } from './supabase';
import { getTokensQuery, getAllUsersQuery } from '../api/supabase/users/userQueries';
import { 
  registerUserMutation, 
  updateUserDataMutation, 
  invalidatePaymentMutation, 
  deleteTokenMutation, 
  generateTokenMutation, 
  validateTokenMutation 
} from '../api/supabase/users/userMutations';

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
  tipoParticipante?: 'alumno' | 'externo';
  carnet?: string;
  ciclo?: string;
  rol?: 'usuario' | 'admin';
  talleres?: string[];
  diplomaEditado?: boolean;
  correoDiploma?: string;
  desactivado?: boolean;
  asistencias?: { workshopId: string; timestamp: string }[];
  dpi?: string;
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

const STORAGE_KEY = 'congreso_users';
const SESSION_KEY = 'congreso_current_user';

export async function getTokens(): Promise<TokenData[]> {
  return getTokensQuery();
}

// Función auxiliar para generar bloques de caracteres aleatorios
function generateRandomBlock(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateToken(): Promise<string> {
  const PROHIBITED_CODE = 'C2026-aBcD-1xYz-9QkL';
  let code = '';
  let success = false;

  while (!success) {
    code = `C2026-${generateRandomBlock(4)}-${generateRandomBlock(4)}-${generateRandomBlock(4)}`;
    if (code === PROHIBITED_CODE) continue;

    const user = getCurrentUser();
    const result = await generateTokenMutation(code, user?.id);

    if (result.success) {
      success = true;
    } else if (result.error?.code !== '23505') {
      console.error("Error inesperado al generar token:", result.error);
      break;
    }
  }

  return code;
}

export async function deleteToken(code: string): Promise<void> {
  await deleteTokenMutation(code);
}

export async function validateToken(code: string): Promise<{ success: boolean; errorType?: 'not_found' | 'already_used' | 'error' }> {
  const user = getCurrentUser();
  if (!user || !user.id) return { success: false, errorType: 'error' };

  const result = await validateTokenMutation(code, user.id);
  return result;
}

export function getRegisteredUsers(): UserData[] {
  const usersStr = localStorage.getItem(STORAGE_KEY);
  let users: UserData[] = [];

  if (usersStr) {
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }
  }

  return users;
}

export async function getAllUsersCloud(): Promise<UserData[]> {
  return getAllUsersQuery();
}

export async function registerUser(user: UserData): Promise<{ success: boolean; message: string }> {
  const result = await registerUserMutation(user);
  
  if (result.success && result.userId) {
    const users = getRegisteredUsers();
    users.push({ ...user, id: result.userId });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  return { success: result.success, message: result.message };
}

import { getEnrolledWorkshopsQuery, getAttendancesQuery } from '../api/supabase/enrollment/enrollmentQueries';

export async function loginUser(correo: string, contrasena: string): Promise<{ success: boolean; message: string; user?: UserData }> {
  // 1. Intentar Login en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (authError) {
    // Diferenciar el error para guiar al usuario
    const { data: profile } = await supabase.from('usuarios').select('id').eq('correo', correo).maybeSingle();

    if (!profile) {
      return { success: false, message: 'El correo electrónico que has ingresado no se encuentra registrado en la plataforma. Por favor, crea una cuenta.' };
    } else {
      return { success: false, message: 'El correo o la contraseña que se han ingresado no son correctos. Por favor, verifica e intenta de nuevo.' };
    }
  }

  // 2. Si el login en Auth fue exitoso, obtener los datos del perfil de public.usuarios
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError || !userData) {
    console.error("Supabase Profile Error:", userError);
    return {
      success: false,
      message: `Error al obtener datos del perfil: ${userError?.message || 'Usuario no encontrado en la tabla'}`
    };
  }

  // 3. Obtener inscripciones y asistencias de la nube
  const talleres = await getEnrolledWorkshopsQuery(userData.id);
  const asistencias = await getAttendancesQuery(userData.id);

  const user: UserData = {
    id: userData.id,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    sexo: userData.sexo || 'M',
    correo: userData.correo,
    contrasena: 'auth_managed',
    rol: userData.rol as any,
    pagoValidado: userData.pago_validado,
    pagoEnviado: userData.pago_enviado,
    nombreDiploma: userData.nombre_diploma,
    tipoParticipante: userData.tipo_participante,
    carnet: userData.carnet,
    ciclo: userData.ciclo,
    telefono: userData.telefono,
    talleres: talleres,
    asistencias: asistencias,
    dpi: userData.dpi
  };

  return { success: true, message: `Inicio de sesión exitoso. ¡Bienvenido ${user.nombres}!`, user };
}

export function setCurrentUser(user: UserData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('sessionUpdate'));
}

export function getCurrentUser(): UserData | null {
  const userStr = localStorage.getItem(SESSION_KEY);
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr) as UserData & { nombre?: string };

    // Migración automática para datos de versiones previas
    if (user.nombre && !user.nombres) {
      const parts = user.nombre.trim().split(' ');
      user.nombres = parts[0] || '';
      user.apellidos = parts.slice(1).join(' ') || '';
    }

    return user;
  } catch (e) {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export async function updateUserData(updatedData: UserData): Promise<{ success: boolean; message: string }> {
  // 1. Actualizar en Supabase
  const result = await updateUserDataMutation(updatedData);
  if (!result.success) {
    console.error("Error updating user in cloud:", result.error);
    if (result.error?.code === '23505') {
      return { success: false, message: 'Este DPI ya está registrado por otro participante.' };
    }
    return { success: false, message: 'Error al actualizar en la nube.' };
  }

  // 2. Sincronización Local (MUY IMPORTANTE)
  // Actualizar el objeto en el almacenamiento local para que la UI se refresque
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.correo === updatedData.correo);

  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  // Actualizar la sesión actual
  const current = getCurrentUser();
  if (current && current.correo === updatedData.correo) {
    const finalData = { ...current, ...updatedData };
    localStorage.setItem(SESSION_KEY, JSON.stringify(finalData));
    // Disparar evento para que otros componentes se enteren
    window.dispatchEvent(new Event('sessionUpdate'));
  }

  return { success: true, message: 'Datos actualizados correctamente.' };
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  // Actualizar contraseña en Supabase Auth
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Error changing password in Supabase:", error);
    return { success: false, message: `Error al cambiar contraseña: ${error.message}` };
  }

  // Fallback local (para mantener el almacenamiento local sincronizado)
  const user = getCurrentUser();
  if (user) {
    user.contrasena = newPassword;

    // Solo actualizar localStorage, ya no enviamos la contraseña al UPDATE de public.usuarios
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.correo === user.correo);
    if (index !== -1) {
      users[index] = { ...users[index], contrasena: newPassword };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('sessionUpdate'));
    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }

  return { success: false, message: 'No hay una sesión activa.' };
}

export async function sendPaymentProofInSession() {
  const user = getCurrentUser();
  if (user) {
    user.pagoEnviado = true;
    await updateUserData(user);
  }
}

export async function validatePaymentInSession() {
  const user = getCurrentUser();
  if (user) {
    user.pagoValidado = true;
    await updateUserData(user);
  }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    console.error("Error sending reset email:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
  return { success: true, message: 'Código enviado a tu correo' };
}

export async function resetPasswordWithOTP(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  // Primero verificamos el OTP
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery'
  });

  if (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: 'Código inválido o expirado' };
  }

  // Si el OTP es válido, la sesión se establece automáticamente temporalmente.
  // Procedemos a actualizar la contraseña.
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    console.error("Error updating password:", updateError);
    return { success: false, message: `Error al actualizar: ${updateError.message}` };
  }

  // Actualizamos también el localStorage si el usuario existía allí
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.correo === email);
  if (index !== -1) {
    users[index].contrasena = newPassword;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  return { success: true, message: 'Contraseña actualizada con éxito' };
}

export async function invalidatePayment(userId: string): Promise<{ success: boolean; message: string }> {
  return invalidatePaymentMutation(userId);
}
