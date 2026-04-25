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
  tipoParticipante?: 'alumno' | 'externo';
  carnet?: string;
  ciclo?: string;
  rol?: 'usuario' | 'admin';
  talleres?: string[];
  diplomaEditado?: boolean;
  correoDiploma?: string;
  desactivado?: boolean;
  asistencias?: { workshopId: string; timestamp: string }[];
}

export interface TokenData {
  code: string;
  used: boolean;
  usedBy?: string;
}

const STORAGE_KEY = 'congreso_users';
const SESSION_KEY = 'congreso_current_user';

export async function getTokens(): Promise<TokenData[]> {
  const { data, error } = await supabase
    .from('tokens_pago')
    .select(`
      codigo, 
      usado, 
      usado_por,
      usuarios (correo)
    `);
  if (error || !data) return [];

  return data.map(d => ({
    code: d.codigo,
    used: d.usado,
    usedBy: d.usuarios ? (d.usuarios as any).correo : undefined
  }));
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

    // Regla estricta: Nunca generar el código de ejemplo del placeholder
    if (code === PROHIBITED_CODE) continue;

    // Intentar insertarlo en Supabase
    const { error } = await supabase.from('tokens_pago').insert({ codigo: code });

    if (!error) {
      success = true; // Se insertó correctamente
    } else if (error.code !== '23505') {
      // 23505 es el código de Postgres para "llave duplicada" (colisión).
      // Si el error es otro (ej. sin internet), salimos del bucle para no quedarnos atrapados.
      console.error("Error inesperado al generar token:", error);
      break;
    }
  }

  return code;
}

export async function deleteToken(code: string): Promise<void> {
  await supabase.from('tokens_pago').delete().eq('codigo', code);
}

export async function validateToken(code: string): Promise<boolean> {
  const user = getCurrentUser();
  if (!user || !user.id) return false;

  // Verificar si existe y no está usado
  const { data, error } = await supabase
    .from('tokens_pago')
    .select('*')
    .eq('codigo', code)
    .eq('usado', false)
    .single();

  if (error || !data) return false;

  // Marcar como usado
  const { error: updateError } = await supabase
    .from('tokens_pago')
    .update({
      usado: true,
      usado_por: user.id,
      fecha_uso: new Date().toISOString()
    })
    .eq('codigo', code);

  if (updateError) return false;

  // Actualizar también al usuario
  await supabase.from('usuarios').update({ pago_validado: true }).eq('id', user.id);

  return true;
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
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('apellidos', { ascending: true });

  if (error || !data) return [];

  // Mapear los datos básicos
  const mappedUsers: UserData[] = data.map(userData => ({
    id: userData.id,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    sexo: userData.sexo || 'M',
    correo: userData.correo,
    contrasena: 'auth_managed',
    rol: userData.rol as any,
    pagoValidado: userData.pago_validado,
    nombreDiploma: userData.nombre_diploma,
    tipoParticipante: userData.tipo_participante,
    carnet: userData.carnet,
    ciclo: userData.ciclo,
    telefono: userData.telefono,
    correoDiploma: userData.correo_diploma,
    desactivado: userData.desactivado || false
  }));

  // Cargar talleres y asistencias para cada uno (esto es pesado pero necesario para el reporte)
  // Nota: En una app más grande esto se haría con un Join, pero para este congreso funciona bien así.
  const finalUsers = await Promise.all(mappedUsers.map(async (u) => {
    const talleres = await getEnrolledWorkshopsCloud(u.id!);
    const asistencias = await getAttendancesCloud(u.id!);
    return { ...u, talleres, asistencias };
  }));

  return finalUsers;
}

export function registerUser(user: UserData): { success: boolean; message: string } {
  const users = getRegisteredUsers();

  const exists = users.some(u => u.correo === user.correo);
  if (exists) {
    return { success: false, message: 'El correo electrónico ya está registrado.' };
  }

  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
}

import { getEnrolledWorkshopsCloud, getAttendancesCloud } from './supabaseEnrollment';

export async function loginUser(correo: string, contrasena: string): Promise<{ success: boolean; message: string; user?: UserData }> {
  // 1. Intentar Login en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (authError) {
    // Si falla Supabase, intentamos fallback a LocalStorage por si hay usuarios viejos
    const users = getRegisteredUsers();
    const localUser = users.find(u => u.correo === correo && u.contrasena === contrasena);

    if (localUser) {
      return { success: true, message: `Inicio de sesión exitoso (Local). ¡Bienvenido ${localUser.nombres}!`, user: localUser };
    }

    return { success: false, message: 'Credenciales inválidas o usuario no encontrado.' };
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
  const talleres = await getEnrolledWorkshopsCloud(userData.id);
  const asistencias = await getAttendancesCloud(userData.id);

  const user: UserData = {
    id: userData.id,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    sexo: userData.sexo || 'M',
    correo: userData.correo,
    contrasena: 'auth_managed',
    rol: userData.rol as any,
    pagoValidado: userData.pago_validado,
    nombreDiploma: userData.nombre_diploma,
    tipoParticipante: userData.tipo_participante,
    carnet: userData.carnet,
    ciclo: userData.ciclo,
    telefono: userData.telefono,
    talleres: talleres,
    asistencias: asistencias,
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
  if (updatedData.id) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nombres: updatedData.nombres,
        apellidos: updatedData.apellidos,
        pago_validado: updatedData.pagoValidado,
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

    if (error) {
      console.error("Error updating user in cloud:", error);
      return { success: false, message: 'Error al actualizar en la nube.' };
    }
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
  const user = getCurrentUser();
  if (user) {
    user.contrasena = newPassword;
    return await updateUserData(user);
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
