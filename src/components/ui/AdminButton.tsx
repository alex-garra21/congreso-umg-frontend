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
    return {}; // Variant styles are now handled by CSS classes (.admin-btn-variant)
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
      className={`admin-btn admin-btn-${variant} ${className}`}
      style={{ ...internalStyle, ...customStyle }}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default AdminButton;
