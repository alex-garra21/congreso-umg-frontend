import { useState } from 'react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import { Icons } from '../components/Icons';
import PublicContainer from '../components/layout/PublicContainer';

const steps = [
  {
    id: '01',
    Icon: Icons.User,
    title: 'Crea tu cuenta',
    desc: 'Regístrate con tu nombre, correo y tipo de participante (alumno UMG o externo).'
  },
  {
    id: '02',
    Icon: Icons.Calendar,
    title: 'Selecciona charlas',
    desc: 'Elige las charlas de tu interés. El sistema evita automáticamente conflictos de horario.'
  },
  {
    id: '03',
    Icon: Icons.CreditCard,
    title: 'Realiza tu pago',
    desc: 'Sube tu comprobante de pago. Nuestro equipo administrativo validará la información.'
  },
  {
    id: '04',
    Icon: Icons.CheckCircle,
    title: '¡Listo para el evento!',
    desc: 'Una vez validado, tendrás acceso total a tu perfil, agenda y código QR de acceso.'
  }
];

export default function InscripcionPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleCardClick = (id: string) => {
    if (id === '01') {
      setIsRegisterOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <PublicContainer
      badge="Proceso"
      title="Cómo Inscribirte"
      description="Sigue estos sencillos pasos para asegurar tu lugar en el Congreso UMG 2026."
    >
      <div className="robotics-rules-grid" style={{ marginBottom: '4rem' }}>
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="robotics-rule-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => handleCardClick(step.id)}
          >
            <div className="robotics-rule-icon">
              <step.Icon size={32} strokeWidth={1.5} />
            </div>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '800', 
              color: 'var(--accent-primary)', 
              letterSpacing: '1px',
              marginBottom: '10px',
              display: 'block',
              textTransform: 'uppercase'
            }}>PASO {step.id}</span>
            <h4 style={{ fontSize: '20px', marginBottom: '12px' }}>{step.title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '2rem' }}>¿Listo para comenzar?</h3>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <button
            className="btn-solid"
            onClick={openRegister}
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '14px' }}
          >
            Crear mi cuenta ahora
          </button>
          <button
            className="btn-outline"
            onClick={openLogin}
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '14px' }}
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </PublicContainer>
  );
}
