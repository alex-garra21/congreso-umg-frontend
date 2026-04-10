import React, { useState } from 'react';
import SpeakerModal from '../components/SpeakerModal';

export interface Speaker {
  id: number;
  name: string;
  initials: string;
  role: string;
  tag: string;
  bio: string;
  bgColor: string;
  textColor: string;
  tagBgColor: string;
  tagTextColor: string;
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
    textColor: "#01579b", // azul oscuro
    tagBgColor: "rgba(1, 87, 155, 0.15)",
    tagTextColor: "#01579b"
  },
  {
    id: 2,
    name: "Lic. Ana Ramírez",
    initials: "AR",
    role: "Directora — INCAE",
    tag: "Liderazgo",
    bio: "Especialista en desarrollo organizacional y liderazgo ágil corporativo. Ayudó a transformar la cultura de más de 50 empresas de Fortune 500 en Centroamérica.",
    bgColor: "#e8f5e9", // verde claro
    textColor: "#2e7d32", // verde oscuro
    tagBgColor: "rgba(46, 125, 50, 0.15)",
    tagTextColor: "#2e7d32"
  },
  {
    id: 3,
    name: "Ing. Roberto Lima",
    initials: "RL",
    role: "Lead Engineer — Google",
    tag: "Transformación Digital",
    bio: "Ingeniero principal enfocado en la adopción de Cloud a escala global. Apasionado por democratizar el acceso a infraestructuras de alto rendimiento.",
    bgColor: "#f3e5f5", // morado claro
    textColor: "#6a1b9a", // morado oscuro
    tagBgColor: "rgba(106, 27, 154, 0.15)",
    tagTextColor: "#6a1b9a"
  },
  {
    id: 4,
    name: "Dra. María Fuentes",
    initials: "MF",
    role: "Investigadora — USAC",
    tag: "Innovación Social",
    bio: "Catedrática y autora de numerosos libros sobre el impacto de la tecnología en sociedades en vías de desarrollo. Creó el proyecto piloto 'RuralTech'.",
    bgColor: "#fff3e0", // naranja claro
    textColor: "#e65100", // naranja oscuro
    tagBgColor: "rgba(230, 81, 0, 0.15)",
    tagTextColor: "#e65100"
  },
  {
    id: 5,
    name: "MSc. Javier Reyes",
    initials: "JR",
    role: "Data Scientist — Amazon",
    tag: "Big Data",
    bio: "Responsable de la arquitectura de datos para optimización logística regional. Imparte tutorías avanzadas en algoritmos predictivos.",
    bgColor: "#e0f7fa", // cyan claro
    textColor: "#006064", // cyan oscuro
    tagBgColor: "rgba(0, 96, 100, 0.15)",
    tagTextColor: "#006064"
  },
  {
    id: 6,
    name: "Licda. Sofía Castro",
    initials: "SC",
    role: "CEO — FinTech Hub",
    tag: "Blockchain",
    bio: "Fundadora de la primera red de microfinanzas descentralizadas de la región. Reconocida entre las 'Mujeres Tech' más influyentes de 2025.",
    bgColor: "#fce4ec", // rosa claro
    textColor: "#880e4f", // rosa oscuro
    tagBgColor: "rgba(136, 14, 79, 0.15)",
    tagTextColor: "#880e4f"
  },
  {
    id: 7,
    name: "Dr. Luis Ortega",
    initials: "LO",
    role: "Catedrático — Stanford",
    tag: "Ciberseguridad",
    bio: "Experto en ciber-resiliencia y criptografía cuántica. Ha asesorado a diversos gobiernos para la protección de infraestructuras críticas.",
    bgColor: "#eceff1", // gris claro
    textColor: "#37474f", // gris oscuro
    tagBgColor: "rgba(55, 71, 79, 0.15)",
    tagTextColor: "#37474f"
  },
  {
    id: 8,
    name: "Ing. Beatriz Vargas",
    initials: "BV",
    role: "VP de Ingeniería — Meta",
    tag: "Realidad Mixta",
    bio: "Lidera el equipo principal de desarrollo de interfaces inmersivas. Está impulsando la próxima frontera sobre cómo interactuamos con el trabajo remoto.",
    bgColor: "#e8eaf6", // indigo claro
    textColor: "#283593", // indigo oscuro
    tagBgColor: "rgba(40, 53, 147, 0.15)",
    tagTextColor: "#283593"
  },
  {
    id: 9,
    name: "Dr. Eduardo Santos",
    initials: "ES",
    role: "Director — OEA",
    tag: "Políticas Públicas",
    bio: "Especialista en legislación tecnológica internacional y privacidad de datos. Busca el equilibrio entre innovación y derechos humanos en LATAM.",
    bgColor: "#fffde7", // amarillo claro
    textColor: "#f57f17", // amarillo oscurecido
    tagBgColor: "rgba(245, 127, 23, 0.15)",
    tagTextColor: "#f57f17"
  },
  {
    id: 10,
    name: "MSc. Elena Navarro",
    initials: "EN",
    role: "Head of Design — Apple",
    tag: "UX/UI Design",
    bio: "Cuenta con múltiples premios internacionales de diseño de producto. Su filosofía es que la simplicidad resolverá la brecha digital mundial.",
    bgColor: "#fafafa", // blanco/gris
    textColor: "#212121", // negro
    tagBgColor: "rgba(33, 33, 33, 0.15)",
    tagTextColor: "#212121"
  },
  {
    id: 11,
    name: "Lic. Diego Herrera",
    initials: "DH",
    role: "Fundador — EcoStart",
    tag: "Sostenibilidad Tech",
    bio: "Emprendedor en serie creando software para monitorear el cambio climático. Cree fielmente en el software verde y arquitecturas eficientes.",
    bgColor: "#f1f8e9", // lima clara
    textColor: "#33691e", // lima oscuro
    tagBgColor: "rgba(51, 105, 30, 0.15)",
    tagTextColor: "#33691e"
  },
  {
    id: 12,
    name: "Ing. Carmen Sosa",
    initials: "CS",
    role: "Arquitecta Cloud — Microsoft",
    tag: "DevOps & SRE",
    bio: "Maneja migraciones masivas para sistemas de salud críticos. Activista por la integración de más mujeres en sectores de soporte e ingeniería.",
    bgColor: "#e3f2fd", // azul claro
    textColor: "#1565c0", // azul fuerte
    tagBgColor: "rgba(21, 101, 192, 0.15)",
    tagTextColor: "#1565c0"
  }
];

export default function PonentesPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático copiado del Hero */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <span className="speakers-header-badge">Expertos</span>
          <h2>Ponentes invitados</h2>
        </div>

        <div className="speakers-grid">
          {mockSpeakers.map(speaker => (
            <div key={speaker.id} className="speaker-card" onClick={() => setSelectedSpeaker(speaker)}>
              <div
                className="speaker-avatar"
                style={{ background: speaker.bgColor, color: speaker.textColor }}
              >
                {speaker.initials}
              </div>
              <h3 className="speaker-name">{speaker.name}</h3>
              <p className="speaker-role">{speaker.role}</p>
              <span
                className="speaker-tag"
                style={{ background: speaker.tagBgColor, color: speaker.tagTextColor }}
              >
                {speaker.tag}
              </span>
            </div>
          ))}
        </div>

        <SpeakerModal
          isOpen={selectedSpeaker !== null}
          speaker={selectedSpeaker}
          onClose={() => setSelectedSpeaker(null)}
        />

      </div>
    </div>
  );
}