import type { PasswordRequirement } from '../utils/auth';
import { Icons } from './Icons';

interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
}

export default function PasswordRequirements({ requirements }: PasswordRequirementsProps) {
  const metAll = requirements.every(r => r.met);

  if (metAll) {
    return (
      <div style={{
        color: '#16a34a',
        fontSize: '15px',
        fontWeight: 700,
        marginTop: '-10px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeIn 0.3s ease'
      }}>
        <Icons.CheckCircle size={20} />
        Contraseña segura y válida
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '-10px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      animation: 'fadeIn 0.2s ease'
    }}>
      {requirements.map((req) => (
        !req.met && (
          <div
            key={req.id}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '10px' }}>●</span>
            {req.label}
          </div>
        )
      ))}
    </div>
  );
}
