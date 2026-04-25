import { useNavigate } from 'react-router-dom';
// 1. Aquí importas tu imagen. 
// (Asegúrate de tener un archivo llamado así en la carpeta assets, o cambia el nombre)
import logoUMG from '../assets/UMG-LOGO.svg';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="hero-accent"></div>

      <div className="hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '4rem', maxWidth: '1100px', margin: '0 auto', flexWrap: 'wrap' }}>

        {/* Lado Derecho: Texto */}
        <div style={{ flex: '1.2 1 400px', position: 'relative', zIndex: 2 }}>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Inscripciones abiertas
          </div>      {/* Contenedor vertical principal para el texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Fila 1: Logo y Título Principal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <img
                src={logoUMG}
                alt="Logo UMG"
                style={{
                  width: '100%',
                  maxWidth: '140px',
                  borderRadius: '12px',
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.1))'
                }}
              />
              <h1 style={{ margin: 0 }}>CONGRESO<br /><span>2026</span> UMG</h1>
            </div>

            {/* Fila 2: El lugar (Sistemas Cobán) */}
            <h2 style={{ margin: 0 }}>SISTEMAS COBÁN</h2>

            {/* Fila 3: Descripción del evento */}
            <p className="hero-sub" style={{ margin: 0, maxWidth: '600px' }}>
              El evento académico más importante del año. Elige las charlas de tu interés, realiza tu pago y confirma tu asistencia con tecnología QR.
            </p>

            {/* Fila 4: Metadata (Chips de información) */}
            <div className="hero-meta" style={{ margin: '0.5rem 0 1rem 0' }}>
              <a 
                href="https://www.google.com/calendar/render?action=TEMPLATE&text=CONGRESO+2026+UMG+SISTEMAS+COBÁN&dates=20260523T140000Z/20260523T230000Z&details=El+evento+académico+más+importante+del+año.&location=Hotel+Alcazar+doña+Victoria,+Cobán" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="meta-chip" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                📅 23 de mayo, 2026
              </a>
              <a 
                href="https://maps.app.goo.gl/drwTJp68mjcYne5S9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="meta-chip" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                📍 Hotel Alcazar doña Victoria, Cobán
              </a>
              <span
                className="meta-chip"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/ponentes')}
                title="Ver ponentes"
              >
                🎤 12 ponentes
              </span>
              <span
                className="meta-chip"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/agenda')}
                title="Ver la agenda de charlas"
              >
                ⏱ 30+ charlas simultáneas
              </span>
            </div>

            {/* Fila 5: Botones de Acción */}
            <div className="hero-ctas">
              <button className="btn-lg btn-lg-primary" onClick={() => navigate('/inscripcion')}>
                Inscribirme al congreso
              </button>
              <button className="btn-lg btn-lg-outline" onClick={() => navigate('/agenda')}>
                Ver agenda
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}