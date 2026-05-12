import React from 'react';
import { Icons } from '../Icons';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  icon,
  style = {},
  className = ""
}) => {
  const configs = {
    success: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.2)',
      text: 'var(--text-primary)',
      titleColor: '#10b981',
      defaultIcon: <Icons.CheckCircle size={20} />
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.2)',
      text: 'var(--text-primary)',
      titleColor: '#f59e0b',
      defaultIcon: <Icons.AlertTriangle size={20} />
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.2)',
      text: 'var(--text-primary)',
      titleColor: '#ef4444',
      defaultIcon: <Icons.AlertTriangle size={20} />
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.2)',
      text: 'var(--text-primary)',
      titleColor: '#3b82f6',
      defaultIcon: <Icons.Info size={20} />
    }
  };

  const config = configs[variant];
  const finalIcon = icon || config.defaultIcon;

  return (
    <div 
      className={`alert-component ${variant} ${className}`}
      style={{
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        ...style
      }}
    >
      {finalIcon && (
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {finalIcon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {title && (
          <h4 className="alert-title" style={{ 
            fontSize: '15px', 
            fontWeight: 700, 
            marginBottom: '4px', 
            margin: 0,
            color: config.titleColor
          }}>
            {title}
          </h4>
        )}
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Alert;
