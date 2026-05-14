import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../api/hooks/useAuth';

const TokensModule = lazy(() => import('../modules/admin/tokens/TokensModule'));
const UsersModule = lazy(() => import('../modules/admin/usuarios/UsersModule'));
const AttendanceModule = lazy(() => import('../modules/admin/asistencia/AttendanceModule'));
const ReportsModule = lazy(() => import('../modules/admin/reportes/ReportsModule'));
const AgendaModule = lazy(() => import('../modules/admin/agenda/AgendaModule'));
const AgendaConfigModule = lazy(() => import('../modules/admin/agenda/AgendaConfigModule'));

interface AdminModuleProps {
  defaultTab: 'tokens' | 'users' | 'reports' | 'agenda' | 'attendance' | 'agenda-config';
}

export default function AdminModule({ defaultTab }: AdminModuleProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.rol === 'admin';
  const isColaborador = currentUser?.rol === 'colaborador';

  if (!isAdmin && !isColaborador) {
    return <Navigate to="/dashboard/inicio" replace />;
  }

  return (
    <div className="admin-module">
      <Suspense fallback={
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando panel...
        </div>
      }>
        {defaultTab === 'tokens' && <TokensModule />}
        {defaultTab === 'users' && <UsersModule />}
        {defaultTab === 'attendance' && <AttendanceModule />}
        {defaultTab === 'reports' && <ReportsModule />}
        {defaultTab === 'agenda' && <AgendaModule />}
        {defaultTab === 'agenda-config' && <AgendaConfigModule />}
      </Suspense>
    </div>
  );
}