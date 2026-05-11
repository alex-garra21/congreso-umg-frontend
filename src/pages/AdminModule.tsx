import { lazy, Suspense } from 'react';

const TokensModule = lazy(() => import('../modules/admin/tokens/TokensModule'));
const UsersModule = lazy(() => import('../modules/admin/usuarios/UsersModule'));
const AttendanceModule = lazy(() => import('../modules/admin/asistencia/AttendanceModule'));
const ReportsModule = lazy(() => import('../modules/admin/reportes/ReportsModule'));
const AgendaModule = lazy(() => import('../modules/admin/agenda/AgendaModule'));

interface AdminModuleProps {
  defaultTab: 'tokens' | 'users' | 'reports' | 'agenda' | 'attendance';
}

export default function AdminModule({ defaultTab }: AdminModuleProps) {
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
      </Suspense>
    </div>
  );
}
