import { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { refreshAppPage, getRemainingRefreshCooldown } from '../utils/appCache';

interface AppRefreshButtonProps {
  className?: string;
  title?: string;
  variant?: 'ghost' | 'header';
}

export default function AppRefreshButton({
  className = '',
  title = 'Actualizar datos (limpia caché y vuelve a cargar)',
  variant = 'ghost',
}: AppRefreshButtonProps) {
  const [remainingCooldown, setRemainingCooldown] = useState(getRemainingRefreshCooldown());

  useEffect(() => {
    if (remainingCooldown <= 0) return;

    const interval = setInterval(() => {
      const remaining = getRemainingRefreshCooldown();
      setRemainingCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingCooldown]);

  // Si está en cooldown (menos de 10 min desde el último refresh), se oculta por completo
  if (remainingCooldown > 0) {
    return null;
  }

  const baseStyle: React.CSSProperties =
    variant === 'header'
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.45rem 0.75rem',
          borderRadius: '10px',
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-app)',
          color: 'var(--text-secondary)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: '10px',
          border: '1px solid var(--border-soft)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        };

  const handleRefresh = () => {
    const success = refreshAppPage();
    if (success) {
      setRemainingCooldown(getRemainingRefreshCooldown());
    }
  };

  return (
    <button
      type="button"
      className={className}
      title={title}
      aria-label="Actualizar página"
      style={baseStyle}
      onClick={handleRefresh}
    >
      <Icons.RefreshCw size={18} />
      {variant === 'header' && <span>Actualizar</span>}
    </button>
  );
}
