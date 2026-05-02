import { useNavigate } from 'react-router-dom';
import CalendarLink from '../CalendarLink';

interface LandingStatCardProps {
  value: string;
  label: string;
  link?: string;
}

export const LandingStatCard: React.FC<LandingStatCardProps> = ({ value, label, link }) => {
  const navigate = useNavigate();
  const isCalendar = link === 'calendar';

  const innerContent = (
    <>
      <span className="stat-n">{value}</span>
      <span className="stat-l">{label}</span>
    </>
  );

  if (isCalendar) {
    return (
      <CalendarLink 
        className="stat" 
        style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        {innerContent}
      </CalendarLink>
    );
  }

  return (
    <div
      className="stat"
      onClick={() => link && navigate(link)}
      style={{ cursor: link ? 'pointer' : 'default' }}
    >
      {innerContent}
    </div>
  );
};
