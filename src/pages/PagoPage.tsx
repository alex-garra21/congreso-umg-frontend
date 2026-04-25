


export default function PagoPage() {
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <span className="speakers-header-badge" style={{ background: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }}>PAGO</span>
          <h2>Métodos de pago aceptados</h2>
        </div>

        <div className="payment-grid" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="payment-card">
            <h3 style={{ margin: '10px 0' }}>Efectivo — Código de pago</h3>
            <p>Obtén un código único al realizar tu pago en efectivo en caja.</p>

            <ul className="payment-list">
              <li>Realiza el pago en caja autorizada</li>
              <li>Recibirás un código único personal</li>
              <li>Ingrésalo en tu perfil del sistema</li>
              <li>El sistema valida y activa tu inscripción al instante</li>
            </ul>
          </div>
        </div>

        {/* Banner de información */}
        <div className="info-banner">
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <p style={{ margin: 0, lineHeight: '1.5' }}>
            Tu inscripción queda <strong>pendiente</strong> hasta que el pago sea validado. Las charlas seleccionadas se reservan durante ese período.
          </p>
        </div>

      </div>
    </div>
  );
}
