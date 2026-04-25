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
  avatar?: string;
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
  time: string; // Start time format "8:00 AM"
  endTime: string; // End time format "11:00 AM"
  title: string;
  speaker?: Speaker;
  description: string;
  tag: string;
  period: 'Mañana' | 'Tarde';
  location: string;
  room: string;
}

export function generarAgenda(): AgendaItem[] {
  let charlas: AgendaItem[] = [];

  const getSpeaker = (id: number) => mockSpeakers.find(s => s.id === id);

  // MAÑANA
  const morningWorkshops = [
    // SALA A
    { id: 'm-ia', time: '8:00 AM', endTime: '11:00 AM', room: 'SALA A', speaker: getSpeaker(1), title: 'IA y educación', tag: 'IA & Educación' },
    { id: 'm-ciber', time: '11:00 AM', endTime: '1:00 PM', room: 'SALA A', speaker: getSpeaker(7), title: 'Ciberseguridad', tag: 'Ciberseguridad' },
    
    // SALA B
    { id: 'm-lider', time: '8:00 AM', endTime: '10:00 AM', room: 'SALA B', speaker: getSpeaker(2), title: 'Liderazgo universitario', tag: 'Liderazgo' },
    { id: 'm-empren', time: '10:00 AM', endTime: '1:00 PM', room: 'SALA B', speaker: getSpeaker(4), title: 'Emprendimiento social', tag: 'Innovación Social' },
    
    // SALA C
    { id: 'm-invest', time: '8:00 AM', endTime: '1:00 PM', room: 'SALA C', speaker: getSpeaker(4), title: 'Investigación científica', tag: 'Innovación Social' },
    
    // SALA D
    { id: 'm-uxui', time: '8:00 AM', endTime: '11:00 AM', room: 'SALA D', speaker: getSpeaker(10), title: 'Diseño UX/UI', tag: 'UX/UI Design' },
    { id: 'm-web', time: '11:00 AM', endTime: '1:00 PM', room: 'SALA D', speaker: getSpeaker(3), title: 'Desarrollo web', tag: 'Transformación Digital' },
    
    // SALA E
    { id: 'm-salud', time: '8:00 AM', endTime: '10:00 AM', room: 'SALA E', speaker: getSpeaker(11), title: 'Salud mental', tag: 'Sostenibilidad Tech' },
    { id: 'm-oratoria', time: '10:00 AM', endTime: '1:00 PM', room: 'SALA E', speaker: getSpeaker(9), title: 'Oratoria', tag: 'Políticas Públicas' },
  ];

  morningWorkshops.forEach(w => {
    charlas.push({
      ...w,
      description: `Taller intensivo sobre ${w.title}. Impartido por ${w.speaker?.name}.`,
      period: 'Mañana',
      location: w.room
    } as AgendaItem);
  });

  // ALMUERZO
  charlas.push({
    id: 'almuerzo',
    time: '1:00 PM',
    endTime: '2:00 PM',
    title: 'Receso y Networking',
    description: 'Descanso para intercambiar ideas.',
    tag: 'Descanso',
    period: 'Tarde',
    location: 'Comedor Central',
    room: 'GENERAL'
  });

  // TARDE
  const afternoonWorkshops = [
    // SALA A
    { id: 't-trans', time: '2:00 PM', endTime: '5:00 PM', room: 'SALA A', speaker: getSpeaker(3), title: 'Transformación digital', tag: 'Transformación Digital' },
    { id: 't-datos', time: '5:00 PM', endTime: '7:00 PM', room: 'SALA A', speaker: getSpeaker(5), title: 'Innovación en datos', tag: 'Big Data' },

    // SALA B
    { id: 't-agil', time: '2:00 PM', endTime: '4:00 PM', room: 'SALA B', speaker: getSpeaker(2), title: 'Gestión ágil', tag: 'Liderazgo' },
    { id: 't-finan', time: '4:00 PM', endTime: '7:00 PM', room: 'SALA B', speaker: getSpeaker(6), title: 'Finanzas personales', tag: 'Blockchain' },

    // SALA C
    { id: 't-redac', time: '2:00 PM', endTime: '4:00 PM', room: 'SALA C', speaker: getSpeaker(12), title: 'Redacción académica', tag: 'DevOps & SRE' },
    { id: 't-bioet', time: '4:00 PM', endTime: '7:00 PM', room: 'SALA C', speaker: getSpeaker(9), title: 'Bioética y tecnología', tag: 'Políticas Públicas' },

    // SALA D
    { id: 't-movil', time: '2:00 PM', endTime: '7:00 PM', room: 'SALA D', speaker: getSpeaker(8), title: 'Aplicaciones móviles', tag: 'Realidad Mixta' },

    // SALA E
    { id: 't-foto', time: '2:00 PM', endTime: '4:00 PM', room: 'SALA E', speaker: getSpeaker(10), title: 'Fotografía', tag: 'UX/UI Design' },
    { id: 't-digital', time: '4:00 PM', endTime: '7:00 PM', room: 'SALA E', speaker: getSpeaker(11), title: 'Arte digital', tag: 'Sostenibilidad Tech' },
  ];

  afternoonWorkshops.forEach(w => {
    charlas.push({
      ...w,
      description: `Continuación avanzada sobre ${w.title}. Impartido por ${w.speaker?.name}.`,
      period: 'Tarde',
      location: w.room
    } as AgendaItem);
  });

  return charlas;
}

export const agendaCompleta = generarAgenda();
