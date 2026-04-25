import { useState, useEffect } from 'react';
import { validateToken, validatePaymentInSession, getCurrentUser, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function PaymentModule() {
  const [codigo, setCodigo] = useState('');
  const [user, setUser] = useState<UserData | null>(getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => setUser(getCurrentUser());
    window.addEventListener('sessionUpdate', handleUpdate);
    return () => window.removeEventListener('sessionUpdate', handleUpdate);
  }, []);

  const isPaid = user?.pagoValidado;

  const handleSendPayment = async () => {
    if (!codigo.trim()) {
      alert('Por favor, ingresa el código de pago.');
      return;
    }

    const isValid = await validateToken(codigo);
    if (isValid) {
      validatePaymentInSession();
      window.dispatchEvent(new Event('sessionUpdate'));
      alert('¡Código validado exitosamente! Tu inscripción ha sido activada.');
    } else {
      alert('El código ingresado no es válido o ya fue utilizado. Si pagaste en ventanilla, solicita tu código al encargado.');
    }
  };

  if (isPaid) {
    return (
      <div className="payment-module">
        <ModuleTitle title="Estado de pago" />
        <section className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#40c057', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '80px', height: '80px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '32px', marginBottom: '1rem' }}>¡Pago Completado!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '16px', lineHeight: '1.6' }}>
            Tu inscripción ha sido validada exitosamente. Ya puedes disfrutar de todos los beneficios del congreso y elegir tus talleres.
          </p>
          <button className="btn-lg btn-lg-primary" style={{ background: 'var(--blue)', border: 'none' }} onClick={() => window.location.href = '/dashboard'}>
            Ir al Inicio
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-module">
      <ModuleTitle title="Verificación de pago" />
      <section className="dashboard-section">

        <div className="payment-tab-content">
          <div className="payment-method-view">
            <h3>Ingresa tu código de pago a continuación:</h3>
            <p className="method-desc">Ingresa el código de activación que se te proporcionó para validar el pago de tu inscripción.</p>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>CÓDIGO DE PAGO</label>
              <input
                type="text"
                placeholder="Ej: C2026-aBcD-1xYz-9QkL"
                className="dashboard-input"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
          </div>

          <div className="payment-actions" style={{ marginTop: '2.5rem' }}>
            <button
              className="btn-lg btn-lg-primary"
              style={{ background: 'var(--blue)', border: 'none' }}
              onClick={handleSendPayment}
            >
              Validar código
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
