import { useState, useEffect } from 'react';
import { getCurrentUser, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function DashboardHome() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('sessionUpdate', handleUpdate);
    return () => window.removeEventListener('sessionUpdate', handleUpdate);
  }, []);

  const isPaid = user?.pagoValidado;

  const Icons = {
    Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    AlertTriangle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    CreditCard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Shirt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></svg>,
    Layout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
  };

  return (
    <div className="dashboard-home">
      <ModuleTitle title="Inicio" />
      {/* Top Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <span className="card-label">ESTADO</span>
          {isPaid ? (
            <div className="card-value success">
              <span className="icon"><Icons.CheckCircle /></span>
              <span>Validado</span>
            </div>
          ) : (
            <div className="card-value warning">
              <span className="icon"><Icons.AlertTriangle /></span>
              <span>Pendiente</span>
            </div>
          )}
          <span className="card-sub">{isPaid ? 'Pago confirmado' : 'Falta validar pago'}</span>
        </div>
        <div className="status-card">
          <span className="card-label">TALLERES</span>
          <div className="card-value">
            <span className="number">0</span>
          </div>
          <span className="card-sub">Seleccionados</span>
        </div>
        <div className="status-card">
          <span className="card-label">PLAYERA</span>
          <div className="card-value">
            <span className="text">Sin definir</span>
          </div>
          <span className="card-sub">Talla y género</span>
        </div>
        <div className="status-card highlight">
          <span className="card-label">EVENTO</span>
          <div className="card-value">
            <span className="text">Oct 15</span>
          </div>
          <span className="card-sub">Campus UMG</span>
        </div>
      </div>

      {/* Subscription Status Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Estado de tu inscripción</h2>
          <p>Completa los pasos para confirmar tu lugar en el Congreso 2026.</p>
        </div>

        <div className="steps-vertical">
          <div className="step-item completed">
            <div className="step-check"><Icons.Check /></div>
            <div className="step-content">
              <h3>Cuenta creada</h3>
              <p>Registro completado</p>
            </div>
            <span className="step-badge success">Completado</span>
          </div>

          <div className={`step-item ${isPaid ? 'completed' : 'active'}`}>
            <div className={isPaid ? 'step-check' : 'step-icon'}>
              {isPaid ? <Icons.Check /> : <Icons.CreditCard />}
            </div>
            <div className="step-content">
              <h3>Pago</h3>
              <p>{isPaid ? 'Pago confirmado' : 'Pendiente de validar'}</p>
            </div>
            <span className={`step-badge ${isPaid ? 'success' : 'warning'}`}>
              {isPaid ? 'Completado' : 'En progreso'}
            </span>
          </div>

          <div className="step-item pending">
            <div className="step-icon"><Icons.Layout /></div>
            <div className="step-content">
              <h3>Talleres</h3>
              <p>Elige tus sesiones</p>
            </div>
            <span className="step-badge neutral">Pendiente</span>
          </div>

          <div className="step-item pending">
            <div className="step-icon"><Icons.Shirt /></div>
            <div className="step-content">
              <h3>Playera</h3>
              <p>Selecciona tu talla</p>
            </div>
            <span className="step-badge neutral">Pendiente</span>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <div className="info-banner">
        <span className="banner-icon"><Icons.Calendar /></span>
        <div className="banner-text">
          <h3>Congreso 2026 — 15 al 17 de octubre</h3>
          <p>Campus Central UMG · Guatemala · 8:00 AM - 7:00 PM</p>
        </div>
      </div>
    </div>
  );
}
