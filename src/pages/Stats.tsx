

import { useNavigate } from 'react-router-dom';
import CalendarLink from '../components/CalendarLink';

export default function Stats() {
  const navigate = useNavigate();
  const statsData = [
    { n: '23', l: 'Mayo', link: 'calendar' },
    { n: '12', l: 'Ponentes', link: '/ponentes' },
    { n: '30+', l: 'Charlas', link: '/agenda' },
    { n: '500+', l: 'Participantes', link: '/participantes-info' },
    { n: 'QR', l: 'Control asistencia', link: '/asistencia-info' },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => {
        const isCalendar = stat.link === 'calendar';

        
        const innerContent = (
          <>
            <span className="stat-n">{stat.n}</span>
            <span className="stat-l">{stat.l}</span>
          </>
        );

        if (isCalendar) {
          return (
            <CalendarLink 
              key={index} 
              className="stat" 
              style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              {innerContent}
            </CalendarLink>
          );
        }

        return (
          <div
            key={index}
            className="stat"
            onClick={() => stat.link && navigate(stat.link)}
            style={{ cursor: stat.link ? 'pointer' : 'default' }}
          >
            {innerContent}
          </div>
        );
      })}
    </div>
  );
}