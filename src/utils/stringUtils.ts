/**
 * Utilidades para manipulación de strings y nombres.
 */

/** Nombre para reportes/diplomas: siempre MAYÚSCULAS (locale español). */
export function toReportUppercase(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleUpperCase('es');
}

const ACADEMIC_TITLES = [
  'Ing.', 'Inga.', 'Lic.', 'Licda.', 'MA.', 'MSc.', 'Dr.', 'Dra.', 'Pgo.', 'Pga.', 'Arq.', 'Arqa.', 'PhD.',
  'Mtr.', 'Mtrda.', 'M.A.', 'M.Sc.', 'M.Sc.', 'M.Sc.', 'M.Eng.', 'M.Eng.',
  'Mgtr.', 'Mgtrda.', 'Prof.', 'Profra.', 'Sra.', 'Sr.', 'Srta.', 'Sra.', 'Sr.', 'Ing. MA.',
  'Lcda.', 'Lc.', 'Ing MSC.',
];

/**
 * Obtiene las iniciales de un nombre, ignorando títulos académicos.
 * Ejemplo: "Ing. Josué De León" -> "JD"
 */
export function getInitials(fullName: string): string {
  if (!fullName) return '??';

  // 1. Limpiar el nombre de títulos (insensible a mayúsculas/minúsculas)
  let cleanName = fullName.trim();

  for (const title of ACADEMIC_TITLES) {
    const regex = new RegExp(`^${title.replace('.', '\\.')}\\s+`, 'i');
    if (regex.test(cleanName)) {
      cleanName = cleanName.replace(regex, '');
      break; // Solo quitamos el primer título encontrado
    }
  }

  // 2. Obtener las iniciales de los dos primeros nombres/apellidos restantes
  const parts = cleanName.split(/\s+/).filter(p => p.length > 0);

  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Genera el nombre sugerido para el diploma del participante, aplicando reglas de 25 caracteres.
 */
export function getDiplomaSuggestedName(nombres: string, apellidos: string): string {
  const cleanNombres = (nombres || '').trim().toUpperCase();
  const cleanApellidos = (apellidos || '').trim().toUpperCase();
  const fullName = `${cleanNombres} ${cleanApellidos}`.trim();

  // Caso Base: Menor o igual a 25 caracteres
  if (fullName.length <= 25) {
    return fullName;
  }

  // Segmentar nombres y apellidos en palabras
  const namesArray = cleanNombres.split(/\s+/);
  const surnamesArray = cleanApellidos.split(/\s+/);
  const firstName = namesArray[0] || '';

  // Restricción 1: Primer nombre + Todos los apellidos
  const firstAndAllSurnames = `${firstName} ${cleanApellidos}`.trim();
  if (firstAndAllSurnames.length <= 25) {
    return firstAndAllSurnames;
  }

  // Restricción 2: Primer nombre + Apellidos completos que entren
  let result = firstName;
  
  // Caso borde: Si el primer nombre por sí solo mide más de 25 caracteres
  if (result.length > 25) {
    return result.substring(0, 25);
  }

  for (const surname of surnamesArray) {
    const candidate = `${result} ${surname}`.trim();
    if (candidate.length <= 25) {
      result = candidate;
    } else {
      break;
    }
  }

  return result;
}

