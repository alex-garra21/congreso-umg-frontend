import { supabase } from './supabase';
import type { AgendaItem, Speaker, CategoryStyle } from '../data/agendaData';
import { initialRooms, categoryStyles as initialCategories, mockSpeakers as initialSpeakers, agendaCompleta as initialAgenda } from '../data/agendaData';

// ==============================================
// 1. SALAS
// ==============================================
export async function getSalasCloud(): Promise<string[]> {
  const { data, error } = await supabase.from('salas').select('nombre');
  if (error || !data || data.length === 0) {
    // Si falla o está vacío, insertamos las por defecto
    const mapped = initialRooms.map(r => ({ nombre: r }));
    await supabase.from('salas').upsert(mapped);
    return initialRooms;
  }
  return data.map(d => d.nombre);
}

export async function saveSalasCloud(rooms: string[]): Promise<void> {
  // Primero obtenemos las actuales
  const { data: actuales } = await supabase.from('salas').select('nombre');
  const nombresActuales = actuales?.map(a => a.nombre) || [];
  
  // Encontramos las que hay que borrar
  const toDelete = nombresActuales.filter(n => !rooms.includes(n));
  if (toDelete.length > 0) {
    await supabase.from('salas').delete().in('nombre', toDelete);
  }
  
  // Insertamos/Upsertamos las nuevas
  const toInsert = rooms.map(r => ({ nombre: r }));
  await supabase.from('salas').upsert(toInsert);
}

// ==============================================
// 2. CATEGORIAS
// ==============================================
export async function getCategoriasCloud(): Promise<Record<string, CategoryStyle>> {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error || !data || data.length === 0) {
    const mapped = Object.entries(initialCategories).map(([nombre, style]) => ({
      nombre,
      bg_color: style.bg,
      text_color: style.text
    }));
    await supabase.from('categorias').upsert(mapped);
    return initialCategories;
  }
  
  const result: Record<string, CategoryStyle> = {};
  data.forEach(d => {
    result[d.nombre] = { bg: d.bg_color, text: d.text_color };
  });
  return result;
}

export async function saveCategoriasCloud(categories: Record<string, CategoryStyle>): Promise<void> {
  // 1. Obtener actuales
  const { data: actuales } = await supabase.from('categorias').select('nombre');
  const nombresActuales = actuales?.map(a => a.nombre) || [];
  const nuevosNombres = Object.keys(categories);
  
  // 2. Borrar las que ya no están
  const toDelete = nombresActuales.filter(n => !nuevosNombres.includes(n));
  if (toDelete.length > 0) {
    await supabase.from('categorias').delete().in('nombre', toDelete);
  }

  // 3. Upsertar
  const mapped = Object.entries(categories).map(([nombre, style]) => ({
    nombre,
    bg_color: style.bg,
    text_color: style.text
  }));
  await supabase.from('categorias').upsert(mapped);
}

// ==============================================
// 3. PONENTES
// ==============================================
export async function getPonentesCloud(): Promise<Speaker[]> {
  const { data, error } = await supabase.from('ponentes').select('*');
  if (error || !data || data.length === 0) {
    const mapped = initialSpeakers.map(s => ({
      id: s.id,
      nombre: s.name,
      cargo: s.role
    }));
    await supabase.from('ponentes').upsert(mapped);
    return initialSpeakers;
  }
  
  // Re-map to Speaker interface
  return data.map(d => {
    const defaultSpeaker = initialSpeakers.find(s => s.id === d.id) || initialSpeakers[0];
    return {
      ...defaultSpeaker,
      id: d.id,
      name: d.nombre,
      role: d.cargo
    };
  });
}

// ==============================================
// 4. CHARLAS (Agenda)
// ==============================================
export async function getCharlasCloud(): Promise<AgendaItem[]> {
  const { data, error } = await supabase.from('charlas').select(`
    *,
    ponentes (*)
  `);
  
  if (error || !data || data.length === 0) {
    // Si no hay datos, inicializamos con los de prueba
    await seedCharlas();
    return initialAgenda;
  }

  return data.map(d => {
    // Reconstruimos el objeto AgendaItem
    return {
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
        initials: d.ponentes.nombre.substring(0,2),
        tag: d.id_categoria || 'General',
        bio: '',
        bgColor: '#eee',
        textColor: '#333'
      } : undefined,
      period: d.hora_inicio.includes('AM') ? 'Mañana' : 'Tarde',
      location: d.sala || 'SALA GENERAL'
    };
  });
}

async function seedCharlas() {
  const mapped = initialAgenda.map(item => ({
    id: item.id,
    titulo: item.title,
    descripcion: item.description,
    id_categoria: item.tag,
    id_ponente: item.speaker?.id || null,
    sala: item.room,
    hora_inicio: item.time,
    hora_fin: item.endTime
  }));
  await supabase.from('charlas').upsert(mapped);
}

export async function saveAgendaCloud(agenda: AgendaItem[]): Promise<void> {
  // 1. Obtener actuales
  const { data: actuales } = await supabase.from('charlas').select('id');
  const idsActuales = actuales?.map(a => a.id) || [];
  const nuevosIds = agenda.map(a => a.id);

  // 2. Borrar las que ya no están
  const toDelete = idsActuales.filter(id => !nuevosIds.includes(id));
  if (toDelete.length > 0) {
    await supabase.from('charlas').delete().in('id', toDelete);
  }

  // 3. Upsertar
  const mapped = agenda.map(item => ({
    id: item.id,
    titulo: item.title,
    descripcion: item.description,
    id_categoria: item.tag,
    id_ponente: item.speaker?.id || null,
    sala: item.room,
    hora_inicio: item.time,
    hora_fin: item.endTime
  }));
  await supabase.from('charlas').upsert(mapped);
}
