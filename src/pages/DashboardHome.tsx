import { useState, useEffect } from 'react';
import { getCurrentUser, getAllUsersCloud, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function DashboardHome() {
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const [workshopsCount, setWorkshopsCount] = useState(0);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      if (currentUser?.rol !== 'admin') {
        const saved = localStorage.getItem(`workshops_${currentUser?.correo}`);
        if (saved) {
          setWorkshopsCount(JSON.parse(saved).length);
        } else {
          setWorkshopsCount(0);
        }
      }
    };

    updateData();
    window.addEventListener('sessionUpdate', updateData);

    // Si es administrador, cargar la lista completa para métricas
    if (getCurrentUser()?.rol === 'admin') {
      setLoadingAdmin(true);
      getAllUsersCloud().then(data => {
        setAllUsers(data);
        setLoadingAdmin(false);
      });
    }

    return () => window.removeEventListener('sessionUpdate', updateData);
  }, []);

  const Icons = {
    Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    AlertTriangle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    CreditCard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Layout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
    Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  };

  if (user?.rol === 'admin') {
    // Los administradores no cuentan como participantes
    const participants = allUsers.filter(u => u.rol !== 'admin');
    const adminsCount = allUsers.filter(u => u.rol === 'admin').length;
    
    const totalUsers = participants.length;
    const paidUsers = participants.filter(u => u.pagoValidado).length;
    const studentUsers = participants.filter(u => u.tipoParticipante === 'alumno').length;
    const externalUsers = participants.filter(u => u.tipoParticipante === 'externo').length;
    const deactivatedUsers = participants.filter(u => u.desactivado).length;

    return (
      <div className="dashboard-home">
        <ModuleTitle title="Inicio (Panel Administrativo)" />

        <div className="status-grid">
          <div className="status-card">
            <span className="card-label">TOTAL PARTICIPANTES</span>
            <div className="card-value">
              <span className="icon"><Icons.Users /></span>
              <span className="number">{loadingAdmin ? '...' : totalUsers}</span>
            </div>
            <span className="card-sub">Excluye administradores</span>
          </div>

          <div className="status-card">
            <span className="card-label">PAGOS VALIDADOS</span>
            <div className="card-value success">
              <span className="icon"><Icons.CheckCircle /></span>
              <span className="number">{loadingAdmin ? '...' : paidUsers}</span>
            </div>
            <span className="card-sub">Inscripciones completadas</span>
          </div>

          <div className="status-card">
            <span className="card-label">ESTUDIANTES UMG</span>
            <div className="card-value" style={{ color: '#1c7ed6' }}>
              <span className="icon"><Icons.Layout /></span>
              <span className="number">{loadingAdmin ? '...' : studentUsers}</span>
            </div>
            <span className="card-sub">Alumnos universitarios</span>
          </div>
          
          <div className="status-card">
            <span className="card-label">PARTICIPANTES EXTERNOS</span>
            <div className="card-value" style={{ color: '#f59f00' }}>
              <span className="icon"><Icons.Users /></span>
              <span className="number">{loadingAdmin ? '...' : externalUsers}</span>
            </div>
            <span className="card-sub">Profesionales y público</span>
          </div>

          <div className="status-card">
            <span className="card-label">ADMINISTRADORES</span>
            <div className="card-value" style={{ color: '#862e9c' }}>
              <span className="icon"><Icons.CheckCircle /></span>
              <span className="number">{loadingAdmin ? '...' : adminsCount}</span>
            </div>
            <span className="card-sub">Personal del evento</span>
          </div>
        </div>

        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Resumen del Congreso</h2>
            <p>Métricas generales sobre el estado de las inscripciones y los participantes.</p>
          </div>

          <div className="steps-vertical">
            <div className="step-item completed">
              <div className="step-check"><Icons.Layout /></div>
              <div className="step-content">
                <h3>Tipos de Participantes</h3>
                <p>Actualmente hay <strong>{studentUsers}</strong> alumnos UMG y <strong>{externalUsers}</strong> participantes externos registrados.</p>
              </div>
            </div>

            <div className="step-item in-progress">
              <div className="step-icon"><Icons.CreditCard /></div>
              <div className="step-content">
                <h3>Estado Financiero General</h3>
                <p><strong>{paidUsers}</strong> usuarios han completado el proceso de pago. Aún faltan <strong>{totalUsers - paidUsers}</strong> cuentas por validar.</p>
              </div>
            </div>

            {deactivatedUsers > 0 && (
              <div className="step-item pending">
                <div className="step-icon"><Icons.AlertTriangle /></div>
                <div className="step-content">
                  <h3>Cuentas Inactivas</h3>
                  <p>Existen <strong>{deactivatedUsers}</strong> usuario(s) con cuenta desactivada, que no se incluirán en los reportes oficiales.</p>
                </div>
              </div>
            )}
          </div>
        </section>

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
        `}</style>
      </div>
    );
  }

  const isPaid = user?.pagoValidado;
  const isSent = user?.pagoEnviado;

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
    return { class: 'pending', label: 'Pendiente', badge: 'neutral' };
  };

  const pagoStatus = getStepStatus('pago');
  const talleresStatus = getStepStatus('talleres');

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



        <div 
          className="status-card highlight" 
          style={{ cursor: 'pointer' }} 
          onClick={() => window.open('https://www.google.com/calendar/render?action=TEMPLATE&text=CONGRESO+2026+UMG+SISTEMAS+COBÁN&dates=20260523T140000Z/20260523T230000Z&details=El+evento+académico+más+importante+del+año.&location=Hotel+Alcazar+doña+Victoria,+Cobán', '_blank')}
        >
          <span className="card-label">EVENTO</span>
          <div className="card-value">
            <span className="text">Mayo 23</span>
          </div>
          <span className="card-sub">Recordatorio Calendar</span>
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


        </div>
      </section>

      {/* Info Banner */}
      <div 
        className="info-banner" 
        style={{ cursor: 'pointer' }}
        onClick={() => window.open('https://maps.app.goo.gl/drwTJp68mjcYne5S9', '_blank')}
      >
        <span className="banner-icon">📍</span>
        <div className="banner-text">
          <h3>Hotel Alcazar doña Victoria — 23 de mayo, 2026</h3>
          <p>Hotel Alcazar doña Victoria, Cobán · Clic para ver ubicación</p>
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
