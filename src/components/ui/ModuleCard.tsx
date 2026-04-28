import React from 'react';

interface ModuleCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  children, 
  title, 
  description, 
  headerActions, 
  className = "",
  style
}) => {
  return (
    <div 
      className={`module-card ${className}`}
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-soft)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {(title || headerActions) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: children ? '20px' : '0',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            {title && <h3 style={{ 
              margin: 0, 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 800, 
              fontSize: '18px',
              color: 'var(--text-primary)'
            }}>{title}</h3>}
            {description && <p style={{ 
              margin: '4px 0 0', 
              fontSize: '14px', 
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>{description}</p>}
          </div>
          {headerActions && <div style={{ display: 'flex', gap: '8px' }}>{headerActions}</div>}
        </div>
      )}
      <div className="module-card-content">
        {children}
      </div>
    </div>
  );
};

export default ModuleCard;
