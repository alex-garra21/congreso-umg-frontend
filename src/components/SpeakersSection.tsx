import SectionHeader from './SectionHeader';
import { usePonentes } from '../api/hooks/useAgenda';

export default function SpeakersSection() {
  const { data: speakers = [], isLoading } = usePonentes();

  if (isLoading) return null;

  return (
    <section className="sec" id="ponentes">
      <SectionHeader tag="Expertos" title="Ponentes invitados" />
      
      <div className="spk-grid">
        {speakers.map(spk => (
          <div key={spk.id} className="spk-card">
            <div 
              className="avatar" 
              style={{ backgroundColor: spk.bgColor, color: spk.textColor }}
            >
              {spk.initials}
            </div>
            <div className="spk-name">{spk.name}</div>
            <div className="spk-role">{spk.role}</div>
            <span className="spk-topic">{spk.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}