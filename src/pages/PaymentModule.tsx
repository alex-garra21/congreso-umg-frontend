import { useState, useEffect } from 'react';
import { validatePaymentInSession, sendPaymentProofInSession, getCurrentUser, type UserData } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function PaymentModule() {
  const [activeTab, setActiveTab] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [codigo, setCodigo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [user, setUser] = useState<UserData | null>(getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => setUser(getCurrentUser());
    window.addEventListener('sessionUpdate', handleUpdate);
    return () => window.removeEventListener('sessionUpdate', handleUpdate);
  }, []);

  const isPaid = user?.pagoValidado;
  const isSent = user?.pagoEnviado;

  const handleSendPayment = () => {
    if (activeTab === 'efectivo') {
      if (!codigo.trim()) {
        alert('Por favor, ingresa el código de pago.');
        return;
      }
    } else {
      if (!archivo) {
        alert('Por favor, selecciona un archivo de comprobante.');
        return;
      }
    }

    // Registrar envío en sesión
    sendPaymentProofInSession();
    
    // Notificar cambio
    window.dispatchEvent(new Event('sessionUpdate'));
  };

  const handleSimulateValidation = () => {
    validatePaymentInSession();
    window.dispatchEvent(new Event('sessionUpdate'));
  };

  if (isPaid) {
    return (
      <div className="payment-module">
        <ModuleTitle title="Realizar pago" />
        <section className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#40c057', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '80px', height: '80px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '32px', marginBottom: '1rem' }}>¡Pago Completado!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '16px', lineHeight: '1.6' }}>
            Tu inscripción ha sido validada exitosamente. Ya puedes disfrutar de todos los beneficios del congreso, elegir tus talleres y confirmar tu talla de playera.
          </p>
          <button className="btn-lg btn-lg-primary" style={{ background: 'var(--blue)', border: 'none' }} onClick={() => window.location.href = '/dashboard'}>
            Ir al Inicio
          </button>
        </section>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="payment-module">
        <ModuleTitle title="Realizar pago" />
        <section className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#ff922b', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '80px', height: '80px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '32px', marginBottom: '1rem' }}>Pago en Proceso</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '16px', lineHeight: '1.6' }}>
            Hemos recibido tu comprobante. Nuestro equipo administrativo lo revisará en un plazo de 24 a 48 horas hábiles. Te notificaremos cuando tu inscripción esté activada.
          </p>
          
          <div style={{ background: '#fff9db', border: '1px solid #ffe066', borderRadius: '12px', padding: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f08c00', marginBottom: '1rem' }}>
              MODO DEMO: Puedes simular la validación administrativa para ver los cambios en el dashboard.
            </p>
            <button 
              className="btn-lg" 
              style={{ background: '#f08c00', color: '#fff', border: 'none', width: '100%' }}
              onClick={handleSimulateValidation}
            >
              Simular Validación Admin
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-module">
      <ModuleTitle title="Realizar pago" />
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Información de Pago</h2>
          <p>Elige tu método de pago para activar tu inscripción. Sin pago validado no podrás finalizar la selección de talleres ni confirmar tu playera.</p>
        </div>

        {/* Selector de Pestañas */}
        <div className="payment-tabs-container">
          <button 
            className={`payment-tab ${activeTab === 'efectivo' ? 'active' : ''}`}
            onClick={() => setActiveTab('efectivo')}
          >
            <span className="tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '18px', height: '18px'}}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
            </span>
            Efectivo
          </button>
          <button 
            className={`payment-tab ${activeTab === 'transferencia' ? 'active' : ''}`}
            onClick={() => setActiveTab('transferencia')}
          >
            <span className="tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '18px', height: '18px'}}><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" /></svg>
            </span>
            Transferencia bancaria
          </button>
        </div>

        {/* Contenido de la Pestaña */}
        <div className="payment-tab-content">
          {activeTab === 'efectivo' ? (
            <div className="payment-method-view">
              <h3>Pago en Ventanilla</h3>
              <p className="method-desc">Realiza tu pago en la caja del campus y obtén tu código de activación. Ingrésalo aquí para que podamos validarlo.</p>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>CÓDIGO DE PAGO</label>
                <input 
                  type="text" 
                  placeholder="Ej: CONG-2026-XXXX" 
                  className="dashboard-input"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="payment-method-view">
              <h3>Transferencia / Depósito</h3>
              <p className="method-desc">Transfiere al número de cuenta oficial y sube el comprobante digital para su revisión.</p>
              
              <div className="bank-info-box">
                <span className="info-title">Datos bancarios</span>
                <p>Banco: Banrural · No. cuenta: 000-000000-0 · Nombre: Universidad Mariano Gálvez</p>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>SUBE TU COMPROBANTE</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    className="file-input-hidden" 
                    id="comprobante" 
                    accept=".pdf,.jpg,.png,.jpeg"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="comprobante" className="file-upload-label">
                    {archivo ? 'Archivo seleccionado' : 'Sube tu comprobante'}
                  </label>
                  <span className="file-name">{archivo ? archivo.name : 'No se ha seleccionado archivo'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="payment-actions" style={{ marginTop: '2.5rem' }}>
            <button 
              className="btn-lg btn-lg-primary"
              style={{ background: 'var(--blue)', border: 'none' }}
              onClick={handleSendPayment}
            >
              Enviar comprobante
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
