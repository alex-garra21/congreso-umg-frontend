export interface UserData {
  nombre: string;
  talla: string;
  sexo: string;
  correo: string;
  contrasena: string;
}

const STORAGE_KEY = 'congreso_users';

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

  // Check if email already exists
  const exists = users.some(u => u.correo === user.correo);
  if (exists) {
    return { success: false, message: 'El correo electrónico ya está registrado.' };
  }

  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

  // Opcional: También podríamos descargar este JSON como un archivo .txt en el navegador 
  // si realmente se quiere un archivo físico, pero localStorage es mejor para pruebas.

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

  return { success: true, message: 'Inicio de sesión exitoso. ¡Bienvenido ' + user.nombre + '!', user };
}
