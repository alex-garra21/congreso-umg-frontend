import TokensModule from '../modules/admin/tokens/TokensModule';
import UsersModule from '../modules/admin/usuarios/UsersModule';
import AttendanceModule from '../modules/admin/asistencia/AttendanceModule';
import ReportsModule from '../modules/admin/reportes/ReportsModule';
import AgendaModule from '../modules/admin/agenda/AgendaModule';

interface AdminModuleProps {
  defaultTab: 'tokens' | 'users' | 'reports' | 'agenda' | 'attendance';
}

export default function AdminModule({ defaultTab }: AdminModuleProps) {
  return (
    <div className="admin-module">
      {defaultTab === 'tokens' && <TokensModule />}
      {defaultTab === 'users' && <UsersModule />}
      {defaultTab === 'attendance' && <AttendanceModule />}
      {defaultTab === 'reports' && <ReportsModule />}
      {defaultTab === 'agenda' && <AgendaModule />}
    </div>
  );
}
