import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * BackButton - A premium reusable button for navigating back to a previous page,
 * usually the Dashboard. Follows the project's premium design system.
 */
export default function BackButton({ 
  to = '/dashboard', 
  label = 'Regresar al Inicio', 
  className = '', 
  style = {} 
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifySelf: 'center', width: '100%', justifyContent: 'center', margin: '2rem 0' }}>
      <button 
        className={`btn-back-home-premium ${className}`}
        onClick={() => navigate(to)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: 'var(--accent-primary)',
          border: 'none',
          padding: '14px 36px',
          borderRadius: '100px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '15px',
          cursor: 'pointer',
          fontFamily: "'Source Sans 3', sans-serif",
          ...style
        }}
      >
        <Icons.ArrowLeft size={18} color="#ffffff" />
        {label}
      </button>
    </div>
  );
}
