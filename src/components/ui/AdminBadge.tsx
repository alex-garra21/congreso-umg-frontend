import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = "",
  dot = false,
  style: customStyle
}) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
      fontFamily: "'Source Sans 3', sans-serif",
      ...customStyle
    }} className={`admin-badge admin-badge-${variant} ${className}`}>
      {dot && (
        <span style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: 'currentColor' 
        }} />
      )}
      {children}
    </span>
  );
};

export default AdminBadge;

