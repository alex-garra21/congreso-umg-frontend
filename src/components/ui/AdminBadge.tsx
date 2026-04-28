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
  const getStyles = () => {
    switch (variant) {
      case 'success': return { background: '#ebfbee', color: '#2b8a3e' };
      case 'warning': return { background: '#fff9db', color: '#f08c00' };
      case 'danger': return { background: '#fff5f5', color: '#e03131' };
      case 'info': return { background: '#e7f5ff', color: '#1971c2' };
      case 'purple': return { background: '#845ef7', color: '#ffffff' };
      case 'neutral': 
      default: return { background: '#f1f3f5', color: '#495057' };
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'success': return '#40c057';
      case 'warning': return '#fab005';
      case 'danger': return '#fa5252';
      case 'info': return '#228be6';
      case 'purple': return '#7950f2';
      default: return '#adb5bd';
    }
  };

  const { background, color } = getStyles();

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
      background,
      color,
      whiteSpace: 'nowrap',
      fontFamily: "'Space Grotesk', sans-serif",
      ...customStyle
    }} className={className}>
      {dot && (
        <span style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: getDotColor() 
        }} />
      )}
      {children}
    </span>
  );
};

export default AdminBadge;
