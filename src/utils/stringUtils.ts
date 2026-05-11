/**
 * Utilidades para manipulación de strings y nombres.
 */

const ACADEMIC_TITLES = [
  'Ing.', 'Inga.', 'Lic.', 'Licda.', 'MA.', 'MSc.', 'Dr.', 'Dra.', 'Pgo.', 'Pga.', 'Arq.', 'Arqa.', 'PhD.',
  'PHD.', 'Phd.', 'Ph.D.', 'Ph.d.', 'Mtr.', 'Mtrda.', 'M.A.', 'M.Sc.', 'M.Sc.', 'M.Sc.', 'M.Eng.', 'M.Eng.',
  'Mgtr.', 'Mgtrda.', 'Prof.', 'Profra.', 'Sra.', 'Sr.', 'Srta.', 'Sra.', 'Sr.', 'Ma.', 'MSc.', 'MSc.', 'Ing. MA.'
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
