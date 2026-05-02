import SectionHeader from './SectionHeader';
import { usePonentes } from '../api/hooks/useAgenda';
import { Icons } from './Icons';

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
              {spk.avatar ? (
                <img src={spk.avatar} alt={spk.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                spk.initials
              )}
            </div>
            <div className="spk-name">{spk.name}</div>
            <div className="spk-role">{spk.role}</div>

            {spk.socialLinks && Object.values(spk.socialLinks).some(link => link) && (
              <div className="spk-card-socials" onClick={(e) => e.stopPropagation()}>
                {spk.socialLinks.facebook && (
                  <a href={spk.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Facebook">
                    <Icons.Facebook size={14} color="var(--text-secondary)" />
                  </a>
                )}
                {spk.socialLinks.instagram && (
                  <a href={spk.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">
                    <Icons.Instagram size={14} color="var(--text-secondary)" />
                  </a>
                )}
                {spk.socialLinks.tiktok && (
                  <a href={spk.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="TikTok">
                    <Icons.TikTok size={14} color="var(--text-secondary)" />
                  </a>
                )}
                {spk.socialLinks.x && (
                  <a href={spk.socialLinks.x} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="X (Twitter)">
                    <Icons.TwitterX size={14} color="var(--text-secondary)" />
                  </a>
                )}
                {spk.socialLinks.linkedin && (
                  <a href={spk.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-link" title="LinkedIn">
                    <Icons.LinkedIn size={14} color="var(--text-secondary)" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}