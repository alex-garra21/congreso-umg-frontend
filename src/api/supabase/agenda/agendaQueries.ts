import { supabase } from '../../../utils/supabase';
import type { AgendaItem, Speaker, Category, Room } from '../../../data/agendaData';

/**
 * QUERIES - Lectura de datos de Agenda con IDs
 */

export async function getSalasQuery(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('salas')
    .select('id, nombre, prioridad')
    .order('prioridad', { ascending: true });

  if (error) throw new Error(`Error al obtener salas: ${error.message}`);
  return (data || []).map(d => ({ 
    id: d.id, 
    name: d.nombre, 
    priority: d.prioridad 
  }));
}

export async function getCategoriasQuery(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, bg_color, text_color');

  if (error) throw new Error(`Error al obtener categorías: ${error.message}`);
  return (data || []).map(d => ({
    id: d.id,
    name: d.nombre,
    bg: d.bg_color,
    text: d.text_color
  }));
}

export async function getPonentesQuery(): Promise<Speaker[]> {
  const { data, error } = await supabase.from('ponentes').select('*');
  if (error) throw new Error(`Error al obtener ponentes: ${error.message}`);
  return (data || []).map(d => ({
    id: d.id,
    name: d.nombre,
    initials: d.nombre.substring(0, 2).toUpperCase(),
    role: d.cargo,
    tag: d.tag,
    bio: d.bio,
    bgColor: '#e6f1fb',
    textColor: '#0C447C',
    avatar: d.avatar_url,
    socialLinks: {}
  }));
}

export async function getCharlasQuery(): Promise<AgendaItem[]> {
  // Traemos las charlas con los IDs de sala y categoría
  const { data, error } = await supabase
    .from('charlas')
    .select(`
      id, titulo, descripcion, hora_inicio, hora_fin, periodo, 
      sala_id, categoria_id, id_ponente
    `);

  if (error) throw new Error(`Error al obtener charlas: ${error.message}`);

  // Nota: En una fase posterior podemos usar un JOIN real de SQL. 
  // Por ahora mapeamos los datos básicos.
  return (data || []).map(d => ({
    id: d.id,
    title: d.titulo,
    description: d.descripcion,
    time: d.hora_inicio,
    endTime: d.hora_fin,
    period: d.periodo as 'Mañana' | 'Tarde',
    locationId: d.sala_id,
    tagId: d.categoria_id,
    room: '', // Se llenará en el hook con el nombre real
    tag: ''   // Se llenará en el hook con el nombre real
  } as AgendaItem));
}

/**
 * MUTATIONS - Persistencia
 */

export async function saveSalasQuery(salas: Room[]) {
  // Con IDs, el UPSERT es más seguro que borrar todo
  const { error } = await supabase.from('salas').upsert(
    salas.map(s => ({ id: s.id || undefined, nombre: s.name, prioridad: s.priority }))
  );
  if (error) throw error;
}

export async function saveCategoriasQuery(categorias: Category[]) {
  const { error } = await supabase.from('categorias').upsert(
    categorias.map(c => ({ id: c.id || undefined, nombre: c.name, bg_color: c.bg, text_color: c.text }))
  );
  if (error) throw error;
}
