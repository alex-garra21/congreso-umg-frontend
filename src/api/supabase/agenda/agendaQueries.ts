import { supabase } from '../../../utils/supabase';
import type { AgendaItem, Speaker, CategoryStyle } from '../../../data/agendaData';
import { initialRooms, categoryStyles as initialCategories } from '../../../data/agendaData';

/**
 * QUERIES - Lectura de datos de Agenda
 */

export async function getSalasQuery(): Promise<string[]> {
  const { data, error } = await supabase.from('salas').select('nombre');
  if (error || !data || data.length === 0) {
    return initialRooms;
  }
  return data.map(d => d.nombre);
}

export async function getCategoriasQuery(): Promise<Record<string, CategoryStyle>> {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error || !data || data.length === 0) {
    return initialCategories;
  }
  
  const result: Record<string, CategoryStyle> = {};
  data.forEach(d => {
    result[d.nombre] = { bg: d.bg_color, text: d.text_color };
  });
  return result;
}

export async function getPonentesQuery(): Promise<Speaker[]> {
  const { data, error } = await supabase.from('ponentes').select('*');
  if (error || !data || data.length === 0) {
    return [];
  }
  
  return data.map(d => ({
    id: d.id,
    name: d.nombre,
    role: d.cargo,
    initials: (d.nombre as string).split(' ').map((p: string) => p[0]).join('').substring(0, 2).toUpperCase(),
    tag: d.tag || 'General',
    bio: d.bio || '',
    bgColor: d.bg_color || '#e3f2fd',
    textColor: d.text_color || '#1565c0',
    avatar: d.avatar_url || undefined,
    socials: d.redes_sociales || []
  }));
}

export async function getCharlasQuery(): Promise<AgendaItem[]> {
  const { data, error } = await supabase.from('charlas').select(`
    *,
    ponentes (*)
  `);
  
  if (error || !data || data.length === 0) {
    return [];
  }

  return data.map(d => ({
    id: d.id,
    title: d.titulo,
    description: d.descripcion,
    time: d.hora_inicio,
    endTime: d.hora_fin,
    tag: d.id_categoria || 'General',
    room: d.sala || 'GENERAL',
    speaker: d.ponentes ? {
      id: d.ponentes.id,
      name: d.ponentes.nombre,
      role: d.ponentes.cargo,
      initials: (d.ponentes.nombre as string).split(' ').map((p: string) => p[0]).join('').substring(0, 2).toUpperCase(),
      tag: d.id_categoria || 'General',
      bio: d.ponentes.bio || '',
      bgColor: d.ponentes.bg_color || '#e3f2fd',
      textColor: d.ponentes.text_color || '#1565c0',
      avatar: d.ponentes.avatar_url || undefined,
      socials: d.ponentes.redes_sociales || []
    } : undefined,
    period: d.hora_inicio.includes('AM') ? 'Mañana' : 'Tarde',
    location: d.sala || 'SALA GENERAL',
    gracePeriod: d.tiempo_gracia || undefined
  }));
}
