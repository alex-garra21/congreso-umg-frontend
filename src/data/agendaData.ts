/**
 * Definiciones de tipos e interfaces para el módulo de Agenda.
 * Sistema con referencias por ID para máxima integridad.
 */

export interface Category {
  id: number;
  name: string;
  bg: string;
  text: string;
}

export interface Speaker {
  id: number;
  name: string;
  initials: string;
  role: string;
  tag: string;
  bio: string;
  bgColor: string;
  textColor: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
}

export interface AgendaItem {
  id: string;
  time: string;
  endTime: string;
  title: string;
  speaker?: Speaker;
  description: string;
  tagId: number;
  tagName?: string;
  tag: string;           // Nombre de la categoría
  tagStyle?: { bg: string; text: string }; // Estilo visual enriquecido
  period: 'Mañana' | 'Tarde';
  locationId: number;
  roomName?: string;
  room: string;          // Nombre de la sala
  date?: string;
  gracePeriod?: number;
}

export interface Room {
  id: number;
  name: string;
  priority: number;
}
