import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Stats() {
  const navigate = useNavigate();
  const statsData = [
    { n: '23', l: 'Mayo', link: null },
    { n: '12', l: 'Ponentes', link: '/ponentes' },
    { n: '30+', l: 'Charlas', link: '/agenda' },
    { n: '500+', l: 'Participantes', link: null },
    { n: 'QR', l: 'Control asistencia', link: null },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="stat"
          onClick={() => stat.link && navigate(stat.link)}
          style={{ cursor: stat.link ? 'pointer' : 'default' }}
        >
          <span className="stat-n">{stat.n}</span>
          <span className="stat-l">{stat.l}</span>
        </div>
      ))}
    </div>
  );
}