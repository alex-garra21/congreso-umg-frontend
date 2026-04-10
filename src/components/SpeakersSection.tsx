

import SectionHeader from './SectionHeader';

const speakers = [
  { id: 1, initial: 'CM', avClass: 'av1', name: 'Dr. Carlos Méndez', role: 'Investigador — MIT', topic: 'IA & Educación' },
  { id: 2, initial: 'AR', avClass: 'av2', name: 'Lic. Ana Ramírez', role: 'Directora — INCAE', topic: 'Liderazgo' },
  { id: 3, initial: 'RL', avClass: 'av3', name: 'Ing. Roberto Lima', role: 'Lead Engineer — Google', topic: 'Transformación digital' },
  { id: 4, initial: 'MF', avClass: 'av4', name: 'Dra. María Fuentes', role: 'Investigadora — USAC', topic: 'Innovación social' },
];

export default function SpeakersSection() {
  return (
    <section className="sec" id="ponentes">
      <SectionHeader tag="Expertos" title="Ponentes invitados" />
      
      <div className="spk-grid">
        {speakers.map(spk => (
          <div key={spk.id} className="spk-card">
            <div className={`avatar ${spk.avClass}`}>{spk.initial}</div>
            <div className="spk-name">{spk.name}</div>
            <div className="spk-role">{spk.role}</div>
            <span className="spk-topic">{spk.topic}</span>
          </div>
        ))}
      </div>
    </section>
  );
}