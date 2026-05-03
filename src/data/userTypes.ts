/**
 * Configuración centralizada de tipos de participantes
 * Si agregas un tipo aquí, se actualizará en los formularios y perfiles automáticamente.
 * Recuerda también agregarlo en Supabase con: ALTER TYPE tipo_participante ADD VALUE 'nuevo_id';
 */

export const PARTICIPANT_TYPES = [
  { 
    id: 'docente', 
    label: 'Docente UMG', 
    requiresAcademicInfo: true, 
    idLabel: 'Código docente', 
    requiresCiclo: false,
    idMaxLength: 6,
    showIdHelpText: false
  },
  { 
    id: 'alumno', 
    label: 'Alumno UMG', 
    requiresAcademicInfo: true, 
    idLabel: 'Carnet', 
    requiresCiclo: true,
    idMaxLength: 12, // Suficiente para el formato con guiones
    showIdHelpText: true
  },
  { 
    id: 'externo', 
    label: 'Participante Externo', 
    requiresAcademicInfo: false, 
    idLabel: 'ID', 
    requiresCiclo: false,
    idMaxLength: 15,
    showIdHelpText: false
  },
] as const;

export type ParticipantTypeId = 'docente' | 'alumno' | 'externo';

export const getParticipantLabel = (id?: string | null) => {
  if (!id) return 'Participante';
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.label : 'Participante';
};

export const getParticipantIdLabel = (id?: string | null) => {
  if (!id) return 'Carnet';
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.idLabel : 'Carnet';
};

export const getParticipantIdMaxLength = (id?: string | null) => {
  if (!id) return 15;
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.idMaxLength : 15;
};

export const showParticipantIdHelp = (id?: string | null) => {
  if (!id) return false;
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.showIdHelpText : false;
};

export const requiresAcademicInfo = (id?: string | null) => {
  if (!id) return false;
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.requiresAcademicInfo : false;
};

export const requiresCiclo = (id?: string | null) => {
  if (!id) return false;
  const type = PARTICIPANT_TYPES.find(t => t.id === id);
  return type ? type.requiresCiclo : false;
};

export const CICLOS = ['I', 'III', 'V', 'VII', 'IX', 'XI'] as const;
