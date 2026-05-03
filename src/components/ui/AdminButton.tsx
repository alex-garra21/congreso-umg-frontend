import React from 'react';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'info' | 'accent' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  href?: string;
  target?: string;
}

const AdminButton: React.FC<AdminButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  style: customStyle,
  href,
  target,
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
    textDecoration: 'none',
    ...customStyle
  };

  const commonProps = {
    className: `admin-btn admin-btn-${variant} ${className}`,
    style: { ...internalStyle, ...customStyle }
  };

  if (href) {
    return (
      <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} {...(commonProps as any)}>
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <button 
      {...commonProps}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default AdminButton;
