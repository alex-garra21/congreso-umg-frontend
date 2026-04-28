import React from 'react';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'info' | 'accent' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const AdminButton: React.FC<AdminButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  style: customStyle,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': 
        return { 
          background: 'var(--blue)', 
          color: 'white', 
          border: 'none',
          boxShadow: '0 4px 12px rgba(24, 95, 165, 0.2)'
        };
      case 'secondary': 
        return { 
          background: 'rgba(0, 0, 0, 0.05)', 
          color: 'var(--text-primary)', 
          border: 'none' 
        };
      case 'info': 
        return { 
          background: '#e7f5ff', 
          color: '#1971c2', 
          border: 'none' 
        };
      case 'accent': 
        return { 
          background: '#f3f0ff', 
          color: '#5f3dc4', 
          border: 'none' 
        };
      case 'warning': 
        return { 
          background: '#fff9db', 
          color: '#f08c00', 
          border: 'none' 
        };
      case 'success': 
        return { 
          background: '#ebfbee', 
          color: '#2b8a3e', 
          border: 'none' 
        };
      case 'danger': 
        return { 
          background: '#fff5f5', 
          color: '#e03131', 
          border: 'none' 
        };
      case 'outline': 
        return { 
          background: 'transparent', 
          color: 'var(--blue)', 
          border: '1.5px solid rgba(24, 95, 165, 0.3)' 
        };
      case 'ghost': 
        return { 
          background: 'transparent', 
          color: 'var(--text-secondary)', 
          border: 'none' 
        };
      default: return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '8px 16px', fontSize: '12px' };
      case 'md': return { padding: '12px 24px', fontSize: '14px' };
      case 'lg': return { padding: '14px 32px', fontSize: '16px' };
      default: return {};
    }
  };

  const internalStyle: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '10px',
    fontWeight: 700,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: props.disabled ? 0.6 : 1,
    fontFamily: "'Space Grotesk', sans-serif",
    border: (getVariantStyles() as any).border || 'none',
    ...customStyle
  };

  return (
    <button 
      style={internalStyle} 
      className={`admin-btn-hover ${className}`} 
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default AdminButton;
