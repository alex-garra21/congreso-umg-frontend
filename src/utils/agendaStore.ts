import { agendaCompleta as initialAgenda, mockSpeakers as initialSpeakers, categoryStyles as initialCategories, initialRooms, type AgendaItem, type Speaker, type CategoryStyle } from '../data/agendaData';
import { getSalasCloud, saveSalasCloud, getCategoriasCloud, saveCategoriasCloud, getPonentesCloud, getCharlasCloud, saveAgendaCloud } from './supabaseAgenda';

export type { AgendaItem, Speaker, CategoryStyle };

export const generateSlug = (text: string) => {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const AGENDA_KEY = 'congreso_agenda';
const SPEAKERS_KEY = 'congreso_speakers';
const CATEGORIES_KEY = 'congreso_categories';
const ROOMS_KEY = 'congreso_rooms';

// Inicialización de la nube (Llamar al iniciar la app)
export async function syncFromCloud() {
  try {
    const [salas, categorias, ponentes, charlas] = await Promise.all([
      getSalasCloud(),
      getCategoriasCloud(),
      getPonentesCloud(),
      getCharlasCloud()
    ]);
    
    localStorage.setItem(ROOMS_KEY, JSON.stringify(salas));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categorias));
    localStorage.setItem(SPEAKERS_KEY, JSON.stringify(ponentes));
    localStorage.setItem(AGENDA_KEY, JSON.stringify(charlas));
    
    window.dispatchEvent(new Event('agendaUpdate'));
  } catch (error) {
    console.error("Error sincronizando desde la nube:", error);
  }
}

export function getAgenda(): AgendaItem[] {
  const saved = localStorage.getItem(AGENDA_KEY);
  if (!saved) {
    localStorage.setItem(AGENDA_KEY, JSON.stringify(initialAgenda));
    return initialAgenda;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return initialAgenda;
  }
}

export async function saveAgenda(agenda: AgendaItem[]) {
  // Primero a la nube
  await saveAgendaCloud(agenda);
  // Luego localmente
  localStorage.setItem(AGENDA_KEY, JSON.stringify(agenda));
  window.dispatchEvent(new Event('agendaUpdate'));
}

export function getSpeakers(): Speaker[] {
  const saved = localStorage.getItem(SPEAKERS_KEY);
  if (!saved) return initialSpeakers;
  try { return JSON.parse(saved); } catch (e) { return initialSpeakers; }
}

export async function saveSpeakers(speakers: Speaker[]) {
  localStorage.setItem(SPEAKERS_KEY, JSON.stringify(speakers));
  window.dispatchEvent(new Event('agendaUpdate'));
}

export function getCategories(): Record<string, CategoryStyle> {
  const saved = localStorage.getItem(CATEGORIES_KEY);
  if (!saved) return initialCategories;
  try { return JSON.parse(saved); } catch (e) { return initialCategories; }
}

export async function saveCategories(categories: Record<string, CategoryStyle>) {
  await saveCategoriasCloud(categories);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event('agendaUpdate'));
}

export function getRooms(): string[] {
  const saved = localStorage.getItem(ROOMS_KEY);
  if (!saved) return initialRooms;
  try { return JSON.parse(saved); } catch (e) { return initialRooms; }
}

export async function saveRooms(rooms: string[]) {
  await saveSalasCloud(rooms);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event('agendaUpdate'));
}
