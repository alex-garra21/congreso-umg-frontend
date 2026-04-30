import { useState, useEffect } from 'react';
import { getGeneralReportQuery } from '../../../api/supabase/reports/reportQueries';
import { type UserData } from '../../../utils/auth';
import { getAgenda, type AgendaItem } from '../../../utils/agendaStore';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import SearchBar from '../../../components/ui/SearchBar';
import AdminSelect from '../../../components/ui/AdminSelect';
import ModuleCard from '../../../components/ui/ModuleCard';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ReportsModule() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [agenda] = useState<AgendaItem[]>(getAgenda());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all_records');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<'all' | 'alumno' | 'externo'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getGeneralReportQuery().then(setUsers);
  }, []);

  const getWorkshopTitle = (id: string) => {
    const w = agenda.find(item => item.id === id);
    return w ? w.title : id;
  };

  const filteredUsers = users.filter(u => u.rol !== 'admin' && !u.desactivado).filter(u => {
    const matchesSearch = u.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkshop = selectedWorkshopFilter === 'all_records'
      ? true
      : selectedWorkshopFilter === ''
        ? (u.talleres && u.talleres.length > 0)
        : selectedWorkshopFilter === 'none'
          ? (!u.talleres || u.talleres.length === 0)
          : (u.talleres && u.talleres.includes(selectedWorkshopFilter));

    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
    const matchesType = participantTypeFilter === 'all' || u.tipoParticipante === participantTypeFilter;

    return matchesSearch && matchesWorkshop && matchesPayment && matchesType;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const exportToExcel = async () => {
    if (filteredUsers.length === 0) {
      showToast('No hay datos para exportar.', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participantes');

    const columnTitle = (selectedWorkshopFilter && selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none') ? 'Taller' : 'Talleres';

    worksheet.columns = [
      { header: 'Participante', key: 'name', width: 30 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
      { header: columnTitle, key: 'workshops', width: 40 },
      { header: 'Sexo', key: 'gender', width: 15 },
      { header: 'Tipo de Participante', key: 'type', width: 25 },
      { header: 'Carné', key: 'idCard', width: 15 },
      { header: 'Ciclo', key: 'cycle', width: 10 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Estado de Pago', key: 'payment', width: 20 },
    ];

    filteredUsers.forEach(u => {
      const isSpecificWorkshop = selectedWorkshopFilter !== '' && selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none';

      const workshopsText = isSpecificWorkshop
        ? getWorkshopTitle(selectedWorkshopFilter)
        : (u.talleres?.map(tid => getWorkshopTitle(tid)).join(', ') || '-');

      worksheet.addRow({
        name: u.nombreDiploma || `${u.nombres} ${u.apellidos}`,
        email: u.correoDiploma || u.correo,
        workshops: workshopsText,
        gender: u.sexo === 'M' ? 'Hombre' : 'Mujer',
        type: u.tipoParticipante === 'alumno' ? 'Estudiante UMG' : (u.tipoParticipante === 'externo' ? 'Externo' : '-'),
        idCard: u.tipoParticipante === 'alumno' ? (u.carnet || '-') : '-',
        cycle: u.tipoParticipante === 'alumno' ? (u.ciclo || '-') : '-',
        phone: u.telefono || '-',
        payment: u.pagoValidado ? 'Pagado' : 'Sin pagar'
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const workshopSuffix = selectedWorkshopFilter === 'all_records'
      ? ' - Todos los registros'
      : selectedWorkshopFilter === ''
        ? ' - Todos los talleres'
        : selectedWorkshopFilter === 'none'
          ? ' - Sin talleres asignados'
          : ` - ${getWorkshopTitle(selectedWorkshopFilter)}`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Congreso_2026${workshopSuffix}.xlsx`);
  };

  const exportDiplomasToExcel = async () => {
    if (filteredUsers.length === 0) {
      showToast('No hay datos para exportar.', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista para Diplomas');

    const columnTitle = (selectedWorkshopFilter && selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none') ? 'Taller' : 'Talleres';

    worksheet.columns = [
      { header: 'Participante', key: 'name', width: 35 },
      { header: 'Correo Electrónico', key: 'email', width: 35 },
      { header: columnTitle, key: 'workshops', width: 45 }
    ];

    filteredUsers.forEach(u => {
      const isSpecificWorkshop = selectedWorkshopFilter !== '' && selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none';

      const workshopsText = isSpecificWorkshop
        ? getWorkshopTitle(selectedWorkshopFilter)
        : (u.talleres?.map(tid => getWorkshopTitle(tid)).join(', ') || '-');

      worksheet.addRow({
        name: u.nombreDiploma || `${u.nombres} ${u.apellidos}`,
        email: u.correoDiploma || u.correo,
        workshops: workshopsText
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const workshopSuffix = selectedWorkshopFilter === 'all_records'
      ? ' - Todos los registros'
      : selectedWorkshopFilter === ''
        ? ' - Todos los talleres'
        : selectedWorkshopFilter === 'none'
          ? ' - Sin talleres asignados'
          : ` - ${getWorkshopTitle(selectedWorkshopFilter)}`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Lista_Diplomas_2026${workshopSuffix}.xlsx`);
  };

  return (
    <section className="dashboard-section">
      <ModuleTitle title="Reportes" />

      <ModuleCard
        title="Reporte de Inscritos"
        description="Visualiza y exporta la lista de participantes con sus detalles de inscripción y talleres."
        headerActions={
          <div style={{ display: 'flex', gap: '1rem' }}>
            <AdminButton variant="success" onClick={exportToExcel}>Exportar Excel (Completo)</AdminButton>
            <AdminButton variant="secondary" onClick={exportDiplomasToExcel}>Lista para Diplomas</AdminButton>
          </div>
        }
      >
        <div className="filters-bar-admin" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'flex-end', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
          <SearchBar 
            value={searchTerm} 
            onChange={(val) => { setSearchTerm(val); setPage(1); }} 
            placeholder="Buscar participante..." 
            style={{ flex: 2, minWidth: '200px' }} 
          />
          <AdminSelect 
            label="Taller"
            value={selectedWorkshopFilter} 
            onChange={(e) => { setSelectedWorkshopFilter(e.target.value); setPage(1); }}
            containerStyle={{ flex: 1, minWidth: '150px' }}
            options={[
              { value: 'all_records', label: 'Todos los registros' },
              { value: 'none', label: 'Sin talleres' },
              { value: '', label: 'Todos los talleres' },
              ...agenda.filter(a => a.speaker).map(w => ({ value: w.id, label: w.title }))
            ]}
          />
          <AdminSelect 
            label="Estado"
            value={paymentFilter} 
            onChange={(e) => { setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid'); setPage(1); }}
            containerStyle={{ flex: 1, minWidth: '150px' }}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'paid', label: 'Pagados' },
              { value: 'unpaid', label: 'Pendientes' }
            ]}
          />
          <AdminSelect 
            label="Tipo"
            value={participantTypeFilter} 
            onChange={(e) => { setParticipantTypeFilter(e.target.value as 'all' | 'alumno' | 'externo'); setPage(1); }}
            containerStyle={{ flex: 1, minWidth: '150px' }}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'alumno', label: 'Estudiantes UMG' },
              { value: 'externo', label: 'Externos' }
            ]}
          />
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Taller</th>
                <th>Tipo</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.correo}>
                  <td>
                    <strong>{u.nombres} {u.apellidos}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{u.correo}</div>
                  </td>
                  <td>
                    {(() => {
                      const isSpecificWorkshop = selectedWorkshopFilter !== '' && selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none';
                      if (isSpecificWorkshop) {
                        return getWorkshopTitle(selectedWorkshopFilter);
                      }
                      return u.talleres && u.talleres.length > 0 
                        ? (u.talleres.map(tid => getWorkshopTitle(tid)).join(', ')) 
                        : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Ninguno</span>;
                    })()}
                  </td>
                  <td>{u.tipoParticipante === 'alumno' ? 'UMG' : 'Externo'}</td>
                  <td>
                    {u.pagoValidado ? (
                      <AdminBadge variant="success" dot>Pagado</AdminBadge>
                    ) : (
                      <AdminBadge variant="warning" dot>Pendiente</AdminBadge>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>No se encontraron participantes con los filtros seleccionados.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} />
      </ModuleCard>
    </section>
  );
}
