import React from 'react';

interface LocationLinkProps {
  variant?: 'banner' | 'simple';
  className?: string;
  children?: React.ReactNode;
  disableEmoji?: boolean;
}

export const MAPS_URL = 'https://maps.app.goo.gl/drwTJp68mjcYne5S9';
export const LOCATION_NAME = 'Hotel Alcazar doña Victoria, Cobán';
export const EVENT_DATE = '23 de mayo, 2026';

const LocationLink: React.FC<LocationLinkProps> = ({ variant = 'simple', className = '', children, disableEmoji = false }) => {
  const handleClick = () => {
    window.open(MAPS_URL, '_blank');
  };

  if (variant === 'banner') {
    return (
      <div 
        className={`info-banner ${className}`} 
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <span className="banner-icon">📍</span>
        <div className="banner-text">
          <h3>{LOCATION_NAME.split(',')[0]} — {EVENT_DATE}</h3>
          <p>{LOCATION_NAME} · Clic para ver ubicación</p>
        </div>
      </div>
    );
  }

  return (
    <a 
      href={MAPS_URL} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`location-link ${className}`}
      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
    >
      {children ? children : (
        <>
          {!disableEmoji && <span role="img" aria-label="pin">📍</span>} {LOCATION_NAME}
        </>
      )}
    </a>
  );
};

export default LocationLink;
