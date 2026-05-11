import { type AgendaItem, type Speaker, type CategoryStyle } from '../data/agendaData';

export type { AgendaItem, Speaker, CategoryStyle };

export const generateSlug = (text: string) => {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};
