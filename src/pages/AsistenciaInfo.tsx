import { Icons } from '../components/Icons';
import PublicContainer from '../components/layout/PublicContainer';

export default function AsistenciaInfo() {
  const features = [
    {
      Icon: Icons.QrCode,
      title: "Acceso Instantáneo",
      desc: "Olvídate de las filas. Presenta tu código QR personal desde tu móvil y obtén acceso inmediato a todas las conferencias y talleres. El sistema registrará tu entrada en tiempo real."
    },
    {
      Icon: Icons.Award,
      title: "Diplomas Digitales",
      desc: "Tu asistencia es validada automáticamente por el sistema QR. Al completar el congreso, tu diploma estará listo para descargar desde tu perfil, garantizando la validez de tu participación."
    },
    {
      Icon: Icons.Shield,
      title: "Seguridad y Control",
      desc: "Cada entrada es única y está vinculada a tu perfil. Esto nos permite mantener un control de aforo preciso y garantizar que la experiencia sea cómoda y segura para todos los asistentes."
    }
  ];

  return (
    <PublicContainer
      badge="Tecnología"
      title="Control de Asistencia QR"
      description="Innovación y agilidad en cada entrada."
    >
      <div className="robotics-rules-grid" style={{ marginTop: '2rem' }}>
        {features.map((f, i) => (
          <div key={i} className="robotics-rule-card">
            <div className="robotics-rule-icon">
              <f.Icon size={32} />
            </div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </PublicContainer>
  );
}
