export interface CategoryStyle {
  bg: string;
  text: string;
}

export const categoryStyles: Record<string, CategoryStyle> = {
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
}

export const mockSpeakers: Speaker[] = [
  {
    id: 1,
    name: "Dr. Carlos Méndez",
    initials: "CM",
    role: "Investigador — MIT",
    tag: "IA & Educación",
    bio: "Pionero en el uso de inteligencia artificial para personalizar métodos educativos en educación superior. Tiene más de 15 años de experiencia liderando proyectos intercontinentales.",
    bgColor: "#ffffff",
    textColor: "#01579b"
  },
  {
    id: 2,
    name: "Lic. Ana Ramírez",
    initials: "AR",
    role: "Directora — INCAE",
    tag: "Liderazgo",
    bio: "Especialista en desarrollo organizacional y liderazgo ágil corporativo. Ayudó a transformar la cultura de más de 50 empresas de Fortune 500 en Centroamérica.",
    bgColor: "#e8f5e9",
    textColor: "#2e7d32"
  },
  {
    id: 3,
    name: "Ing. Roberto Lima",
    initials: "RL",
    role: "Lead Engineer — Google",
    tag: "Transformación Digital",
    bio: "Ingeniero principal enfocado en la adopción de Cloud a escala global. Apasionado por democratizar el acceso a infraestructuras de alto rendimiento.",
    bgColor: "#f3e5f5",
    textColor: "#6a1b9a"
  },
  {
    id: 4,
    name: "Dra. María Fuentes",
    initials: "MF",
    role: "Investigadora — USAC",
    tag: "Innovación Social",
    bio: "Catedrática y autora de numerosos libros sobre el impacto de la tecnología en sociedades en vías de desarrollo. Creó el proyecto piloto 'RuralTech'.",
    bgColor: "#fff3e0",
    textColor: "#e65100"
  },
  {
    id: 5,
    name: "MSc. Javier Reyes",
    initials: "JR",
    role: "Data Scientist — Amazon",
    tag: "Big Data",
    bio: "Responsable de la arquitectura de datos para optimización logística regional. Imparte tutorías avanzadas en algoritmos predictivos.",
    bgColor: "#e0f7fa",
    textColor: "#006064"
  },
  {
    id: 6,
    name: "Licda. Sofía Castro",
    initials: "SC",
    role: "CEO — FinTech Hub",
    tag: "Blockchain",
    bio: "Fundadora de la primera red de microfinanzas descentralizadas de la región. Reconocida entre las 'Mujeres Tech' más influyentes de 2025.",
    bgColor: "#fce4ec",
    textColor: "#880e4f"
  },
  {
    id: 7,
    name: "Dr. Luis Ortega",
    initials: "LO",
    role: "Catedrático — Stanford",
    tag: "Ciberseguridad",
    bio: "Experto en ciber-resiliencia y criptografía cuántica. Ha asesorado a diversos gobiernos para la protección de infraestructuras críticas.",
    bgColor: "#eceff1",
    textColor: "#37474f"
  },
  {
    id: 8,
    name: "Ing. Beatriz Vargas",
    initials: "BV",
    role: "VP de Ingeniería — Meta",
    tag: "Realidad Mixta",
    bio: "Lidera el equipo principal de desarrollo de interfaces inmersivas. Está impulsando la próxima frontera sobre cómo interactuamos con el trabajo remoto.",
    bgColor: "#e8eaf6",
    textColor: "#283593"
  },
  {
    id: 9,
    name: "Dr. Eduardo Santos",
    initials: "ES",
    role: "Director — OEA",
    tag: "Políticas Públicas",
    bio: "Especialista en legislación tecnológica internacional y privacidad de datos. Busca el equilibrio entre innovación y derechos humanos en LATAM.",
    bgColor: "#fffde7",
    textColor: "#f57f17"
  },
  {
    id: 10,
    name: "MSc. Elena Navarro",
    initials: "EN",
    role: "Head of Design — Apple",
    tag: "UX/UI Design",
    bio: "Cuenta con múltiples premios internacionales de diseño de producto. Su filosofía es que la simplicidad resolverá la brecha digital mundial.",
    bgColor: "#fafafa",
    textColor: "#212121"
  },
  {
    id: 11,
    name: "Lic. Diego Herrera",
    initials: "DH",
    role: "Fundador — EcoStart",
    tag: "Sostenibilidad Tech",
    bio: "Emprendedor en serie creando software para monitorear el cambio climático. Cree fielmente en el software verde y arquitecturas eficientes.",
    bgColor: "#f1f8e9",
    textColor: "#33691e"
  },
  {
    id: 12,
    name: "Ing. Carmen Sosa",
    initials: "CS",
    role: "Arquitecta Cloud — Microsoft",
    tag: "DevOps & SRE",
    bio: "Maneja migraciones masivas para sistemas de salud críticos. Activista por la integración de más mujeres en sectores de soporte e ingeniería.",
    bgColor: "#e3f2fd",
    textColor: "#1565c0"
  }
];

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker?: Speaker;
  description: string;
  tag: string;
  period: 'Mañana' | 'Tarde';
  location: string;
}

export function generarAgenda(): AgendaItem[] {
  let charlas: AgendaItem[] = [];

  // Registro (Mañana)
  charlas.push({
    id: 'reg-manana',
    time: '8:00 AM',
    title: 'Registro y bienvenida',
    description: 'Entrega de gafetes, kits de bienvenida y validación de pagos QR en el lobby principal.',
    tag: 'General',
    period: 'Mañana',
    location: 'Lobby Principal'
  });

  const ponentes = [...mockSpeakers];
  const locations = ['Salón A', 'Salón B', 'Salón C', 'Auditorio'];

  // MAÑANA - 1 Charla por ponente (12 charlas, agrupadas de a 4 simultáneas)
  const morningTimes = ['9:00 AM', '10:00 AM', '11:00 AM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4);
    const locationIndex = i % 4;

    charlas.push({
      id: `m-${ponente.id}`,
      time: morningTimes[timeIndex],
      title: `${ponente.tag}: Conceptos Fundamentales`,
      speaker: ponente,
      description: `Una introducción profunda a los conceptos centrales de ${ponente.tag}. ${ponente.name} explicará las bases técnicas y cómo se aplican en la industria actual.`,
      tag: ponente.tag,
      period: 'Mañana',
      location: locations[locationIndex]
    });
  }

  // ALMUERZO (Tarde)
  charlas.push({
    id: 'almuerzo',
    time: '12:30 PM',
    title: 'Almuerzo y Networking',
    description: 'Descanso libre en el área de comedores del Campus Central para intercambiar ideas y socializar.',
    tag: 'Descanso',
    period: 'Tarde',
    location: 'Comedor General'
  });

  // TARDE BLOQUE 1 - 1 Charla por ponente (12 charlas, 4 simultáneas)
  const afternoonTimes1 = ['2:00 PM', '3:00 PM', '4:00 PM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4);
    const locationIndex = (i + 1) % 4;

    charlas.push({
      id: `t1-${ponente.id}`,
      time: afternoonTimes1[timeIndex],
      title: `${ponente.tag}: Casos Prácticos y Éxito`,
      speaker: ponente,
      description: `Aplicación en la vida real de ${ponente.tag}. ${ponente.name} presentará casos de éxito y retos experimentados en su rol como ${ponente.role}.`,
      tag: ponente.tag,
      period: 'Tarde',
      location: locations[locationIndex]
    });
  }

  // TARDE BLOQUE 2 - 1 Charla por ponente (12 charlas, 4 simultáneas)
  const afternoonTimes2 = ['5:00 PM', '6:00 PM', '7:00 PM'];
  for (let i = 0; i < 12; i++) {
    const ponente = ponentes[i];
    const timeIndex = Math.floor(i / 4);
    const locationIndex = (i + 2) % 4;

    charlas.push({
      id: `t2-${ponente.id}`,
      time: afternoonTimes2[timeIndex],
      title: `${ponente.tag}: Mitos, Futuro y Q&A`,
      speaker: ponente,
      description: `Discusión abierta sobre el futuro de ${ponente.tag}. Sesión interactiva de preguntas y respuestas entre el público y ${ponente.name}.`,
      tag: ponente.tag,
      period: 'Tarde',
      location: locations[locationIndex]
    });
  }

  // CIERRE (Tarde)
  charlas.push({
    id: 'cierre',
    time: '8:00 PM',
    title: 'Clausura del congreso',
    description: 'Palabras de cierre por el comité organizador, sorteos para los asistentes y despedida oficial del congreso.',
    tag: 'General',
    period: 'Tarde',
    location: 'Auditorio Principal'
  });

  return charlas;
}

export const agendaCompleta = generarAgenda();
