/**
 * Definiciones de tipos e interfaces para el módulo de Agenda.
 * Este archivo centraliza los modelos de datos utilizados tanto en el frontend 
 * como en la sincronización con Supabase.
 */

export interface CategoryStyle {
  bg: string;
  text: string;
}

/**
 * Estilos visuales por defecto para categorías.
 * Se usan como respaldo si una categoría no tiene estilos definidos en la base de datos.
 */
export const defaultCategoryStyles: Record<string, CategoryStyle> = {
  "IA & Educación": { bg: "rgba(1, 87, 155, 0.15)", text: "#01579b" },
  "Liderazgo": { bg: "rgba(46, 125, 50, 0.15)", text: "#2e7d32" },
  "Transformación Digital": { bg: "rgba(106, 27, 154, 0.15)", text: "#6a1b9a" },
  "Innovación Social": { bg: "rgba(230, 81, 0, 0.15)", text: "#e65100" },
  "Big Data": { bg: "rgba(0, 96, 100, 0.15)", text: "#006064" },
  "Blockchain": { bg: "rgba(136, 14, 79, 0.15)", text: "#880e4f" },
  "Ciberseguridad": { bg: "rgba(55, 71, 79, 0.15)", text: "#37474f" },
  "Realidad Mixta": { bg: "rgba(40, 53, 147, 0.15)", text: "#283593" },
  "Políticas Públicas": { bg: "rgba(245, 127, 23, 0.15)", text: "#f57f17" },
  "UX/UI Design": { bg: "rgba(33, 33, 33, 0.15)", text: "#212121" },
  "Sostenibilidad Tech": { bg: "rgba(51, 105, 30, 0.15)", text: "#33691e" },
  "DevOps & SRE": { bg: "rgba(21, 101, 192, 0.15)", text: "#1565c0" },
  "General": { bg: "rgba(107, 114, 128, 0.15)", text: "#374151" },
  "Descanso": { bg: "rgba(245, 158, 11, 0.15)", text: "#b45309" }
};

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
  time: string; // Formato "8:00 AM"
  endTime: string; // Formato "11:00 AM"
  title: string;
  speaker?: Speaker;
  description: string;
  tag: string;
  period: 'Mañana' | 'Tarde';
  location: string;
  room: string;
  date?: string; // Formato "YYYY-MM-DD"
  gracePeriod?: number; // Minutos de tolerancia
}

export interface Room {
  name: string;
  priority: number;
}
