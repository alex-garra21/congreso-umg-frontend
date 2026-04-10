import { useState } from 'react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const steps = [
  {
    id: '01',
    iconColor: '#9c27b0', // purple
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ba68c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    title: 'Crea tu cuenta',
    desc: 'Regístrate con tu nombre, correo y tipo de participante (alumno UMG o externo).'
  },
  {
    id: '02',
    iconColor: '#e91e63', // pink/colorful
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f06292" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="7" y="7" width="14" height="14" rx="2" ry="2" fill="rgba(240, 98, 146, 0.2)"></rect>
      </svg>
    ),
    title: 'Selecciona charlas',
    desc: 'Elige las charlas de tu interés. El sistema evita automáticamente conflictos de horario.'
  },
  {
    id: '03',
    iconColor: '#1976d2', // blue
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64b5f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    ),
    title: 'Realiza tu pago',
    desc: 'Paga en efectivo con código único o sube tu comprobante de transferencia bancaria.'
  },
  {
    id: '04',
    iconColor: '#388e3c', // green
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#81c784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <path d="M9 12l2 2 4-4"></path>
      </svg>
    ),
    title: 'Confirmación QR',
    desc: 'Con el pago validado, en el evento escanea el QR dinámico para registrar tu asistencia.'
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
    <>
      <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
        {/* Fondo estático */}
        <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
        <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

        <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

          <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
            <span className="speakers-header-badge">Proceso</span>
            <h2>Cómo inscribirse</h2>
          </div>

          <div className="steps-grid">
            {steps.map(step => (
              <div
                key={step.id}
                className="speaker-card"
                style={{ textAlign: 'left', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onClick={() => handleCardClick(step.id)}
              >
                <div style={{
                  background: '#0d47a1',
                  color: '#64b5f6',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  marginBottom: '1.8rem'
                }}>
                  {step.id}
                </div>

                <div style={{ marginBottom: '1.2rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                  {step.icon}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '10px 0' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
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
      </div>
    </>
  );
}
