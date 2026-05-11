import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/hooks/useAuth';
import { getAllUsersQuery } from '../../../api/supabase/users/userQueries';
import { syncUserEnrollmentsMutation } from '../../../api/supabase/enrollment/enrollmentMutations';
import { type UserData, isStaff } from '../../../utils/auth';
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
    // AUTOLIMPIEZA (Parche para RLS e integridad de datos): 
    if (user && !isStaff(user.rol) && !user.pagoValidado && user.talleres && user.talleres.length > 0) {
      syncUserEnrollmentsMutation(user.id!, []).then(() => {
        refetchProfile();
      });
    }

    if (user?.correo && !user.pagoValidado && localStorage.getItem(`workshops_confirmed_${user.correo}`)) {
      localStorage.removeItem(`workshops_confirmed_${user.correo}`);
      localStorage.removeItem(`workshops_${user.correo}`);
      localStorage.removeItem(`modifications_count_${user.correo}`);
    }

    if (user?.correo) {
      const dbWorkshops = (user?.talleres || []).filter(w => w.category !== 'GENERAL');
      const saved = localStorage.getItem(`workshops_${user.correo}`);
      
      // Si en la base de datos no hay talleres (fue reseteado), 
      // limpiamos el localStorage para que la interfaz refleje el estado real (rojo)
      if (dbWorkshops.length === 0 && saved) {
        localStorage.removeItem(`workshops_${user.correo}`);
        localStorage.removeItem(`workshops_confirmed_${user.correo}`);
        localStorage.removeItem(`modifications_count_${user.correo}`);
        setWorkshopsCount(0);
      } else if (saved) {
        const allSaved = JSON.parse(saved);
        const onlyWorkshops = allSaved.filter((w: any) => w.category !== 'GENERAL');
        setWorkshopsCount(onlyWorkshops.length);
      } else {
        setWorkshopsCount(dbWorkshops.length);
      }
    }

    if (isStaff(user?.rol)) {
      setLoadingAdmin(true);
      getAllUsersQuery().then(data => {
        setAllUsers(data);
        setLoadingAdmin(false);
      });
    }
  }, [user]);

  const isActualPaid = user?.pagoValidado || false;
  const isSent = user?.pagoEnviado;
  const isOnlyAdmin = user?.rol === 'admin';

  // Procesar datos de admin
  const activeUsers = allUsers.filter(u => !u.desactivado);
  const totalUsersCount = activeUsers.length;
  const paidUsersCount = activeUsers.filter(u => u.pagoValidado).length;
  const studentUsers = activeUsers.filter(u => u.tipoParticipante === 'alumno').length;
  const teacherUsers = activeUsers.filter(u => u.tipoParticipante === 'docente').length;
  const externalUsers = activeUsers.filter(u => u.tipoParticipante === 'externo').length;
  const deactivatedUsers = allUsers.filter(u => u.desactivado).length;

  const hasDpi = user?.dpi && user.dpi.trim().length > 0;
  const workshopsReady = workshopsCount > 0 && isActualPaid;
  const diplomaReady = user?.diplomaEditado || false;

  return (
    <div className="dashboard-home">
      <ModuleTitle title="Inicio" />

      {/* 1. SECCIÓN PERSONAL (Para todos) */}
      <div className="status-grid-container">
        <StatusCard
          label="ESTADO DE PAGO" accentColor={isActualPaid ? 'var(--status-success)' : isSent ? 'var(--status-pending)' : 'var(--status-error)'}
          badge={isActualPaid ? <span className="step-badge-reusable success">{isStaff(user?.rol) ? 'Staff / Validado' : 'Pago Validado'}</span> : isSent ? <span className="step-badge-reusable warning">En revisión</span> : <span className="step-badge-reusable danger">Pendiente</span>}
          sub={isStaff(user?.rol) ? 'Acceso administrativo total' : isSent ? 'Validando comprobante' : 'Pago requerido para participar'}
          footerLink="Ver detalles de pago →" onClick={() => navigate('/dashboard/pago')}
        />

        <StatusCard
          label="TALLERES" value={workshopsCount} accentColor={workshopsReady ? 'var(--status-success)' : 'var(--status-error)'}
          sub={workshopsCount === 1 ? 'Taller seleccionado' : 'Talleres en tu agenda'}
          footerLink="Gestionar talleres →" onClick={() => navigate('/dashboard/talleres')}
        />

        <StatusCard
          label="DIPLOMA" accentColor={diplomaReady ? 'var(--status-success)' : 'var(--status-error)'}
          badge={diplomaReady ? <span className="step-badge-reusable success" style={{ background: 'rgba(121, 80, 242, 0.15)', color: '#7950f2' }}>{isStaff(user?.rol) ? 'Habilitado' : 'Confirmado'}</span> : <span className="step-badge-reusable neutral">Pendiente</span>}
          sub={diplomaReady ? 'Datos listos para impresión' : 'Confirma tus datos aquí'}
          footerLink="Revisar datos →" onClick={() => navigate('/dashboard/diploma')}
        />

        <StatusCard
          label="FECHA EVENTO" value="23 de Mayo" accentColor="var(--status-success)" sub="Hotel Alcazar doña Victoria"
          icon={<Icons.Calendar color="var(--accent-primary)" />}
          footerLink="Añadir a Calendario →" onClick={() => window.open('https://www.google.com/calendar/render?action=TEMPLATE&text=CONGRESO+2026+UMG+SISTEMAS+COBÁN&dates=20260523T140000Z/20260523T230000Z&details=El+evento+académico+más+importante+del+año.&location=Hotel+Alcazar+doña+Victoria,+Cobán', '_blank')}
        />
      </div>

      {/* 2. SECCIÓN ADMINISTRATIVA (Solo Admins) */}
      {isOnlyAdmin && (
        <section className="dashboard-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-soft)', paddingTop: '2.5rem' }}>
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icons.Shield size={24} color="var(--accent-primary)" /> Panel de Control Administrativo
            </h2>
            <p>Métricas globales del evento en tiempo real.</p>
          </div>

          <div className="status-grid-container" style={{ marginTop: '1.5rem' }}>
            <StatusCard label="TOTAL REGISTRADOS" value={loadingAdmin ? '...' : totalUsersCount} sub="Cuentas activas en total" accentColor="var(--accent-primary)" icon={<Icons.Users />} navigateTo="/dashboard/admin-usuarios" />
            <StatusCard label="PAGOS VALIDADOS" value={loadingAdmin ? '...' : paidUsersCount} sub="Inscripciones confirmadas" accentColor="var(--status-success)" icon={<Icons.CheckCircle />} navigateTo="/dashboard/admin-usuarios" />
            <StatusCard label="ESTUDIANTES UMG" value={loadingAdmin ? '...' : studentUsers} sub="Alumnos de la universidad" accentColor="var(--accent-secondary)" icon={<Icons.Layout />} navigateTo="/dashboard/admin-usuarios" />
            <StatusCard label="DOCENTES UMG" value={loadingAdmin ? '...' : teacherUsers} sub="Catedráticos UMG" accentColor="#8b5cf6" icon={<Icons.Award />} navigateTo="/dashboard/admin-usuarios" />
            <StatusCard label="PARTICIPANTES EXTERNOS" value={loadingAdmin ? '...' : externalUsers} sub="Público general" accentColor="var(--status-pending)" icon={<Icons.Users />} navigateTo="/dashboard/admin-usuarios" />
          </div>

          {deactivatedUsers > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <EnrollmentStep
                status="pending"
                icon={<Icons.AlertTriangle />}
                title="Cuentas Inactivas"
                description={`Existen ${deactivatedUsers} usuario(s) con cuenta desactivada que no aparecen en las métricas de participación.`}
                badgeLabel="Atención"
                badgeVariant="danger"
                onClick={() => navigate('/dashboard/admin-usuarios')}
              />
            </div>
          )}
        </section>
      )}

      {/* 3. RESUMEN DE PASOS / INSCRIPCIÓN (Solo para no-admins o vista completa) */}
      <section className="dashboard-section" style={{ marginTop: isOnlyAdmin ? '2rem' : '0' }}>
        <div className="section-header">
          <h2>{isOnlyAdmin ? 'Estado de mi Registro' : 'Resumen de Inscripción'}</h2>
          <p>Haz clic en cualquier paso para ir directamente al módulo correspondiente.</p>
        </div>

        <div className="steps-vertical" style={{ marginTop: '2.5rem' }}>
          <EnrollmentStep
            status={hasDpi ? "completed" : "pending"} icon={hasDpi ? <Icons.Check /> : <Icons.Users />}
            title={hasDpi ? "Perfil completo" : "Datos de perfil pendientes"}
            description={hasDpi ? "Los datos del perfil han sido registrados y actualizados correctamente" : "Por favor, ingresa tu número de DPI para completar tu perfil"}
            badgeLabel={hasDpi ? "Completado" : "Pendiente"} badgeVariant={hasDpi ? "success" : "danger"}
            onClick={() => navigate('/dashboard/perfil')}
          />

          <EnrollmentStep
            status={isActualPaid ? "completed" : isSent ? "in-progress" : "pending"}
            icon={isActualPaid ? <Icons.Check /> : <Icons.CreditCard />}
            title="Validación de Pago"
            description={isActualPaid ? "Inscripción activada correctamente" : isSent ? "Comprobante recibido, en revisión" : "Pendiente de realizar pago"}
            badgeLabel={isActualPaid ? "Completado" : isSent ? "En proceso" : "Pendiente"}
            badgeVariant={isActualPaid ? "success" : isSent ? "danger" : "danger"}
            onClick={() => navigate('/dashboard/pago')}
          />

          <EnrollmentStep
            status={workshopsReady ? "completed" : workshopsCount > 0 ? "in-progress" : "pending"}
            icon={workshopsReady ? <Icons.Check /> : <Icons.Layout />}
            title="Selección de Talleres"
            description={workshopsCount > 0 ? `${workshopsCount} talleres en tu agenda` : "Elige los talleres de tu interés"}
            badgeLabel={workshopsReady ? "Completado" : "Pendiente"}
            badgeVariant={workshopsReady ? "success" : "danger"}
            onClick={() => navigate('/dashboard/talleres')}
          />

          <EnrollmentStep
            status={diplomaReady ? "completed" : "pending"}
            icon={diplomaReady ? <Icons.Check /> : <Icons.Award />}
            title="Confirmación de Diploma"
            description={diplomaReady ? "Datos del diploma confirmados" : "Confirma tu nombre y correo para el diploma"}
            badgeLabel={diplomaReady ? "Completado" : "Pendiente"}
            badgeVariant={diplomaReady ? "success" : "danger"}
            onClick={() => navigate('/dashboard/diploma')}
          />

          <EnrollmentStep
            status={isActualPaid ? "completed" : "pending"}
            icon={isActualPaid ? <Icons.Zap /> : <Icons.Zap />}
            title="Guerra de Robots"
            description={isActualPaid ? "Inscripción y gestión de robots habilitada" : "Habilitado al validar tu pago"}
            badgeLabel={isActualPaid ? "Habilitado" : "Pendiente"}
            badgeVariant={isActualPaid ? "success" : "danger"}
            onClick={() => navigate('/dashboard/robots')}
          />
        </div>
      </section>

      <LocationLink variant="banner" />

      <style>{`.status-grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }`}</style>
    </div>
  );
}
