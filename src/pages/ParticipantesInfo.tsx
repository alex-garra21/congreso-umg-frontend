

export default function ParticipantesInfo() {

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: '100%' }}>
      {/* Fondo estático */}
      <div className="hero-grid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>
      <div className="hero-accent" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}></div>

      <div style={{ padding: '6rem 2rem', color: 'var(--text-primary)', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div className="speakers-header" style={{ flexDirection: 'column', textAlign: 'center', justifyContent: 'center', marginBottom: '4rem' }}>
          <span className="speakers-header-badge">Comunidad</span>
          <h2>Únete a los 500+ Participantes</h2>
          <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '15px auto 0' }}>
            Sé parte de la red de estudiantes y profesionales más grande de la región.
          </p>
        </div>

        {/* Sección Guerra de Robots */}
        <div style={{ 
          background: 'rgba(13, 71, 161, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '30px',
          padding: '4rem 3rem',
          border: '1px solid rgba(100, 181, 246, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(100, 181, 246, 0.1)',
          marginBottom: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '150px', opacity: 0.05, pointerEvents: 'none', filter: 'hue-rotate(180deg)' }}>🤖</div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ 
              background: 'linear-gradient(90deg, #1976d2, #64b5f6)', 
              color: 'white', 
              padding: '6px 15px', 
              borderRadius: '50px', 
              fontSize: '13px', 
              fontWeight: 700,
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)'
            }}>
              COMPETENCIA MAGNA
            </span>
            <h2 style={{ fontSize: '42px', margin: '20px 0', color: '#fff', letterSpacing: '-1px' }}>
              GUERRA DE <span style={{ color: '#64b5f6' }}>ROBOTS</span> 2026
            </h2>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.8', maxWidth: '700px', color: 'var(--text-secondary)' }}>
              ¡La adrenalina llega al congreso! Sé testigo de la competencia más emocionante del año. Estudiantes de ingeniería pondrán a prueba sus creaciones en una batalla épica de ingenio, metal y programación.
            </p>
            <div style={{ display: 'flex', gap: '3rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ color: '#64b5f6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span> Categorías
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', opacity: 0.8 }}>Desde mini-sumo hasta combate destructivo.</p>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ color: '#64b5f6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🏆</span> Premios
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', opacity: 0.8 }}>Reconocimientos especiales y premios en efectivo.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="steps-grid" style={{ marginBottom: '4rem', justifyContent: 'center', width: '100%', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="speaker-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 'none', flex: 1 }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Networking Real</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: '0 auto' }}>
              Conecta con más de 500 personas apasionadas por la tecnología, intercambia ideas y crea alianzas estratégicas para tu futuro profesional.
            </p>
          </div>
          <div className="speaker-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 'none', flex: 1 }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Ambiente Universitario</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: '0 auto' }}>
              Vive la experiencia UMG en todo su esplendor, compartiendo con estudiantes de diversas sedes en un ambiente de aprendizaje y sana convivencia.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '2rem' }}>¿Qué esperas para ser parte de esto?</h3>
          <div className="hero-ctas" style={{ justifyContent: 'center' }}>
            <button className="btn-lg btn-lg-primary" onClick={() => window.dispatchEvent(new Event('openRegisterModal'))}>
              Inscribirme ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
