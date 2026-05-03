import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
}

export default function LoadingButton({
  children,
  isLoading,
  loadingText,
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}: LoadingButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-soft)'
        };
      case 'danger':
        return {
          background: '#ef4444',
          color: 'white',
          border: 'none'
        };
      case 'success':
        return {
          background: '#10b981',
          color: 'white',
          border: 'none'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-soft)'
        };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '15px',
    cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
    opacity: (isLoading || disabled) ? 0.7 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...getVariantStyles(),
    ...style
  };

  return (
    <button
      disabled={isLoading || disabled}
      style={baseStyle}
      className={`loading-button ${className}`}
      {...props}
    >
      {isLoading && (
        <div className="button-spinner"></div>
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>

      <style>{`
        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: button-spin 0.8s linear infinite;
        }
        @keyframes button-spin {
          to { transform: rotate(360deg); }
        }
        .loading-button:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .loading-button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </button>
  );
}
