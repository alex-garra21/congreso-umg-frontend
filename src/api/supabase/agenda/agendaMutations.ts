import { supabase } from '../../../utils/supabase';
import type { AgendaItem, CategoryStyle, Speaker } from '../../../data/agendaData';

/**
 * MUTATIONS - Escritura y modificación de datos de Agenda
 */

export async function saveSalasMutation(rooms: string[]): Promise<void> {
  const { data: actuales, error: fetchError } = await supabase.from('salas').select('nombre');
  if (fetchError) throw fetchError;

  const nombresActuales = actuales?.map(a => a.nombre) || [];

  const toDelete = nombresActuales.filter(n => !rooms.includes(n));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('salas').delete().in('nombre', toDelete);
    if (deleteError) throw deleteError;
  }

  const toInsert = rooms.map(r => ({ nombre: r }));
  const { error: upsertError } = await supabase.from('salas').upsert(toInsert);
  if (upsertError) throw upsertError;
}

export async function saveCategoriasMutation(categories: Record<string, CategoryStyle>): Promise<void> {
  const { data: actuales, error: fetchError } = await supabase.from('categorias').select('nombre');
  if (fetchError) throw fetchError;

  const nombresActuales = actuales?.map(a => a.nombre) || [];
  const nuevosNombres = Object.keys(categories);

  const toDelete = nombresActuales.filter(n => !nuevosNombres.includes(n));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from('categorias').delete().in('nombre', toDelete);
    if (deleteError) throw deleteError;
  }

  const mapped = Object.entries(categories).map(([nombre, style]) => ({
    nombre,
    bg_color: style.bg,
    text_color: style.text
  }));
  const { error: upsertError } = await supabase.from('categorias').upsert(mapped);
  if (upsertError) throw upsertError;
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
      id_categoria: item.tag,
      id_ponente: item.speaker?.id || null,
      sala: item.room,
      hora_inicio: item.time,
      hora_fin: item.endTime,
      tiempo_gracia: item.gracePeriod || 10
    }));

    const { error: upsertError } = await supabase.from('charlas').upsert(mapped);
    if (upsertError) throw upsertError;

    console.log("Agenda sincronizada con la nube correctamente");
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
