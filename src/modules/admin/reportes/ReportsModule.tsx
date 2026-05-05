import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../api/hooks/useAuth';
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
import { isStaff } from '../../../utils/auth';
import { Icons } from '../../../components/Icons';

export default function ReportsModule() {
  const { data: users = [], isLoading: isLoadingUsers } = useGeneralReport();
  const { data: agenda = [] } = useCharlas();
  const { user: currentUser } = useAuth();
  const isColaborador = currentUser?.rol === 'colaborador';

  // Tipos de participante permitidos según rol
  const allowedParticipantTypes = useMemo(() => {
    return PARTICIPANT_TYPES.filter(t => !(isColaborador && t.id === 'docente'));
  }, [isColaborador]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all_records');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<string[]>(allowedParticipantTypes.map(t => t.id));
  const [page, setPage] = useState(1);

  // Sincronizar filtros si cambia el rol (ej: al cargar la sesión)
  useEffect(() => {
    setParticipantTypeFilter(allowedParticipantTypes.map(t => t.id));
  }, [allowedParticipantTypes]);

  // Forzar selección de un taller para colaboradores
  useEffect(() => {
    if (isColaborador && agenda.length > 0 && (selectedWorkshopFilter === 'all_records' || selectedWorkshopFilter === 'none' || selectedWorkshopFilter === '')) {
      const realWorkshops = agenda.filter(a => a.tagId !== 1 && a.tag?.toUpperCase().trim() !== 'GENERAL');
      if (realWorkshops.length > 0) {
        setSelectedWorkshopFilter(realWorkshops[0].id);
      }
    }
  }, [isColaborador, agenda, selectedWorkshopFilter]);

  const getWorkshopTitle = (id: string) => {
    const w = agenda.find(item => item.id === id);
    return w ? w.title : id;
  };

  // Ayudante para obtener solo talleres reales (excluye GENERAL)
  const getRealWorkshops = (talleres?: { id: string; category: string }[]) => 
    (talleres || []).filter(t => t.category?.toUpperCase().trim() !== 'GENERAL');

  const filteredUsers = users.filter(u => 
    !isStaff(u.rol) && 
    !u.desactivado && 
    !(isColaborador && u.tipoParticipante === 'docente')
  ).filter(u => {
    const matchesSearch = (u.nombres + ' ' + u.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const realWorkshops = getRealWorkshops(u.talleres);
    const matchesWorkshop = selectedWorkshopFilter === 'all_records' 
      ? true 
      : selectedWorkshopFilter === '' 
        ? (realWorkshops.length > 0) 
        : selectedWorkshopFilter === 'none' 
          ? (realWorkshops.length === 0) 
          : (realWorkshops.some(tw => tw.id === selectedWorkshopFilter));

    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);
    const matchesType = participantTypeFilter.length === allowedParticipantTypes.length ? true : participantTypeFilter.includes(u.tipoParticipante || 'externo');

    const matchesAttendance = !isColaborador 
      ? true 
      : selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none' && selectedWorkshopFilter !== ''
        ? (u.asistencias || []).some((a: any) => a.workshopId === selectedWorkshopFilter)
        : (u.asistencias || []).length > 0;

    return matchesSearch && matchesWorkshop && matchesPayment && matchesType && matchesAttendance;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10);

  const getDisplayName = (u: any) => {
    if (u.nombreDiploma && u.nombreDiploma.trim() !== '') return u.nombreDiploma;
    return `${u.nombres.split(' ')[0]} ${u.apellidos.split(' ')[0]}`.trim();
  };

  const exportExcel = async (isDiplomaList = false) => {
    if (filteredUsers.length === 0) { showToast('No hay datos para exportar.', 'warning'); return; }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(isDiplomaList ? 'Diplomas' : 'Reporte_General');
    
    // Si hay un taller específico seleccionado
    const isSpecificWorkshop = selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== '' && selectedWorkshopFilter !== 'none';
    const workshopTitle = isSpecificWorkshop ? getWorkshopTitle(selectedWorkshopFilter) : '';

    if (isDiplomaList) {
      worksheet.columns = [{ header: 'Participante', key: 'name', width: 35 }, { header: 'Correo', key: 'email', width: 35 }, { header: 'Taller(es)', key: 'workshops', width: 45 }];
      filteredUsers.forEach(u => {
        const realW = getRealWorkshops(u.talleres);
        worksheet.addRow({ 
          name: getDisplayName(u), 
          email: u.correoDiploma || u.correo, 
          workshops: isSpecificWorkshop ? workshopTitle : (realW.map(tw => getWorkshopTitle(tw.id)).join(', ') || '-') 
        });
      });
    } else {
      // Columnas Base
      const cols: any[] = [
        { header: 'Participante', key: 'name', width: 30 }, 
        { header: 'Correo', key: 'email', width: 30 },
        { header: 'DPI', key: 'dpi', width: 20 },
        { header: 'Sexo', key: 'sex', width: 15 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: isColaborador ? 'Carnet' : 'Carnet/codigo docente', key: 'identifier', width: 25 }
      ];

      // Si es un taller específico, solo una columna de Taller
      if (isSpecificWorkshop) {
        cols.push({ header: 'Taller', key: 'workshop', width: 35 });
      } else {
        const maxWorkshops = Math.max(...filteredUsers.map(u => getRealWorkshops(u.talleres).length), 1);
        for (let i = 1; i <= maxWorkshops; i++) cols.push({ header: `Taller ${i}`, key: `w${i}`, width: 35 });
      }

      cols.push({ header: 'Tipo', key: 'type', width: 25 }, { header: 'Pago', key: 'pay', width: 15 });
      worksheet.columns = cols;

      filteredUsers.forEach(u => {
        const row: any = { 
          name: getDisplayName(u), 
          email: u.correo, 
          dpi: u.dpi || '-',
          sex: u.sexo || '-',
          phone: u.telefono || '-',
          identifier: u.carnet || u.codigoDocente || '-',
          type: getParticipantLabel(u.tipoParticipante), 
          pay: u.pagoValidado ? 'SÍ' : 'NO' 
        };

        if (isSpecificWorkshop) {
          row.workshop = workshopTitle;
        } else {
          const realW = getRealWorkshops(u.talleres);
          realW.forEach((tw, i) => row[`w${i + 1}`] = getWorkshopTitle(tw.id));
        }
        worksheet.addRow(row);
      });
    }

    worksheet.getRow(1).font = { bold: true };
    
    // Generar Nombre de Archivo Inteligente
    let fileName = isDiplomaList ? 'Lista_Diplomas' : 'Reporte';
    if (isSpecificWorkshop) fileName += `_${workshopTitle.replace(/[^a-z0-9]/gi, '_')}`;
    else if (selectedWorkshopFilter === 'none') fileName += '_Sin_Talleres';
    
    if (paymentFilter !== 'all') fileName += `_${paymentFilter === 'paid' ? 'Pagados' : 'Pendientes'}`;
    
    // Si no están todos los tipos seleccionados, agregar al nombre
    if (participantTypeFilter.length < PARTICIPANT_TYPES.length) {
      fileName += `_${participantTypeFilter.join('_')}`;
    }

    const timeStamp = new Date().toLocaleString().replace(/[/]/g, '-').replace(/[:]/g, '-').replace(/[,]/g, '').replace(/ /g, '_');
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${timeStamp}.xlsx`);
    showToast('Exportación completada', 'success');
  };

  return (
    <section className="dashboard-section" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Reportes y Estadísticas" />
      </div>

      <ModuleCard
        title="Base de Datos de Inscritos"
        description="Filtra y exporta la información necesaria para diplomas y logística."
        headerActions={
          (!isColaborador || (selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== 'none' && selectedWorkshopFilter !== '')) && (
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <AdminButton variant="success" onClick={() => exportExcel(false)} icon={<Icons.Download size={18} />}>Reporte General</AdminButton>
              <AdminButton variant="outline" onClick={() => exportExcel(true)} icon={<Icons.Award size={18} />}>Lista de Diplomas</AdminButton>
            </div>
          )
        }
      >
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'flex-end', 
          marginBottom: '2.5rem', 
          background: 'var(--bg-app)', 
          padding: '1.25rem 1.5rem', 
          borderRadius: '16px', 
          border: '1px solid var(--border-soft)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ flex: '1 1 250px' }}>
            <SearchBar value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Buscar por nombre o correo..." />
          </div>
          <div style={{ width: '220px' }}>
            <AdminSelect 
              label="TALLER" 
              value={selectedWorkshopFilter} 
              onChange={(e) => setSelectedWorkshopFilter(e.target.value)} 
              options={[
                ...(!isColaborador ? [
                  { value: 'all_records', label: 'Todos los registros' }, 
                  { value: 'none', label: 'Sin talleres' }, 
                  { value: '', label: 'Cualquier taller' }
                ] : []),
                ...agenda
                  .filter(a => a.tagId !== 1 && a.tag?.toUpperCase().trim() !== 'GENERAL')
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map(w => ({ value: w.id, label: w.title }))
              ]} 
            />
          </div>
          {!isColaborador && (
            <div style={{ width: '150px' }}>
              <AdminSelect label="PAGO" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)} options={[{ value: 'all', label: 'Todos' }, { value: 'paid', label: 'Pagados' }, { value: 'unpaid', label: 'Pendientes' }]} />
            </div>
          )}
          <div style={{ width: '180px' }}>
            <MultiSelectFilter 
              label="TIPO PARTICIPANTE" 
              options={allowedParticipantTypes.map(t => ({ id: t.id, label: t.label }))} 
              selectedIds={participantTypeFilter} 
              onChange={(ids) => setParticipantTypeFilter(ids)} 
            />
          </div>
        </div>

        <AdminTable isLoading={isLoadingUsers} headers={["Participante", "Talleres Inscritos", "Perfil", "Estado Pago"]}>
          {paginatedUsers.map(u => (
            <tr key={u.correo}>
              <td>
                <div style={{ fontWeight: 800 }}>{getDisplayName(u)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{u.correo}</div>
              </td>
              <td style={{ maxWidth: '300px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(() => {
                    const realW = getRealWorkshops(u.talleres);
                    if (realW.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Ninguno</span>;
                    
                    // Si hay un taller específico filtrado, mostrar solo ese
                    if (selectedWorkshopFilter !== 'all_records' && selectedWorkshopFilter !== '' && selectedWorkshopFilter !== 'none') {
                      return <AdminBadge variant="info" style={{ fontSize: '10px' }}>{getWorkshopTitle(selectedWorkshopFilter)}</AdminBadge>;
                    }
                    
                    // Si no, mostrar todos
                    return realW.map(tw => (
                      <AdminBadge key={tw.id} variant="info" style={{ fontSize: '10px' }}>{getWorkshopTitle(tw.id)}</AdminBadge>
                    ));
                  })()}
                </div>
              </td>
              <td><AdminBadge variant="neutral">{getParticipantLabel(u.tipoParticipante)}</AdminBadge></td>
              <td><AdminBadge variant={u.pagoValidado ? "success" : "warning"} dot>{u.pagoValidado ? 'Validado' : 'Pendiente'}</AdminBadge></td>
            </tr>
          ))}
        </AdminTable>
        
        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} itemsPerPage={10} />
      </ModuleCard>
    </section>
  );
}
