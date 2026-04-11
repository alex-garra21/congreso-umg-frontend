export interface UserData {
  nombres: string;
  apellidos: string;
  talla: string;
  sexo: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  pagoValidado?: boolean;
  pagoEnviado?: boolean;
  tipoParticipante?: 'alumno' | 'externo';
  carnet?: string;
  ciclo?: string;
}

const STORAGE_KEY = 'congreso_users';
const SESSION_KEY = 'congreso_current_user';

export function getRegisteredUsers(): UserData[] {
  const usersStr = localStorage.getItem(STORAGE_KEY);
  if (!usersStr) return [];
  try {
    return JSON.parse(usersStr);
  } catch (e) {
    return [];
  }
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
