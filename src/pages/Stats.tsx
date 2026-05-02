import { LandingStatCard } from '../components/ui/LandingStatCard';

export default function Stats() {
  const statsData = [
    { n: '23', l: 'Mayo', link: 'calendar' },
    { n: '12', l: 'Ponentes', link: '/ponentes' },
    { n: '30+', l: 'Charlas', link: '/agenda' },
    { n: '500+', l: 'Participantes', link: '/participantes-info' },
    { n: 'QR', l: 'Control asistencia', link: '/asistencia-info' },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <LandingStatCard 
          key={index}
          value={stat.n}
          label={stat.l}
          link={stat.link}
        />
      ))}
    </div>
  );
}