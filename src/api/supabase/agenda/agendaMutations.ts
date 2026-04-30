import { supabase } from '../../../utils/supabase';
import type { AgendaItem, CategoryStyle } from '../../../data/agendaData';

/**
 * MUTATIONS - Escritura y modificación de datos de Agenda
 */

export async function saveSalasMutation(rooms: string[]): Promise<void> {
  const { data: actuales } = await supabase.from('salas').select('nombre');
  const nombresActuales = actuales?.map(a => a.nombre) || [];
  
  const toDelete = nombresActuales.filter(n => !rooms.includes(n));
  if (toDelete.length > 0) {
    await supabase.from('salas').delete().in('nombre', toDelete);
  }
  
  const toInsert = rooms.map(r => ({ nombre: r }));
  await supabase.from('salas').upsert(toInsert);
}

export async function saveCategoriasMutation(categories: Record<string, CategoryStyle>): Promise<void> {
  const { data: actuales } = await supabase.from('categorias').select('nombre');
  const nombresActuales = actuales?.map(a => a.nombre) || [];
  const nuevosNombres = Object.keys(categories);
  
  const toDelete = nombresActuales.filter(n => !nuevosNombres.includes(n));
  if (toDelete.length > 0) {
    await supabase.from('categorias').delete().in('nombre', toDelete);
  }

  const mapped = Object.entries(categories).map(([nombre, style]) => ({
    nombre,
    bg_color: style.bg,
    text_color: style.text
  }));
  await supabase.from('categorias').upsert(mapped);
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
