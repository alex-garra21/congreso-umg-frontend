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
import { PARTICIPANT_TYPES, getParticipantLabel } from '../../../data/userTypes';
import MultiSelectFilter from '../../../components/ui/MultiSelectFilter';

export default function ReportsModule() {
  const { data: users = [], isLoading: isLoadingUsers } = useGeneralReport();
  const { data: agenda = [] } = useCharlas();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all_records');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<string[]>(PARTICIPANT_TYPES.map(t => t.id));
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
    const matchesType = participantTypeFilter.length === PARTICIPANT_TYPES.length 
      ? true 
      : participantTypeFilter.includes(u.tipoParticipante || 'externo');

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

    // 1. Encontrar el número máximo de talleres que tiene un participante
    const maxWorkshops = Math.max(...filteredUsers.map(u => u.talleres?.length || 0), 1);
    
    // 2. Definir las columnas base
    const columns = [
      { header: 'Participante', key: 'name', width: 30 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
    ];

    // 3. Añadir columnas dinámicas para talleres
    for (let i = 1; i <= maxWorkshops; i++) {
      columns.push({ header: `Taller ${i}`, key: `workshop${i}`, width: 35 });
    }

    // 4. Añadir el resto de columnas de información
    columns.push(
      { header: 'Sexo', key: 'gender', width: 15 },
      { header: 'Tipo de Participante', key: 'type', width: 25 },
      { header: 'Carné / Código', key: 'idCard', width: 15 },
      { header: 'Ciclo', key: 'cycle', width: 10 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Estado de Pago', key: 'payment', width: 20 }
    );

    worksheet.columns = columns;

    // 5. Llenar los datos
    filteredUsers.forEach(u => {
      const rowData: any = {
        name: getDisplayName(u),
        email: u.correoDiploma || u.correo,
        gender: u.sexo === 'M' ? 'Hombre' : 'Mujer',
        type: getParticipantLabel(u.tipoParticipante),
        idCard: u.carnet || '-',
        cycle: u.ciclo || '-',
        phone: u.telefono || '-',
        payment: u.pagoValidado ? 'Pagado' : 'Sin pagar'
      };

      // Asignar cada taller a su propia columna
      if (u.talleres && u.talleres.length > 0) {
        u.talleres.forEach((tid: string, index: number) => {
          rowData[`workshop${index + 1}`] = getWorkshopTitle(tid);
        });
      }

      worksheet.addRow(rowData);
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

    // Filtro de tipo inteligente
    if (participantTypeFilter.length === PARTICIPANT_TYPES.length) {
      filtersSuffix += '_Todos';
    } else {
      const selectedLabels = PARTICIPANT_TYPES
        .filter(t => participantTypeFilter.includes(t.id))
        .map(t => t.label.replace(/\s+/g, ''));
      
      if (participantTypeFilter.includes('alumno') && participantTypeFilter.includes('docente') && participantTypeFilter.length === 2) {
        filtersSuffix += '_ComunidadUMG';
      } else {
        filtersSuffix += `_${selectedLabels.join('_')}`;
      }
    }

    const timestamp = new Date().toLocaleDateString('es-GT').replace(/\//g, '-') + '_' + new Date().getHours() + 'h' + new Date().getMinutes();
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_General_${timestamp}${filtersSuffix}.xlsx`);
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

    // Filtro de tipo inteligente
    if (participantTypeFilter.length === PARTICIPANT_TYPES.length) {
      filtersSuffix += '_Todos';
    } else {
      const selectedLabels = PARTICIPANT_TYPES
        .filter(t => participantTypeFilter.includes(t.id))
        .map(t => t.label.replace(/\s+/g, ''));
      
      if (participantTypeFilter.includes('alumno') && participantTypeFilter.includes('docente') && participantTypeFilter.length === 2) {
        filtersSuffix += '_ComunidadUMG';
      } else {
        filtersSuffix += `_${selectedLabels.join('_')}`;
      }
    }

    const timestamp = new Date().toLocaleDateString('es-GT').replace(/\//g, '-') + '_' + new Date().getHours() + 'h' + new Date().getMinutes();
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Lista_Diplomas_${timestamp}${filtersSuffix}.xlsx`);
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
          <MultiSelectFilter 
            label="Tipo"
            options={PARTICIPANT_TYPES.map(t => ({ id: t.id, label: t.label }))}
            selectedIds={participantTypeFilter}
            onChange={(ids) => { setParticipantTypeFilter(ids); setPage(1); }}
            containerStyle={{ flex: 1, minWidth: '180px' }}
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
                  <td>{getParticipantLabel(u.tipoParticipante)}</td>
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
