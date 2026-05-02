import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { getAllUsersQuery } from '../../../api/supabase/users/userQueries';
import { syncUserEnrollmentsMutation } from '../../../api/supabase/enrollment/enrollmentMutations';
import type { UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import LocationLink from '../../../components/LocationLink';
import StatusCard from '../../../components/ui/StatusCard';
import EnrollmentStep from '../../../components/ui/EnrollmentStep';
import { Icons } from '../../../components/Icons';

export default function DashboardHome() {
  const { user, refetchProfile } = useAuth();
  const [workshopsCount, setWorkshopsCount] = useState(0);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // AUTOLIMPIEZA (Parche para RLS): Si el pago fue anulado pero aún tiene talleres en BD,
    // usamos la sesión del propio usuario para borrarlos y liberar el cupo.
    if (user && user.rol !== 'admin' && !user.pagoValidado && user.talleres && user.talleres.length > 0) {
      syncUserEnrollmentsMutation(user.id!, []).then(() => {
        refetchProfile();
      });
    }

    if (user?.rol !== 'admin' && user?.correo) {
      const saved = localStorage.getItem(`workshops_${user.correo}`);
      if (saved) {
        setWorkshopsCount(JSON.parse(saved).length);
      } else {
        setWorkshopsCount(user?.talleres?.length || 0);
      }
    }

    if (user?.rol === 'admin') {
      setLoadingAdmin(true);
      getAllUsersQuery().then(data => {
        setAllUsers(data);
        setLoadingAdmin(false);
      });
    }
  }, [user]);


  const isPaid = user?.pagoValidado;
  const isSent = user?.pagoEnviado;

  // Vista Administrador
  if (user?.rol === 'admin') {
    const participants = allUsers.filter(u => u.rol !== 'admin');
    const totalUsers = participants.length;
    const paidUsers = participants.filter(u => u.pagoValidado).length;
    const studentUsers = participants.filter(u => u.tipoParticipante === 'alumno').length;
    const externalUsers = participants.filter(u => u.tipoParticipante === 'externo').length;
    const adminsCount = allUsers.filter(u => u.rol === 'admin').length;
    const deactivatedUsers = participants.filter(u => u.desactivado).length;

    return (
      <div className="dashboard-home">
        <ModuleTitle title="Inicio (Panel Administrativo)" />

        <div className="status-grid-container">
          <StatusCard label="TOTAL PARTICIPANTES" value={loadingAdmin ? '...' : totalUsers} sub="Excluye administradores" accentColor="#228be6" icon={<Icons.Users />} />
          <StatusCard label="PAGOS VALIDADOS" value={loadingAdmin ? '...' : paidUsers} sub="Inscripciones completadas" accentColor="#40c057" icon={<Icons.CheckCircle />} />
          <StatusCard label="ESTUDIANTES UMG" value={loadingAdmin ? '...' : studentUsers} sub="Alumnos universitarios" accentColor="#1c7ed6" icon={<Icons.Layout />} />
          <StatusCard label="PARTICIPANTES EXTERNOS" value={loadingAdmin ? '...' : externalUsers} sub="Profesionales y público" accentColor="#f59f00" icon={<Icons.Users />} />
          <StatusCard label="ADMINISTRADORES" value={loadingAdmin ? '...' : adminsCount} sub="Personal del evento" accentColor="#862e9c" icon={<Icons.CheckCircle />} />
        </div>

        <section className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Resumen del Congreso</h2>
            <p>Métricas generales sobre el estado de las inscripciones y los participantes.</p>
          </div>

          <div className="steps-vertical">
            <EnrollmentStep 
              status="completed" icon={<Icons.Layout />} title="Tipos de Participantes" 
              description={`Actualmente hay ${studentUsers} alumnos UMG y ${externalUsers} participantes externos registrados.`} 
              badgeLabel="Informativo" badgeVariant="neutral" 
            />
            <EnrollmentStep 
              status="in-progress" icon={<Icons.CreditCard />} title="Estado Financiero General" 
              description={`${paidUsers} usuarios han completado el proceso de pago. Aún faltan ${totalUsers - paidUsers} cuentas por validar.`} 
              badgeLabel="En Revisión" badgeVariant="warning" 
            />
            {deactivatedUsers > 0 && (
              <EnrollmentStep 
                status="pending" icon={<Icons.AlertTriangle />} title="Cuentas Inactivas" 
                description={`Existen ${deactivatedUsers} usuario(s) con cuenta desactivada.`} 
                badgeLabel="Atención" badgeVariant="danger" 
              />
            )}
          </div>
        </section>
        
        <style>{`.status-grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }`}</style>
      </div>
    );
  }

  // Vista Usuario
  const hasDpi = user?.dpi && user.dpi.trim().length > 0;
  const workshopsReady = workshopsCount > 0 && isPaid;
  const diplomaReady = user?.diplomaEditado;

  return (
    <div className="dashboard-home">
      <ModuleTitle title="Inicio" />

      <div className="status-grid-container">
        <StatusCard 
          label="ESTADO DE PAGO" accentColor={isPaid ? '#40c057' : isSent ? '#fab005' : '#fa5252'}
          badge={isPaid ? <span className="step-badge success">Validado</span> : isSent ? <span className="step-badge warning">En revisión</span> : <span className="step-badge danger">Pendiente</span>}
          sub={isPaid ? 'Inscripción activa' : isSent ? 'Validando comprobante' : 'Pago requerido para participar'}
          footerLink="Ver detalles de pago →" onClick={() => navigate('/dashboard/pago')}
        />

        <StatusCard 
          label="TALLERES" value={workshopsCount} accentColor={workshopsCount > 0 ? '#228be6' : '#adb5bd'}
          sub={workshopsCount === 1 ? 'Taller seleccionado' : 'Talleres en tu agenda'}
          footerLink="Gestionar talleres →" onClick={() => navigate('/dashboard/talleres')}
        />

        <StatusCard 
          label="DIPLOMA" accentColor={diplomaReady ? '#7950f2' : '#adb5bd'}
          badge={diplomaReady ? <span className="step-badge success" style={{ backgroundColor: '#f3f0ff', color: '#7950f2', border: '1px solid #d0bfff' }}>Confirmado</span> : <span className="step-badge neutral">Pendiente</span>}
          sub={diplomaReady ? 'Datos listos para impresión' : 'Confirma tus datos aquí'}
          footerLink="Revisar datos →" onClick={() => navigate('/dashboard/diploma')}
        />

        <StatusCard 
          label="FECHA EVENTO" value="23 de Mayo" accentColor="#15aabf" sub="Hotel Alcazar doña Victoria"
          icon={<Icons.Calendar />}
          footerLink="Añadir a Calendario →" onClick={() => window.open('https://www.google.com/calendar/render?action=TEMPLATE&text=CONGRESO+2026+UMG+SISTEMAS+COBÁN&dates=20260523T140000Z/20260523T230000Z&details=El+evento+académico+más+importante+del+año.&location=Hotel+Alcazar+doña+Victoria,+Cobán', '_blank')}
        />
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Resumen de Inscripción</h2>
          <p>Haz clic en cualquier paso para ir directamente al módulo correspondiente.</p>
        </div>

        <div className="steps-vertical">
          <EnrollmentStep 
            status={hasDpi ? "completed" : "pending"} icon={hasDpi ? <Icons.Check /> : <Icons.Users />}
            title={hasDpi ? "Perfil completo" : "Datos de perfil pendientes"}
            description={hasDpi ? "Los datos del perfil han sido registrados y actualizados correctamente" : "Por favor, ingresa tu número de DPI para completar tu perfil"}
            badgeLabel={hasDpi ? "Completado" : "Pendiente"} badgeVariant={hasDpi ? "success" : "warning"}
            onClick={() => navigate('/dashboard/perfil')}
          />

          <EnrollmentStep 
            status={isPaid ? "completed" : isSent ? "in-progress" : "pending"} 
            icon={isPaid ? <Icons.Check /> : <Icons.CreditCard />}
            title="Validación de Pago"
            description={isPaid ? "Inscripción activada correctamente" : isSent ? "Comprobante recibido, en revisión" : "Pendiente de realizar pago"}
            badgeLabel={isPaid ? "Completado" : isSent ? "En proceso" : "Pendiente"}
            badgeVariant={isPaid ? "success" : isSent ? "warning" : "danger"}
            onClick={() => navigate('/dashboard/pago')}
          />

          <EnrollmentStep 
            status={workshopsReady ? "completed" : workshopsCount > 0 ? "in-progress" : "pending"}
            icon={workshopsReady ? <Icons.Check /> : <Icons.Layout />}
            title="Selección de Talleres"
            description={workshopsCount > 0 ? `${workshopsCount} talleres en tu agenda` : "Elige los talleres de tu interés"}
            badgeLabel={workshopsReady ? "Completado" : "Pendiente"}
            badgeVariant={workshopsReady ? "success" : "neutral"}
            onClick={() => navigate('/dashboard/talleres')}
          />

          <EnrollmentStep 
            status={diplomaReady ? "completed" : "pending"}
            icon={diplomaReady ? <Icons.Check /> : <Icons.Award />}
            title="Confirmación de Diploma"
            description={diplomaReady ? "Datos del diploma confirmados" : "Confirma tu nombre y correo para el diploma"}
            badgeLabel={diplomaReady ? "Completado" : "Pendiente"}
            badgeVariant={diplomaReady ? "success" : "neutral"}
            onClick={() => navigate('/dashboard/diploma')}
          />
        </div>
      </section>

      <LocationLink variant="banner" />
      
      <style>{`.status-grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }`}</style>
    </div>
  );
}
