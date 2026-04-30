import { useState } from 'react';
import { useTokens, useGenerateToken, useDeleteToken } from '../../../api/hooks/useUsers';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';
import SearchBar from '../../../components/ui/SearchBar';
import AdminDateInput from '../../../components/ui/AdminDateInput';
import FormattedDate from '../../../components/ui/FormattedDate';
import { isDateInRange, formatFullDate } from '../../../utils/dateUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function TokensModule() {
  const { data: tokens = [], isLoading } = useTokens();
  const generateTokenMutation = useGenerateToken();
  const deleteTokenMutation = useDeleteToken();
  const [page, setPage] = useState(1);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isMassModalOpen, setIsMassModalOpen] = useState(false);
  const [massQuantity, setMassQuantity] = useState(10);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateToken = async () => {
    // Generate a random block for the token code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    
    await generateTokenMutation.mutateAsync({ code });
    setPage(1);
  };

  const handleMassGenerate = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const promises = [];
    for (let i = 0; i < massQuantity; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      promises.push(generateTokenMutation.mutateAsync({ code }));
    }
    await Promise.all(promises);
    setIsMassModalOpen(false);
    setPage(1);
  };

  // Lógica de filtrado
  const filteredTokens = tokens.filter(t => {
    const matchesSearch = !searchTerm || 
      (t.usedByName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.usedBy?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'used' ? t.used : !t.used);

    const matchesType = typeFilter === 'all' || 
      t.usedByType === typeFilter;

    const matchesDate = !t.createdAt || isDateInRange(t.createdAt, startDate, endDate);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const currentTokensOnPage = filteredTokens.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSelectToken = (code: string) => {
    setSelectedTokens(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllTokens = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allCodesOnPage = currentTokensOnPage.map(t => t.code);
      const newSelected = new Set([...selectedTokens, ...allCodesOnPage]);
      setSelectedTokens(Array.from(newSelected));
    } else {
      const allCodesOnPage = currentTokensOnPage.map(t => t.code);
      setSelectedTokens(prev => prev.filter(code => !allCodesOnPage.includes(code)));
    }
  };

  const handleDeleteToken = async (code: string) => {
    const confirmed = await showConfirm('Eliminar Token', '¿Estás seguro de eliminar este token?', 'Eliminar', true);
    if (confirmed) {
      await deleteTokenMutation.mutateAsync(code);
      showToast('Token eliminado permanentemente', 'success');
      setSelectedTokens(prev => prev.filter(t => t !== code));
    }
  };

  const handleDeleteSelectedTokens = async () => {
    const confirmed = await showConfirm(
      'Eliminar Tokens',
      `¿Estás seguro de eliminar los ${selectedTokens.length} tokens seleccionados?`,
      'Eliminar Todos',
      true
    );
    if (confirmed) {
      const promises = selectedTokens.map(code => deleteTokenMutation.mutateAsync(code));
      await Promise.all(promises);
      showToast(`${selectedTokens.length} tokens eliminados`, 'success');
      setSelectedTokens([]);
    }
  };

  const exportTokensToExcel = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('El rango de fechas no es válido.', 'error');
      return;
    }

    if (filteredTokens.length === 0) {
      showToast('No hay tokens para exportar con los filtros actuales.', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tokens');

    worksheet.columns = [
      { header: 'Token de Activación', key: 'code', width: 25 },
      { header: 'Estado', key: 'status', width: 20 },
      { header: 'Nombre', key: 'usedByName', width: 30 },
      { header: 'Correo', key: 'usedBy', width: 30 },
      { header: 'Tipo', key: 'usedByType', width: 20 },
      { header: 'Generado por', key: 'createdByName', width: 25 },
      { header: 'Validado el', key: 'usedAt', width: 25 },
      { header: 'Fecha Creación', key: 'createdAt', width: 25 }
    ];

    filteredTokens.forEach(t => {
      worksheet.addRow({
        code: t.code,
        status: t.used ? 'Utilizado' : 'Disponible',
        usedByName: t.usedByName || 'N/A',
        usedBy: t.usedBy || 'N/A',
        usedByType: t.usedByType ? (t.usedByType === 'alumno' ? 'Estudiante' : 'Externo') : 'N/A',
        createdByName: t.createdByName || 'N/A',
        usedAt: formatFullDate(t.usedAt),
        createdAt: formatFullDate(t.createdAt)
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const suffix = searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate ? '_Filtrado' : '';
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Tokens_Acceso_Congreso_2026${suffix}.xlsx`);
  };

  const exportForUsageToExcel = async () => {
    const isStatusAvailable = statusFilter === 'available';
    const isDateSelected = !!startDate || !!endDate;

    if (!isStatusAvailable && !isDateSelected) {
      showToast('Es obligatorio seleccionar el estado "Disponibles" y al menos una fecha.', 'warning');
      return;
    }

    if (!isStatusAvailable) {
      showToast('Es obligatorio seleccionar el estado "Disponibles".', 'warning');
      return;
    }

    if (!isDateSelected) {
      showToast('Es obligatorio seleccionar al menos una fecha (Inicio o Fin).', 'warning');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('El rango de fechas no es válido.', 'error');
      return;
    }

    if (filteredTokens.length === 0) {
      showToast('No hay tokens disponibles para exportar con los filtros actuales.', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tokens para Uso');

    worksheet.columns = [
      { header: 'No.', key: 'index', width: 10 },
      { header: 'Token de Activación', key: 'code', width: 30 },
      { header: 'Fecha Creación', key: 'createdAt', width: 25 }
    ];

    filteredTokens.forEach((t, i) => {
      worksheet.addRow({
        index: i + 1,
        code: t.code,
        createdAt: formatFullDate(t.createdAt)
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getColumn(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    const dateRange = (startDate && endDate) 
      ? `${startDate}_al_${endDate}` 
      : `${startDate || endDate}_unico_dia`;
    saveAs(new Blob([buffer]), `Tokens_PARA_USO_${dateRange}.xlsx`);
  };

  return (
    <section className="dashboard-section">
      <ModuleTitle title="Gestión de Tokens" />

      <ModuleCard
        title="Tokens de Activación"
        description="Genera y administra tokens para que los participantes puedan validar su inscripción."
        headerActions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {selectedTokens.length > 0 && (
              <AdminButton variant="danger" onClick={handleDeleteSelectedTokens}>
                Eliminar ({selectedTokens.length})
              </AdminButton>
            )}
            <AdminButton onClick={handleGenerateToken}>+ Generar Token</AdminButton>
            <AdminButton variant="outline" onClick={() => setIsMassModalOpen(true)}>Generación Masiva</AdminButton>
            <AdminButton variant="secondary" onClick={exportForUsageToExcel}>Exportar para Uso</AdminButton>
            <AdminButton variant="success" onClick={exportTokensToExcel}>Exportar Excel</AdminButton>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <SearchBar 
              placeholder="Buscar por nombre, correo o código de token..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <AdminSelect 
              label="ESTADO"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'available', label: 'Disponibles' },
                { value: 'used', label: 'Utilizados' }
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <AdminSelect 
              label="TIPO DE PARTICIPANTE"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'alumno', label: 'Estudiantes UMG' },
                { value: 'externo', label: 'Externos' }
              ]}
            />
          </div>
          <div style={{ flex: 2, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              color: 'var(--text-secondary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px',
              marginLeft: '4px'
            }}>
              Rango de Fecha de Creación
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AdminDateInput 
                label="FECHA INICIO"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1); }}
                containerStyle={{ flex: 1 }}
              />
              <AdminDateInput 
                label="FECHA FIN"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1); }}
                containerStyle={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <div style={{ 
            color: '#dc3545', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            marginTop: '-1rem', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '4px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            La fecha de inicio no puede ser posterior a la fecha de fin.
          </div>
        )}

        {((startDate && !endDate) || (!startDate && endDate)) && (
          <div style={{ 
            color: 'var(--blue)', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            marginTop: '-1rem', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingLeft: '4px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Se ha seleccionado una sola fecha. El reporte se generará únicamente para el día {new Date((startDate || endDate) + 'T00:00:00').toLocaleDateString('es-GT')}.
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando tokens...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={currentTokensOnPage.length > 0 && currentTokensOnPage.every(t => selectedTokens.includes(t.code))}
                    onChange={handleSelectAllTokens}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Token</th>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Generado por</th>
                <th>Validado el</th>
                <th>Creado el</th>
                <th style={{ textAlign: 'right' }}>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTokensOnPage.map(t => (
                <tr key={t.code}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTokens.includes(t.code)}
                      onChange={() => handleSelectToken(t.code)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{t.code}</td>
                  <td>
                    {t.used ? (
                      <AdminBadge variant="danger" dot>Utilizado</AdminBadge>
                    ) : (
                      <AdminBadge variant="success" dot>Disponible</AdminBadge>
                    )}
                  </td>
                  <td>{t.usedByName || '-'}</td>
                  <td>{t.usedBy || '-'}</td>
                  <td>
                    {t.usedByType ? (
                      <AdminBadge variant="neutral">
                        {t.usedByType === 'alumno' ? 'Estudiante UMG' : 'Externo'}
                      </AdminBadge>
                    ) : (
                      t.used && '-'
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{t.createdByName || '-'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--blue)' }}>
                    <FormattedDate date={t.usedAt} />
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <FormattedDate date={t.createdAt} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <AdminButton size="sm" variant="danger" onClick={() => handleDeleteToken(t.code)}>
                      Eliminar
                    </AdminButton>
                  </td>
                </tr>
              ))}
              {currentTokensOnPage.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No se encontraron tokens con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        
        <Pagination current={page} total={filteredTokens.length} onPageChange={setPage} />
      </ModuleCard>

      {/* Modal Masivo */}
      {isMassModalOpen && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontFamily: 'Syne', fontWeight: 800 }}>Generación Masiva</h3>
            <div className="form-group">
              <label>CANTIDAD DE TOKENS</label>
              <input 
                type="number" 
                className="dashboard-input" 
                value={massQuantity} 
                onChange={e => setMassQuantity(parseInt(e.target.value))}
                min="1" max="100"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <AdminButton onClick={handleMassGenerate} style={{ flex: 1 }}>Generar</AdminButton>
              <AdminButton variant="secondary" onClick={() => setIsMassModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
