import { useState } from 'react';
import { validatePaymentInSession, getCurrentUser } from '../utils/auth';
import ModuleTitle from '../components/ModuleTitle';

export default function PaymentModule() {
  const [activeTab, setActiveTab] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [codigo, setCodigo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const user = getCurrentUser();
  const isPaid = user?.pagoValidado;

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

    // Validar pago en sesión
    validatePaymentInSession();
    
    // Notificar a otros componentes (Layout, Sidebar) que la sesión cambió
    window.dispatchEvent(new Event('sessionUpdate'));
    
    // El componente se re-renderizará porque isPaid cambiará (si lo leemos de nuevo)
    // Pero para ser inmediatos, podemos usar un estado local también o simplemente
    // confiar en que el usuario verá el cambio en los badges.
  };

  if (isPaid) {
    return (
      <div className="payment-module">
        <ModuleTitle title="Realizar pago" />
        <section className="dashboard-section" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#2e7d32', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '64px', height: '64px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800 }}>¡Tu pago ha sido validado!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Ya tienes acceso completo a la selección de talleres y confirmación de playera.
          </p>
          <button className="btn-lg btn-lg-primary" onClick={() => window.location.href = '/dashboard'}>
            Ir al Inicio
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="payment-module">
      <ModuleTitle title="Realizar pago" />
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Realizar pago</h2>
          <p>Elige tu método de pago para activar tu inscripción. Sin pago validado no podrás seleccionar talleres ni confirmar tu playera.</p>
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
              <h3>Código de pago en efectivo</h3>
              <p className="method-desc">Acércate a la caja autorizada, realiza tu pago y recibirás un código único personal. Ingrésalo aquí para activar tu cuenta.</p>
              
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
              <h3>Comprobante de transferencia</h3>
              <p className="method-desc">Transfiere al número de cuenta oficial y sube el comprobante. Un administrador lo revisará en 24-48 horas.</p>
              
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
                    {archivo ? 'Archivo seleccionado' : 'Choose File'}
                  </label>
                  <span className="file-name">{archivo ? archivo.name : 'No file chosen'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="payment-actions" style={{ marginTop: '2.5rem' }}>
            <button 
              className="btn-lg btn-lg-primary"
              onClick={handleSendPayment}
            >
              Enviar pago
            </button>
            <p className="demo-text">Demo: simula pago validado inmediatamente.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
