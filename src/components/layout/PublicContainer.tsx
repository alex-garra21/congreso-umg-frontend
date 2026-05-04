import React from 'react';

interface PublicContainerProps {
  children: React.ReactNode;
  badge?: string;
  title?: string;
  description?: React.ReactNode;
  maxWidth?: string;
  padding?: string;
}

export default function PublicContainer({
  children,
  badge,
  title,
  description,
  maxWidth = '1200px',
  padding = '6rem 2rem'
}: PublicContainerProps) {
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático compartido */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{
        padding,
        color: 'var(--text-primary)',
        maxWidth,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header Opcional Estandarizado */}
        {(badge || title || description) && (
          <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            {badge && <span className="speakers-header-badge">{badge}</span>}
            {title && <h2>{title}</h2>}
            {description && (
              <div style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: '15px auto 0' }}>
                {description}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
