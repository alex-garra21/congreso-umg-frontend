import { useState, useEffect } from 'react';
import { getCurrentUser, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function DashboardHome() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const [workshopsCount, setWorkshopsCount] = useState(0);

  useEffect(() => {
    const updateData = () => {
      setUser(getCurrentUser());
      const saved = localStorage.getItem(`workshops_${getCurrentUser()?.correo}`);
      if (saved) {
        setWorkshopsCount(JSON.parse(saved).length);
      } else {
        setWorkshopsCount(0);
      }
    };

    updateData();
    window.addEventListener('sessionUpdate', updateData);
    return () => window.removeEventListener('sessionUpdate', updateData);
  }, []);

  const isPaid = user?.pagoValidado;
  const isSent = user?.pagoEnviado;
  const hasShirt = !!user?.talla;

  const Icons = {
    Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    AlertTriangle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    CreditCard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Shirt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></svg>,
    Layout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
    Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  };

  const getStepStatus = (type: 'pago' | 'talleres' | 'playera') => {
    if (type === 'pago') {
      if (isPaid) return { class: 'completed', label: 'Completado', badge: 'success' };
      if (isSent) return { class: 'in-progress', label: 'En proceso', badge: 'warning' };
      return { class: 'pending', label: 'Pendiente', badge: 'neutral' };
    }
    if (type === 'talleres') {
      if (workshopsCount > 0 && isPaid) return { class: 'completed', label: 'Completado', badge: 'success' };
      if (workshopsCount > 0) return { class: 'in-progress', label: 'En proceso', badge: 'warning' };
      return { class: 'pending', label: 'Pendiente', badge: 'neutral' };
    }
    if (type === 'playera') {
      if (hasShirt && isPaid) return { class: 'completed', label: 'Completado', badge: 'success' };
      if (hasShirt) return { class: 'in-progress', label: 'En proceso', badge: 'warning' };
      return { class: 'pending', label: 'Pendiente', badge: 'neutral' };
    }
    return { class: 'pending', label: 'Pendiente', badge: 'neutral' };
  };

  const pagoStatus = getStepStatus('pago');
  const talleresStatus = getStepStatus('talleres');
  const playeraStatus = getStepStatus('playera');

  return (
    <div className="dashboard-home">
      <ModuleTitle title="Inicio" />

      {/* Top Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <span className="card-label">ESTADO DE PAGO</span>
          {isPaid ? (
            <div className="card-value success">
              <span className="icon"><Icons.CheckCircle /></span>
              <span>Validado</span>
            </div>
          ) : isSent ? (
            <div className="card-value warning">
              <span className="icon"><Icons.Clock /></span>
              <span>En revisión</span>
            </div>
          ) : (
            <div className="card-value danger">
              <span className="icon"><Icons.AlertTriangle /></span>
              <span>Pendiente</span>
            </div>
          )}
          <span className="card-sub">{isPaid ? 'Inscripción activa' : isSent ? 'Validando comprobante' : 'Pago requerido'}</span>
        </div>

        <div className="status-card">
          <span className="card-label">TALLERES</span>
          <div className="card-value">
            <span className="number">{workshopsCount}</span>
          </div>
          <span className="card-sub">{workshopsCount === 1 ? 'Taller seleccionado' : 'Talleres seleccionados'}</span>
        </div>

        <div className="status-card">
          <span className="card-label">PLAYERA</span>
          <div className="card-value">
            <span className="text">{user?.talla ? `Talla ${user.talla}` : 'Sin definir'}</span>
          </div>
          <span className="card-sub">{user?.sexo ? `Corte ${user.sexo}` : 'Elige tu talla'}</span>
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
          <h2>Resumen de Inscripción</h2>
          <p>Sigue el progreso de tu registro para asegurar tu participación en el Congreso 2026.</p>
        </div>

        <div className="steps-vertical">
          {/* Step 1: Cuenta */}
          <div className="step-item completed">
            <div className="step-check"><Icons.Check /></div>
            <div className="step-content">
              <h3>Cuenta creada</h3>
              <p>Registro exitoso en la plataforma</p>
            </div>
            <span className="step-badge success">Completado</span>
          </div>

          {/* Step 2: Pago */}
          <div className={`step-item ${pagoStatus.class}`}>
            <div className={isPaid ? 'step-check' : 'step-icon'}>
              {isPaid ? <Icons.Check /> : <Icons.CreditCard />}
            </div>
            <div className="step-content">
              <h3>Validación de Pago</h3>
              <p>{isPaid ? 'Inscripción activada correctamente' : isSent ? 'Comprobante recibido, en revisión' : 'Pendiente de realizar pago'}</p>
            </div>
            <span className={`step-badge ${pagoStatus.badge}`}>{pagoStatus.label}</span>
          </div>

          {/* Step 3: Talleres */}
          <div className={`step-item ${talleresStatus.class}`}>
            <div className={workshopsCount > 0 && isPaid ? 'step-check' : 'step-icon'}>
              {workshopsCount > 0 && isPaid ? <Icons.Check /> : <Icons.Layout />}
            </div>
            <div className="step-content">
              <h3>Selección de Talleres</h3>
              <p>{workshopsCount > 0 ? `${workshopsCount} talleres en tu agenda` : 'Elige los talleres de tu interés'}</p>
            </div>
            <span className={`step-badge ${talleresStatus.badge}`}>{talleresStatus.label}</span>
          </div>

          {/* Step 4: Playera */}
          <div className={`step-item ${playeraStatus.class}`}>
            <div className={hasShirt && isPaid ? 'step-check' : 'step-icon'}>
              {hasShirt && isPaid ? <Icons.Check /> : <Icons.Shirt />}
            </div>
            <div className="step-content">
              <h3>Talla de Playera</h3>
              <p>{hasShirt ? `Talla ${user?.talla} seleccionada` : 'Confirma tu talla oficial'}</p>
            </div>
            <span className={`step-badge ${playeraStatus.badge}`}>{playeraStatus.label}</span>
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

      <style>{`
        .step-item.in-progress {
          border-left: 2px solid #ff922b;
          background: #fff9f0;
        }
        .step-item.in-progress .step-icon {
          background: #ff922b;
          color: #fff;
        }
        .step-badge.warning {
          background: #fff4e6;
          color: #f76707;
          border: 1px solid #ffe8cc;
        }
        .status-card .card-value.warning {
          color: #f76707;
        }
        .status-card .card-value.danger {
          color: #fa5252;
        }
      `}</style>
    </div>
  );
}
