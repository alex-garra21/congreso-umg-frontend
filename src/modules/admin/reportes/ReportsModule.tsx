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
import { Icons } from '../../../components/Icons';
import BackButton from '../../../components/ui/BackButton';
import type { UserData } from '../../../utils/auth';
import { toReportUppercase, getDiplomaSuggestedName } from '../../../utils/stringUtils';

export default function ReportsModule() {
  const { data: users = [], isLoading: isLoadingUsers } = useGeneralReport();
  const { data: agenda = [] } = useCharlas();
  const { user: currentUser } = useAuth();
  const isColaborador = currentUser?.rol === 'colaborador';

  // Tipos de participante permitidos según rol
  const allowedParticipantTypes = useMemo(() => {
    return PARTICIPANT_TYPES;
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState<string[]>([]);
  const [workshopsInitialized, setWorkshopsInitialized] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<string[]>(allowedParticipantTypes.map(t => t.id));
  const [page, setPage] = useState(1);

  const workshopOptions = useMemo(() => {
    const realWorkshops = agenda
      .filter(a => a.tagId !== 1 && a.tag?.toUpperCase().trim() !== 'GENERAL')
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(w => ({ id: w.id, label: w.title }));
    
    if (!isColaborador) {
      return [
        { id: 'ALL_RECORDS', label: 'Todos los registros' },
        { id: 'NONE', label: 'Sin conferencias' }, 
        ...realWorkshops
      ];
    }
    return realWorkshops;
  }, [agenda, isColaborador]);

  // Inicializar selección de talleres
  useEffect(() => {
    if (!workshopsInitialized && agenda.length > 0) {
      if (isColaborador && workshopOptions.length > 0) {
        setSelectedWorkshopIds([workshopOptions[0].id]);
      } else {
        setSelectedWorkshopIds(['ALL_RECORDS']);
      }
      setWorkshopsInitialized(true);
    }
  }, [agenda, isColaborador, workshopsInitialized, workshopOptions]);

  // Sincronizar filtros si cambia el rol (ej: al cargar la sesión)
  useEffect(() => {
    setParticipantTypeFilter(allowedParticipantTypes.map(t => t.id));
  }, [allowedParticipantTypes]);

  const getWorkshopTitle = (id: string) => {
    const w = agenda.find(item => item.id === id);
    return w ? w.title : id;
  };

  // Ayudante para obtener solo talleres reales (excluye GENERAL)
  const getRealWorkshops = (talleres?: { id: string; category: string }[]) =>
    (talleres || []).filter(t => t.category?.toUpperCase().trim() !== 'GENERAL');

  const isSingleWorkshopSelected = selectedWorkshopIds.length === 1 && selectedWorkshopIds[0] !== 'NONE' && selectedWorkshopIds[0] !== 'ALL_RECORDS';
  const singleWorkshopId = isSingleWorkshopSelected ? selectedWorkshopIds[0] : null;

  const filteredUsers = users.filter(u => !u.desactivado).filter(u => {
    const matchesSearch = (u.nombres + ' ' + u.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar por los talleres seleccionados
    const realWorkshops = getRealWorkshops(u.talleres);
    let matchesWorkshop = false;
    
    if (selectedWorkshopIds.includes('ALL_RECORDS') || selectedWorkshopIds.length === 0) {
      matchesWorkshop = true; // "Todos los registros" o si por error lo dejan vacío
    } else {
      if (selectedWorkshopIds.includes('NONE')) {
        // Si "Sin conferencias" está seleccionado, solo mostramos si no tienen talleres.
        matchesWorkshop = realWorkshops.length === 0;
      } else {
        // El usuario DEBE tener TODOS los talleres seleccionados (Lógica AND)
        matchesWorkshop = selectedWorkshopIds.length > 0 && selectedWorkshopIds.every(selectedId => 
          realWorkshops.some(tw => tw.id === selectedId)
        );
      }
    }

    const matchesPayment = paymentFilter === 'all' || (paymentFilter === 'paid' && u.pagoValidado) || (paymentFilter === 'unpaid' && !u.pagoValidado);

    // El staff (admin/colaborador) NO debe ser filtrado por tipo de participante
    const isStaffUser = u.rol?.toLowerCase() === 'admin' || u.rol?.toLowerCase() === 'colaborador';
    const matchesType = isStaffUser || (participantTypeFilter.length === allowedParticipantTypes.length)
      ? true
      : participantTypeFilter.includes(u.tipoParticipante || 'externo');


    const matchesAttendance = attendanceFilter === 'all'
      ? true
      : attendanceFilter === 'attended'
        ? (
            selectedWorkshopIds.includes('ALL_RECORDS')
              ? (u.asistencias as any[] || []).some((a: any) => realWorkshops.some(tw => tw.id === a.workshopId))
              : (u.asistencias as any[] || []).some((a: any) => isSingleWorkshopSelected ? a.workshopId === singleWorkshopId : selectedWorkshopIds.includes(a.workshopId))
          )
        : (
            selectedWorkshopIds.includes('ALL_RECORDS')
              ? !(u.asistencias as any[] || []).some((a: any) => realWorkshops.some(tw => tw.id === a.workshopId))
              : !(u.asistencias as any[] || []).some((a: any) => isSingleWorkshopSelected ? a.workshopId === singleWorkshopId : selectedWorkshopIds.includes(a.workshopId))
          );

    return matchesSearch && matchesWorkshop && matchesPayment && matchesType && matchesAttendance;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10);

  const getDisplayName = (u: UserData) => {
    return `${u.nombres} ${u.apellidos}`.trim();
  };

  /** Usa nombre_diploma de la BD; si está vacío, nombres + apellidos con el helper sugerido de 25 caracteres. */
  const getDiplomaExportName = (u: UserData) => {
    const fromDiploma = (u.nombreDiploma ?? '').trim();
    const source = fromDiploma || getDiplomaSuggestedName(u.nombres, u.apellidos);
    return toReportUppercase(source);
  };

  const getDiplomaExportEmail = (u: UserData) =>
    (u.correoDiploma || u.correo).trim().toLowerCase();

  const exportExcel = async (isDiplomaList = false) => {
    if (filteredUsers.length === 0) { showToast('No hay datos para exportar.', 'warning'); return; }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(isDiplomaList ? 'Diplomas' : 'Reporte_General');

    // Nombre de taller único para exportación
    const workshopTitle = isSingleWorkshopSelected ? getWorkshopTitle(singleWorkshopId!) : '';

    if (isDiplomaList) {
      worksheet.columns = [
        { header: 'Participante (Para Diploma)', key: 'name', width: 40 },
        { header: 'Correo (Para Diploma)', key: 'email', width: 40 },
        { header: 'Taller(es)', key: 'workshops', width: 45 }
      ];
      
      filteredUsers.forEach(u => {
        let realW = getRealWorkshops(u.talleres);
        if (selectedWorkshopIds.includes('ALL_RECORDS') && attendanceFilter === 'attended') {
          realW = realW.filter(tw => 
            (u.asistencias as any[] || []).some((a: any) => a.workshopId === tw.id)
          );
        }
        const diplomaName = getDiplomaExportName(u);
        const row = worksheet.addRow({
          name: diplomaName,
          email: getDiplomaExportEmail(u),
          workshops: isSingleWorkshopSelected ? workshopTitle : (realW.map(tw => getWorkshopTitle(tw.id)).join(', ') || '-')
        });
        // Texto explícito (@) para que Excel no reformatee el nombre al abrir el archivo
        const nameCell = row.getCell(1);
        nameCell.value = diplomaName;
        nameCell.numFmt = '@';
      });
    } else {
      // Columnas Base
      const cols: any[] = [
        { header: 'No.', key: 'id', width: 8 },
        { header: 'Participante', key: 'name', width: 30 },
        { header: 'Correo', key: 'email', width: 30 },
        { header: 'DPI', key: 'dpi', width: 20 },
        { header: 'Género', key: 'sex', width: 15 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: isColaborador ? 'Carnet' : 'Carnet/codigo docente', key: 'identifier', width: 25 }
      ];

      // Si es un taller específico, solo una columna de Taller
      if (isSingleWorkshopSelected) {
        cols.push({ header: 'Conferencia', key: 'workshop', width: 35 });
      } else {
        const maxWorkshops = Math.max(...filteredUsers.map(u => getRealWorkshops(u.talleres).length), 1);
        for (let i = 1; i <= maxWorkshops; i++) cols.push({ header: `Conferencia ${i}`, key: `w${i}`, width: 35 });
      }

      cols.push({ header: 'Tipo', key: 'type', width: 25 });
      if (isSingleWorkshopSelected) {
        cols.push({ header: 'Asistencia', key: 'attendance', width: 15 });
      }
      cols.push({ header: 'Pago', key: 'pay', width: 15 });
      worksheet.columns = cols;

      filteredUsers.forEach((u, index) => {
        const row: any = {
          id: index + 1,
          name: getDisplayName(u),
          email: u.correo,
          dpi: u.dpi || '-',
          sex: u.sexo || '-',
          phone: u.telefono || '-',
          identifier: u.carnet || u.codigoDocente || '-',
          type: getParticipantLabel(u.tipoParticipante),
          pay: u.pagoValidado ? 'SÍ' : 'NO'
        };

        if (isSingleWorkshopSelected) {
          const hasAttendance = (u.asistencias as any[] || []).some((a: any) => a.workshopId === singleWorkshopId);
          row.attendance = hasAttendance ? 'SÍ' : 'NO';
          row.workshop = workshopTitle;
        } else {
          let realW = getRealWorkshops(u.talleres);
          if (selectedWorkshopIds.includes('ALL_RECORDS') && attendanceFilter === 'attended') {
            realW = realW.filter(tw => 
              (u.asistencias as any[] || []).some((a: any) => a.workshopId === tw.id)
            );
          }
          if (realW.length === 0) {
            row['w1'] = '-';
          } else {
            realW.forEach((tw, i) => row[`w${i + 1}`] = getWorkshopTitle(tw.id));
          }
        }
        worksheet.addRow(row);
      });
    }

    worksheet.getRow(1).font = { bold: true };

    // Generar Nombre de Archivo Inteligente
    let fileName = isDiplomaList ? 'Lista_Diplomas' : 'Reporte';
    if (isSingleWorkshopSelected) fileName += `_${workshopTitle.replace(/[^a-z0-9]/gi, '_')}`;
    else if (selectedWorkshopIds.length === 1 && selectedWorkshopIds[0] === 'NONE') fileName += '_Sin_Conferencias';
    else if (selectedWorkshopIds.includes('ALL_RECORDS') || selectedWorkshopIds.length === 0) fileName += '_Todos_Los_Registros';
    else fileName += '_Multiples_Conferencias';

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
          (!isColaborador || (selectedWorkshopIds.length > 0)) && (
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
          <div style={{ width: '250px' }}>
            <MultiSelectFilter
              label="CONFERENCIA"
              options={workshopOptions}
              selectedIds={selectedWorkshopIds}
              onChange={(ids) => {
                let newIds = ids;
                const previouslyHadAll = selectedWorkshopIds.includes('ALL_RECORDS');
                const nowHasAll = ids.includes('ALL_RECORDS');

                // Si selecciona "Todos los registros", limpiamos el resto
                if (!previouslyHadAll && nowHasAll) {
                  newIds = ['ALL_RECORDS'];
                } 
                // Si tenía "Todos" y seleccionó otra cosa, le quitamos el "Todos"
                else if (previouslyHadAll && nowHasAll && ids.length > 1) {
                  newIds = ids.filter(id => id !== 'ALL_RECORDS');
                }
                
                setSelectedWorkshopIds(newIds);
                setPage(1);
              }}
            />
          </div>
          <div style={{ width: '150px' }}>
            <AdminSelect label="PAGO" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)} options={[{ value: 'all', label: 'Todos' }, { value: 'paid', label: 'Pagados' }, { value: 'unpaid', label: 'Pendientes' }]} />
          </div>
          <div style={{ width: '180px' }}>
            <AdminSelect
              label="ASISTENCIA"
              value={attendanceFilter}
              onChange={(e) => { setAttendanceFilter(e.target.value as any); setPage(1); }}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'attended', label: 'Con Asistencia' },
                { value: 'not_attended', label: 'Sin Asistencia' }
              ]}
            />
          </div>
          <div style={{ width: '180px' }}>
            <MultiSelectFilter
              label="TIPO PARTICIPANTE"
              options={allowedParticipantTypes.map(t => ({ id: t.id, label: t.label }))}
              selectedIds={participantTypeFilter}
              onChange={(ids) => setParticipantTypeFilter(ids)}
            />
          </div>
        </div>

        <AdminTable
          isLoading={isLoadingUsers}
          headers={[
            "Participante",
            "Conferencias Inscritas",
            "Perfil",
            ...(isSingleWorkshopSelected ? ["Asistencia"] : [])
          ]}
        >
          {paginatedUsers.map(u => (
            <tr key={u.correo}>
              <td>
                <div style={{ fontWeight: 800 }}>{getDisplayName(u)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{u.correo}</div>
              </td>
              <td style={{ maxWidth: '300px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(() => {
                    let realW = getRealWorkshops(u.talleres);
                    if (selectedWorkshopIds.includes('ALL_RECORDS') && attendanceFilter === 'attended') {
                      realW = realW.filter(tw => 
                        (u.asistencias as any[] || []).some((a: any) => a.workshopId === tw.id)
                      );
                    }
                    if (realW.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Ninguno</span>;

                    // Si hay un solo taller seleccionado, mostrar solo ese
                    if (isSingleWorkshopSelected) {
                      return <AdminBadge variant="info" style={{ fontSize: '10px' }}>{getWorkshopTitle(singleWorkshopId!)}</AdminBadge>;
                    }

                    // Si no, mostrar todos
                    return realW.map(tw => (
                      <AdminBadge key={tw.id} variant="info" style={{ fontSize: '10px' }}>{getWorkshopTitle(tw.id)}</AdminBadge>
                    ));
                  })()}
                </div>
              </td>
              <td>
                {u.rol === 'admin' || u.rol === 'colaborador' ? (
                  <AdminBadge variant="purple" style={{ textTransform: 'capitalize' }}>{u.rol}</AdminBadge>
                ) : (
                  <AdminBadge variant="neutral">{getParticipantLabel(u.tipoParticipante)}</AdminBadge>
                )}
              </td>
                  {isSingleWorkshopSelected && (
                    <td>
                      {(() => {
                        const hasAttendance = (u.asistencias as any[] || []).some((a: any) => a.workshopId === singleWorkshopId);
                        return hasAttendance ? (
                          <AdminBadge variant="success" dot>Asistió</AdminBadge>
                        ) : (
                          <AdminBadge variant="danger" dot>No asistió</AdminBadge>
                        );
                      })()}
                    </td>
                  )}
            </tr>
          ))}
        </AdminTable>

        <Pagination current={page} total={filteredUsers.length} onPageChange={setPage} itemsPerPage={10} />
      </ModuleCard>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <BackButton />
      </div>
    </section>
  );
}
