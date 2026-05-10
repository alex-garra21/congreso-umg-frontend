import { supabase } from '../../../utils/supabase';
import type { AgendaItem, Speaker, Category, Room } from '../../../data/agendaData';

/**
 * MUTATIONS - Escritura y modificación de datos de Agenda (Basado en IDs)
 */

export async function saveSalasMutation(rooms: Room[]): Promise<void> {
  const mapped = rooms.map(r => ({
    id: r.id,
    nombre: r.name,
    prioridad: r.priority 
  }));

  const { error } = await supabase.rpc('sincronizar_salas', { p_rooms: mapped });
  if (error) throw error;
}

export async function saveCategoriasMutation(categories: Category[]): Promise<void> {
  const mapped = categories.map(c => ({
    id: c.id,
    nombre: c.name,
    bg_color: c.bg,
    text_color: c.text
  }));

  const { error } = await supabase.rpc('sincronizar_categorias', { p_categorias: mapped });
  if (error) throw error;
}

export async function saveAgendaMutation(agenda: AgendaItem[]): Promise<void> {
  const mapped = agenda.map(item => ({
    id: item.id,
    titulo: item.title,
    descripcion: item.description,
    categoria_id: item.tagId,
    id_ponente: item.speaker?.id || null,
    sala_id: item.locationId,
    hora_inicio: item.time,
    hora_fin: item.endTime,
    tiempo_gracia: item.gracePeriod ?? 10,
    cupo_maximo: item.maxQuotas || 0,
    fecha: item.date
  }));

  const { error } = await supabase.rpc('sincronizar_charlas', { p_charlas: mapped });
  if (error) throw error;

  // Parche: Debido a que el RPC sincronizar_charlas podría no estar manejando la columna 'fecha',
  // realizamos una actualización manual para asegurar que la fecha se persista correctamente.
  for (const item of agenda) {
    if (item.date) {
      await supabase
        .from('charlas')
        .update({ fecha: item.date })
        .eq('id', item.id);
    }
  }
}

export async function savePonentesMutation(ponentes: Speaker[]): Promise<void> {
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

  const { error } = await supabase.rpc('sincronizar_ponentes', { p_ponentes: mapped });
  if (error) throw error;
}
