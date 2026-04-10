import React from 'react';

export default function Stats() {
  const statsData = [
    { n: '3', l: 'Días' },
    { n: '12', l: 'Ponentes' },
    { n: '30+', l: 'Charlas' },
    { n: '500', l: 'Participantes' },
    { n: 'QR', l: 'Control asistencia' },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <div key={index} className="stat">
          <span className="stat-n">{stat.n}</span>
          <span className="stat-l">{stat.l}</span>
        </div>
      ))}
    </div>
  );
}