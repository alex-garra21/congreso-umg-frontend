import { type AgendaItem, type Category, type Speaker } from '../data/agendaData';

export type { AgendaItem, Speaker, Category };

export const generateSlug = (text: string) => {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};
