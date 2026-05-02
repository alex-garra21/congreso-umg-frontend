

export default function AsistenciaInfo() {
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '6rem 2rem', color: 'var(--text-primary)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '4rem' }}>
          <span className="speakers-header-badge">Tecnología</span>
          <h2>Control de Asistencia QR</h2>
          <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Innovación y agilidad en cada entrada.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <div className="speaker-card" style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'var(--accent-light)',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              📱
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '22px' }}>Tu entrada en el bolsillo</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Olvídate de las listas impresas. Al completar tu inscripción y pago, recibirás un código QR único vinculado a tu perfil. Podrás acceder a él en cualquier momento desde tu panel de usuario.
              </p>
            </div>
          </div>

          <div className="speaker-card" style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(129, 199, 132, 0.2)',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              ⚡
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '22px' }}>Validación instantánea</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                En la entrada de cada charla o taller, nuestro equipo escaneará tu código. El sistema verificará tu asistencia en tiempo real, asegurando tu lugar y registrando tu participación para el diploma final.
              </p>
            </div>
          </div>

          <div className="speaker-card" style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 183, 77, 0.2)',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              🔒
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '22px' }}>Seguridad y Orden</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                El código QR es personal e intransferible. Esto nos permite mantener un control exacto del aforo y garantizar que todos los participantes tengan una experiencia cómoda y segura.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
