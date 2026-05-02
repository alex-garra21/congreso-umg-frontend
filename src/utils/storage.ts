import { supabase } from './supabase';

/**
 * Utilidad para subir archivos a Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    // 1. Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) throw uploadError;

    // 2. Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}


/**
 * Sube un avatar y devuelve su URL pública
 */
export async function uploadAvatar(userId: string, file: File, folder: 'users' | 'speakers' = 'users'): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  return uploadFile('avatars', filePath, file);
}

/**
 * Elimina un archivo del Storage de Supabase para liberar espacio
 */
export async function deleteFile(bucket: string, fullUrl: string): Promise<boolean> {
  try {
    // Extraer el path del archivo de la URL pública
    // Ejemplo: .../storage/v1/object/public/avatars/users/archivo.jpg -> users/archivo.jpg
    const urlParts = fullUrl.split(`${bucket}/`);
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
