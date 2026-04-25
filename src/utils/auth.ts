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
const TOKENS_KEY = 'congreso_tokens';

export function getTokens(): TokenData[] {
  const tokensStr = localStorage.getItem(TOKENS_KEY);
  if (!tokensStr) return [];
  try {
    const raw = JSON.parse(tokensStr);
    // Migración automática: si el token es un string, convertirlo a objeto
    return raw.map((t: any) => typeof t === 'string' ? { code: t, used: false } : t);
  } catch (e) {
    return [];
  }
}

export function generateToken(): string {
  const tokens = getTokens();
  const code = `CONG-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  tokens.push({ code, used: false });
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  return code;
}

export function deleteToken(code: string) {
  const tokens = getTokens();
  const filtered = tokens.filter(t => t.code !== code);
  localStorage.setItem(TOKENS_KEY, JSON.stringify(filtered));
}

export function validateToken(code: string): boolean {
  const tokens = getTokens();
  const token = tokens.find(t => t.code === code && !t.used);
  if (token) {
    token.used = true;
    token.usedBy = getCurrentUser()?.correo;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    return true;
  }
  return false;
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
    return { success: false, message: 'Error al obtener datos del perfil.' };
  }

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
    // ... mapear otros campos si es necesario
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

export function updateUserData(updatedData: UserData): { success: boolean; message: string } {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.correo === updatedData.correo);
  
  if (index !== -1) {
    if (!updatedData.contrasena) {
      updatedData.contrasena = users[index].contrasena;
    }
    
    users[index] = { ...users[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setCurrentUser(users[index]);
    return { success: true, message: 'Datos actualizados correctamente.' };
  }
  
  return { success: false, message: 'Error al actualizar: Usuario no encontrado.' };
}

export function changePassword(newPassword: string): { success: boolean; message: string } {
  const user = getCurrentUser();
  if (user) {
    user.contrasena = newPassword;
    return updateUserData(user);
  }
  return { success: false, message: 'No hay una sesión activa.' };
}

export function sendPaymentProofInSession() {
  const user = getCurrentUser();
  if (user) {
    user.pagoEnviado = true;
    updateUserData(user);
  }
}

export function validatePaymentInSession() {
  const user = getCurrentUser();
  if (user) {
    user.pagoValidado = true;
    updateUserData(user);
  }
}
