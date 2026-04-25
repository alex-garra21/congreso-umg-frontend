import { agendaCompleta as initialAgenda, mockSpeakers as initialSpeakers, categoryStyles as initialCategories, initialRooms, type AgendaItem, type Speaker, type CategoryStyle } from '../data/agendaData';
export type { AgendaItem, Speaker, CategoryStyle };

const AGENDA_KEY = 'congreso_agenda';
const SPEAKERS_KEY = 'congreso_speakers';
const CATEGORIES_KEY = 'congreso_categories';

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

export function saveAgenda(agenda: AgendaItem[]) {
  localStorage.setItem(AGENDA_KEY, JSON.stringify(agenda));
  window.dispatchEvent(new Event('agendaUpdate'));
}

export function getSpeakers(): Speaker[] {
  const saved = localStorage.getItem(SPEAKERS_KEY);
  if (!saved) {
    localStorage.setItem(SPEAKERS_KEY, JSON.stringify(initialSpeakers));
    return initialSpeakers;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return initialSpeakers;
  }
}

export function saveSpeakers(speakers: Speaker[]) {
  localStorage.setItem(SPEAKERS_KEY, JSON.stringify(speakers));
  window.dispatchEvent(new Event('agendaUpdate'));
}

export function getCategories(): Record<string, CategoryStyle> {
  const saved = localStorage.getItem(CATEGORIES_KEY);
  if (!saved) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initialCategories));
    return initialCategories;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return initialCategories;
  }
}

export function saveCategories(categories: Record<string, CategoryStyle>) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event('agendaUpdate'));
}

const ROOMS_KEY = 'congreso_rooms';

export function getRooms(): string[] {
  const saved = localStorage.getItem(ROOMS_KEY);
  if (!saved) {
    // initialRooms importado desde agendaData, pero necesitamos añadirlo al import de la línea 1
    // lo definimos directamente aquí si falla el import, o podemos asegurarnos de que se importe
    const defaultRooms = ['SALA A', 'SALA B', 'SALA C', 'SALA D', 'SALA E', 'GENERAL'];
    localStorage.setItem(ROOMS_KEY, JSON.stringify(defaultRooms));
    return defaultRooms;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return ['SALA A', 'SALA B', 'SALA C', 'SALA D', 'SALA E', 'GENERAL'];
  }
}

export function saveRooms(rooms: string[]) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event('agendaUpdate'));
}
