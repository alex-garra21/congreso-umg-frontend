export interface UserData {
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

  // Asegurar que exista un admin por defecto para pruebas
  const adminEmail = 'admin@miumg.edu.gt';
  if (!users.some(u => u.correo === adminEmail)) {
    users.push({
      nombres: 'Administrador',
      apellidos: 'Sistema',
      sexo: 'M',
      correo: adminEmail,
      contrasena: 'admin123',
      rol: 'admin'
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
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

export function loginUser(correo: string, contrasena: string): { success: boolean; message: string; user?: UserData } {
  const users = getRegisteredUsers();
  const user = users.find(u => u.correo === correo);

  if (!user) {
    return { success: false, message: 'El correo electrónico no está registrado.' };
  }

  if (user.contrasena !== contrasena) {
    return { success: false, message: 'Contraseña incorrecta.' };
  }

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
