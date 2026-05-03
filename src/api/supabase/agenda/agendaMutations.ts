import { supabase } from '../../../utils/supabase';
import type { AgendaItem, Speaker, Category, Room } from '../../../data/agendaData';

/**
 * MUTATIONS - Escritura y modificación de datos de Agenda (Basado en IDs)
 */

export async function saveSalasMutation(rooms: Room[]): Promise<void> {
  const { data: actuales, error: fetchError } = await supabase.from('salas').select('id');
  if (fetchError) throw fetchError;

  const idsActuales = actuales?.map(a => a.id) || [];
  const maxId = idsActuales.length > 0 ? Math.max(...idsActuales) : 0;
  
  const nuevosIds = rooms.map(r => r.id).filter(id => id !== undefined && id > 0);

  // Borrar los que ya no existen en la lista
  const toDelete = idsActuales.filter(id => !nuevosIds.includes(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('salas').delete().in('id', toDelete);
    if (deleteError) throw deleteError;
  }

  // Asignar IDs a las nuevas salas que tienen id <= 0 o missing
  let nextId = maxId + 1;
  const mapped = rooms.map(r => {
    const finalId = (r.id && r.id > 0) ? r.id : nextId++;
    return {
      id: finalId,
      nombre: r.name,
      prioridad: r.priority 
    };
  });

  const { error: upsertError } = await supabase.from('salas').upsert(mapped);
  if (upsertError) throw upsertError;
}

export async function saveCategoriasMutation(categories: Category[]): Promise<void> {
  const { data: actuales, error: fetchError } = await supabase.from('categorias').select('id');
  if (fetchError) throw fetchError;

  const idsActuales = actuales?.map(a => a.id) || [];
  const maxId = idsActuales.length > 0 ? Math.max(...idsActuales) : 0;
  
  // Los nuevos IDs son aquellos que ya tienen un ID numérico válido > 0
  const nuevosIds = categories.map(c => c.id).filter(id => id !== undefined && id > 0);

  const toDelete = idsActuales.filter(id => !nuevosIds.includes(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('categorias').delete().in('id', toDelete);
    if (deleteError) throw deleteError;
  }

  // Asignar IDs a las nuevas categorías que tienen id <= 0 o missing
  let nextId = maxId + 1;
  const mapped = categories.map(c => {
    const finalId = (c.id && c.id > 0) ? c.id : nextId++;
    return {
      id: finalId,
      nombre: c.name,
      bg_color: c.bg,
      text_color: c.text
    };
  });

  const { error: upsertError } = await supabase.from('categorias').upsert(mapped);
  if (upsertError) {
    console.error("Payload enviado:", mapped);
    throw upsertError;
  }
}

export async function saveAgendaMutation(agenda: AgendaItem[]): Promise<void> {
  try {
    const { data: actuales, error: fetchError } = await supabase.from('charlas').select('id');
    if (fetchError) throw fetchError;

    const idsActuales = actuales?.map(a => a.id) || [];
    const nuevosIds = agenda.map(a => a.id);

    const toDelete = idsActuales.filter(id => !nuevosIds.includes(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from('charlas').delete().in('id', toDelete);
      if (deleteError) throw deleteError;
    }

    const mapped = agenda.map(item => ({
      id: item.id,
      titulo: item.title,
      descripcion: item.description,
      categoria_id: item.tagId, // Usamos ID numérico
      id_ponente: item.speaker?.id || null,
      sala_id: item.locationId,   // Usamos ID numérico
      hora_inicio: item.time,
      hora_fin: item.endTime,
      tiempo_gracia: item.gracePeriod || 10
    }));

    const { error: upsertError } = await supabase.from('charlas').upsert(mapped);
    if (upsertError) throw upsertError;
  } catch (err) {
    console.error("Error en saveAgendaMutation:", err);
    throw err;
  }
}

export async function savePonentesMutation(ponentes: Speaker[]): Promise<void> {
  const { data: actuales, error: fetchError } = await supabase.from('ponentes').select('id');
  if (fetchError) throw fetchError;

  const idsActuales = actuales?.map(a => a.id) || [];
  const nuevosIds = ponentes.map(p => p.id);

  const toDelete = idsActuales.filter(id => !nuevosIds.includes(id));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('ponentes').delete().in('id', toDelete);
    if (deleteError) throw deleteError;
  }

  const mapped = ponentes.map(p => ({
    id: p.id,
    nombre: p.name,
    cargo: p.role,
    bio: p.bio,
    avatar_url: p.avatar,
    bg_color: p.bgColor,
    text_color: p.textColor,
    tag: p.tag,
    redes_sociales: p.socialLinks || {}
  }));

  const { error: upsertError } = await supabase.from('ponentes').upsert(mapped);
  if (upsertError) throw upsertError;
}
