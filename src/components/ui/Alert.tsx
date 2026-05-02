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
      bg: '#f0fff4',
      border: '#c6f6d5',
      text: '#22543d',
      titleColor: '#1c4532',
      defaultIcon: <Icons.CheckCircle size={20} />
    },
    warning: {
      bg: '#fffaf0',
      border: '#feebc8',
      text: '#744210',
      titleColor: '#652b19',
      defaultIcon: <Icons.AlertTriangle size={20} />
    },
    error: {
      bg: '#fff5f5',
      border: '#feb2b2',
      text: '#9b2c2c',
      titleColor: '#822727',
      defaultIcon: <Icons.AlertTriangle size={20} />
    },
    info: {
      bg: '#ebf8ff',
      border: '#bee3f8',
      text: '#2a4365',
      titleColor: '#2a4365',
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
            margin: 0
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
