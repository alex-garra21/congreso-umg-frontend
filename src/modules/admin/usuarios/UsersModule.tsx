import { useState } from 'react';
import { useAllUsers, useUpdateUserData, useInvalidatePayment } from '../../../api/hooks/useUsers';
import { type UserData } from '../../../utils/auth';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import SearchBar from '../../../components/ui/SearchBar';
import AdminBadge from '../../../components/ui/AdminBadge';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';

export default function UsersModule() {
  const { data: users = [], isLoading } = useAllUsers();
  const updateUserDataMutation = useUpdateUserData();
  const invalidatePaymentMutation = useInvalidatePayment();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const handleValidateUser = async (user: UserData) => {
    const updated = { ...user, pagoValidado: true };
    await updateUserDataMutation.mutateAsync(updated);
    showToast(`Pago validado para ${user.nombres} ${user.apellidos}`, 'success');
  };

  const handleInvalidatePayment = async (user: UserData) => {
    if (!user.id) return;
    const confirmed = await showConfirm(
      'Anular Pago',
      `¿Estás seguro de que deseas anular el pago de ${user.nombres}? El token utilizado será liberado y el usuario volverá a tener el pago pendiente.`,
      'Sí, anular pago',
      true
    );
    if (confirmed) {
      const result = await invalidatePaymentMutation.mutateAsync(user.id!);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleDeactivateUser = async (user: UserData) => {
    const confirmed = await showConfirm('Desactivar Usuario', `¿Estás seguro de desactivar a ${user.nombres} ${user.apellidos}? No aparecerá en los informes y reportes.`, 'Desactivar', true);
    if (confirmed) {
      const updated = { ...user, desactivado: true };
      await updateUserDataMutation.mutateAsync(updated);
      showToast('Usuario desactivado', 'success');
    }
  };

  const handleActivateUser = async (user: UserData) => {
    const confirmed = await showConfirm('Activar Usuario', `¿Estás seguro de activar nuevamente a ${user.nombres} ${user.apellidos}?`, 'Activar', false);
    if (confirmed) {
      const updated = { ...user, desactivado: false };
      await updateUserDataMutation.mutateAsync(updated);
      showToast('Usuario activado', 'success');
    }
  };

  const handlePromoteToAdmin = async (user: UserData) => {
    const confirmed = await showConfirm('Promover a Administrador', `¿Estás seguro de promover a ${user.nombres} ${user.apellidos} a Administrador?`, 'Promover', false);
    if (confirmed) {
      const updated = { ...user, rol: 'admin' as const };
      await updateUserDataMutation.mutateAsync(updated);
      showToast('Usuario ahora es Administrador', 'success');
    }
  };

  const handleDemoteToUser = async (user: UserData) => {
    const confirmed = await showConfirm('Degradar a Usuario', `¿Estás seguro de degradar a ${user.nombres} ${user.apellidos} a Usuario participante?`, 'Degradar', true);
    if (confirmed) {
      const updated = { ...user, rol: 'usuario' as const };
      await updateUserDataMutation.mutateAsync(updated);
      showToast('Permisos de administrador revocados', 'success');
    }
  };

  const filteredUsers = users.filter((u: UserData) => {
    const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = paymentFilter === 'all' ||
      (paymentFilter === 'paid' && u.pagoValidado && !u.desactivado) ||
      (paymentFilter === 'pending' && !u.pagoValidado && !u.desactivado) ||
      (paymentFilter === 'deactivated' && u.desactivado);

    return matchesSearch && matchesPayment;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <section className="dashboard-section">
      <ModuleTitle title="Gestión de Usuarios" />
      
      <ModuleCard 
        title="Participantes Registrados"
        description="Administra los usuarios del sistema, valida sus pagos y gestiona sus roles."
        headerActions={
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
            <div style={{ flex: 2 }}>
              <SearchBar 
                value={searchTerm} 
                onChange={(val) => { setSearchTerm(val); setPage(1); }} 
                placeholder="Buscar por nombre o correo..." 
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <AdminSelect 
                value={paymentFilter}
                onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'paid', label: 'Pagados' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'deactivated', label: 'Desactivados' }
                ]}
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando usuarios...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado de Pago</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
                  <tr key={u.correo}>
                    <td><strong>{u.nombres} {u.apellidos}</strong></td>
                    <td>{u.correo}</td>
                    <td>
                      {u.rol === 'admin' ? (
                        <AdminBadge variant="purple">Administrador</AdminBadge>
                      ) : (
                        <AdminBadge variant="neutral">Participante</AdminBadge>
                      )}
                    </td>
                    <td>
                      {u.desactivado ? (
                        <AdminBadge variant="danger">Desactivado</AdminBadge>
                      ) : (
                        u.pagoValidado ? (
                          <AdminBadge variant="success">Pagado</AdminBadge>
                        ) : (
                          <AdminBadge variant="danger">Pendiente</AdminBadge>
                        )
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {!u.desactivado && !u.pagoValidado && u.rol !== 'admin' && (
                        <AdminButton size="sm" variant="success" onClick={() => handleValidateUser(u)} style={{ marginRight: '8px' }}>
                          Validar Pago
                        </AdminButton>
                      )}
                      {!u.desactivado && u.pagoValidado && u.rol !== 'admin' && (
                        <AdminButton size="sm" variant="danger" onClick={() => handleInvalidatePayment(u)} style={{ marginRight: '8px' }}>
                          Anular Pago
                        </AdminButton>
                      )}

                      {u.rol === 'admin' ? (
                        <AdminButton size="sm" variant="danger" onClick={() => handleDemoteToUser(u)} style={{ marginRight: '8px' }}>
                          Degradar a Usuario
                        </AdminButton>
                      ) : (
                        !u.desactivado && (
                          <AdminButton size="sm" variant="warning" onClick={() => handlePromoteToAdmin(u)} style={{ marginRight: '8px' }}>
                            Promover a Admin
                          </AdminButton>
                        )
                      )}

                      {u.desactivado ? (
                        <AdminButton size="sm" variant="secondary" onClick={() => handleActivateUser(u)}>
                          Activar
                        </AdminButton>
                      ) : (
                        <AdminButton size="sm" variant="danger" onClick={() => handleDeactivateUser(u)}>
                          Desactivar
                        </AdminButton>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No se encontraron usuarios con los criterios de búsqueda.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} />
      </ModuleCard>
    </section>
  );
}
