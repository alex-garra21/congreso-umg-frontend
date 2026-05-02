import { useState } from 'react';
import { useGeneralReport } from '../../../api/hooks/useReports';
import { useCharlas } from '../../../api/hooks/useAgenda';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast } from '../../../utils/swal';
import { Pagination } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import SearchBar from '../../../components/ui/SearchBar';
import AdminSelect from '../../../components/ui/AdminSelect';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminTable from '../../../components/ui/AdminTable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function ReportsModule() {
  const { data: users = [], isLoading: isLoadingUsers } = useGeneralReport();
  const { data: agenda = [] } = useCharlas();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all_records');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<'all' | 'alumno' | 'externo'>('all');
  const [page, setPage] = useState(1);

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

  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10);

  const getDisplayName = (u: any) => {
    if (u.nombreDiploma && u.nombreDiploma.trim() !== '') {
      return u.nombreDiploma;
    }
    const firstName = u.nombres.trim().split(' ')[0] || '';
    const firstSurname = u.apellidos.trim().split(' ')[0] || '';
    return `${firstName} ${firstSurname}`.trim();
  };

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
        name: getDisplayName(u),
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

    // Generar sufijos descriptivos para el nombre del archivo
    let filtersSuffix = '';
    
    // Filtro de taller
    filtersSuffix += selectedWorkshopFilter === 'all_records'
      ? '_Todos'
      : selectedWorkshopFilter === ''
        ? '_ConTalleres'
        : selectedWorkshopFilter === 'none'
          ? '_SinTalleres'
          : `_${getWorkshopTitle(selectedWorkshopFilter).replace(/\s+/g, '_')}`;

    // Filtro de pago
    if (paymentFilter !== 'all') {
      filtersSuffix += paymentFilter === 'paid' ? '_Pagados' : '_Pendientes';
    }

    // Filtro de tipo
    if (participantTypeFilter !== 'all') {
      filtersSuffix += participantTypeFilter === 'alumno' ? '_EstudiantesUMG' : '_Externos';
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Congreso_2026${filtersSuffix}.xlsx`);
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
        name: getDisplayName(u),
        email: u.correoDiploma || u.correo,
        workshops: workshopsText
      });
    });

    worksheet.getRow(1).font = { bold: true };

    // Generar sufijos descriptivos para el nombre del archivo
    let filtersSuffix = '';
    
    // Filtro de taller
    filtersSuffix += selectedWorkshopFilter === 'all_records'
      ? '_Todos'
      : selectedWorkshopFilter === ''
        ? '_ConTalleres'
        : selectedWorkshopFilter === 'none'
          ? '_SinTalleres'
          : `_${getWorkshopTitle(selectedWorkshopFilter).replace(/\s+/g, '_')}`;

    // Filtro de pago
    if (paymentFilter !== 'all') {
      filtersSuffix += paymentFilter === 'paid' ? '_Pagados' : '_Pendientes';
    }

    // Filtro de tipo
    if (participantTypeFilter !== 'all') {
      filtersSuffix += participantTypeFilter === 'alumno' ? '_EstudiantesUMG' : '_Externos';
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Lista_Diplomas_2026${filtersSuffix}.xlsx`);
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
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap', 
          marginBottom: '2rem', 
          alignItems: 'flex-end', 
          background: 'var(--bg-secondary)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-soft)'
        }}>
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

        {isLoadingUsers ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div className="loader-spinner" style={{ margin: '0 auto 1rem' }}></div>
            Cargando datos del reporte...
          </div>
        ) : (
          <>
            <AdminTable headers={["Participante", "Taller", "Tipo", "Pago"]} emptyMessage="No se encontraron participantes con los filtros seleccionados.">
              {paginatedUsers.map(u => (
                <tr key={u.correo}>
                  <td>
                    <strong>{getDisplayName(u)}</strong>
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
            </AdminTable>
            <Pagination 
              current={page} 
              total={filteredUsers.length} 
              onPageChange={setPage} 
              itemsPerPage={10}
            />
          </>
        )}
      </ModuleCard>
    </section>
  );
}
