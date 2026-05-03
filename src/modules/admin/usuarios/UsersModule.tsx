import { useState } from 'react';
import { useAllUsers, useUpdateUserData, useInvalidatePayment, useAdminValidateUser } from '../../../api/hooks/useUsers';
import { useAuth } from '../../../api/hooks/useAuth';
import { type UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import AdminBadge from '../../../components/ui/AdminBadge';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';
import AdminTable from '../../../components/ui/AdminTable';
import { Icons } from '../../../components/Icons';

export default function UsersModule() {
  const { data: users = [], isLoading } = useAllUsers();
  const updateUserDataMutation = useUpdateUserData();
  const invalidatePaymentMutation = useInvalidatePayment();
  const adminValidateMutation = useAdminValidateUser();
  const { user: currentAdmin } = useAuth();
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const handleValidateUser = async (user: UserData) => {
    if (!user.id) return;
    try {
      await adminValidateMutation.mutateAsync({ userId: user.id, adminId: currentAdmin?.id });
      showToast(`Pago validado para ${user.nombres}`, 'success');
    } catch (error: any) { showToast(`Error al validar: ${error.message}`, 'error'); }
  };

  const handleInvalidatePayment = async (user: UserData) => {
    if (!user.id) return;
    const confirmed = await showConfirm('Anular Pago', `¿Anular pago de ${user.nombres}? El token se liberará.`, 'Sí, anular', true);
    if (confirmed) {
      const result = await invalidatePaymentMutation.mutateAsync(user.id!);
      showToast(result.message, result.success ? 'success' : 'error');
    }
  };

  const handleToggleActivation = async (user: UserData, activate: boolean) => {
    const title = activate ? 'Activar' : 'Desactivar';
    const confirmed = await showConfirm(`${title} Usuario`, `¿Estás seguro de ${title.toLowerCase()} a ${user.nombres}?`, title, !activate);
    if (confirmed) {
      await updateUserDataMutation.mutateAsync({ ...user, desactivado: !activate });
      showToast(`Usuario ${activate ? 'activado' : 'desactivado'}`, 'success');
    }
  };

  const handleRoleChange = async (user: UserData, toAdmin: boolean) => {
    const title = toAdmin ? 'Promover a Admin' : 'Degradar a Usuario';
    const confirmed = await showConfirm(title, `¿Confirmar cambio de rol para ${user.nombres}?`, toAdmin ? 'Promover' : 'Degradar', !toAdmin);
    if (confirmed) {
      await updateUserDataMutation.mutateAsync({ ...user, rol: toAdmin ? 'admin' : 'usuario' });
      showToast('Rol actualizado', 'success');
      if (!toAdmin && user.id === currentAdmin?.id) {
        setTimeout(() => window.location.href = '/dashboard/inicio', 2000);
      }
    }
  };

  const filteredUsers = users.filter((u: UserData) => {
    const matchesSearch = (u.nombres + ' ' + u.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado && !u.desactivado) || (paymentFilter === 'pending' && !u.pagoValidado && !u.desactivado) || (paymentFilter === 'deactivated' && u.desactivado);
    return matchesSearch && matchesPayment;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <section className="dashboard-section" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Directorio de Usuarios" />
      </div>

      <ModuleCard 
        title="Participantes y Staff"
        description="Gestiona roles, validaciones de pago y estados de cuenta."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
          <SearchBar value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Buscar por nombre o correo electrónico..." />
          <AdminSelect value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} options={[{ value: 'all', label: 'Todos los estados' }, { value: 'paid', label: 'Inscritos (Pagados)' }, { value: 'pending', label: 'Pendientes' }, { value: 'deactivated', label: 'Desactivados' }]} />
        </div>

        <AdminTable 
          isLoading={isLoading} 
          headers={["Nombre Completo", "Contacto", "Rol", "Estado Pago", "Acciones"]}
          emptyMessage="No se encontraron participantes con estos filtros."
        >
          {paginatedUsers.map(u => (
            <tr key={u.correo}>
              <td>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.nombres} {u.apellidos}</div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <Icons.Mail size={14} /> {u.correo}
                </div>
              </td>
              <td>
                <AdminBadge variant={u.rol === 'admin' ? "purple" : "neutral"} dot={u.rol === 'admin'}>
                  {u.rol === 'admin' ? 'Administrador' : 'Participante'}
                </AdminBadge>
              </td>
              <td>
                {u.desactivado ? <AdminBadge variant="danger">Desactivado</AdminBadge> : u.pagoValidado ? <AdminBadge variant="success" dot>Pagado</AdminBadge> : <AdminBadge variant="danger" dot>Pendiente</AdminBadge>}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {/* Acciones de Pago */}
                  {!u.desactivado && u.rol !== 'admin' && (
                    u.pagoValidado ? (
                      <button onClick={() => handleInvalidatePayment(u)} className="action-btn" title="Anular Pago" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                        <Icons.AlertTriangle size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleValidateUser(u)} className="action-btn" title="Validar Pago" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                        <Icons.CheckCircle size={18} />
                      </button>
                    )
                  )}

                  {/* Acciones de Rol */}
                  <button onClick={() => handleRoleChange(u, u.rol !== 'admin')} className="action-btn" title={u.rol === 'admin' ? "Quitar Admin" : "Hacer Admin"} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Icons.Shield size={18} />
                  </button>

                  {/* Acciones de Activación */}
                  <button onClick={() => handleToggleActivation(u, !!u.desactivado)} className="action-btn" title={u.desactivado ? "Activar" : "Desactivar"} style={{ background: u.desactivado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: u.desactivado ? '#16a34a' : '#6b7280', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    {u.desactivado ? <Icons.Plus size={18} /> : <Icons.EyeOff size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        
        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} />
      </ModuleCard>
    </section>
  );
}
