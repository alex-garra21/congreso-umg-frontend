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
import AdminTable from '../../../components/ui/AdminTable';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Alert from '../../../components/ui/Alert';
import { Icons } from '../../../components/Icons';

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

  // Función para generar un código único
  const generateUniqueCode = (existingTokens: any[]) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const generateSegment = (len: number) => {
      let segment = '';
      for (let i = 0; i < len; i++) segment += chars.charAt(Math.floor(Math.random() * chars.length));
      return segment;
    };

    let newCode = '';
    let isDuplicate = true;
    let attempts = 0;
    const BLACKLIST = ['C2026-aBcD-1xYz-9QkL'];

    while (isDuplicate && attempts < 20) {
      const seg1 = generateSegment(4);
      const seg2 = generateSegment(4);
      const seg3 = generateSegment(4);
      if (seg1 === seg2 || seg1 === seg3 || seg2 === seg3) { attempts++; continue; }
      newCode = `C2026-${seg1}-${seg2}-${seg3}`;
      isDuplicate = existingTokens.some(t => t.code === newCode) || BLACKLIST.includes(newCode);
      attempts++;
    }
    return newCode;
  };

  const handleGenerateToken = async () => {
    const code = generateUniqueCode(tokens);
    await generateTokenMutation.mutateAsync({ code, used: false } as any);
    setPage(1);
    showToast('Token único generado con éxito', 'success');
  };

  const handleMassGenerate = async () => {
    const promises = [];
    const tempTokens = [...tokens];
    for (let i = 0; i < massQuantity; i++) {
      const code = generateUniqueCode(tempTokens);
      tempTokens.push({ code, used: false } as any);
      promises.push(generateTokenMutation.mutateAsync({ code, used: false } as any));
    }
    await Promise.all(promises);
    setIsMassModalOpen(false);
    setPage(1);
    showToast(`${massQuantity} tokens únicos generados con éxito`, 'success');
  };

  const filteredTokens = tokens.filter(t => {
    const matchesSearch = !searchTerm ||
      (t.usedByName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.usedBy?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'used' ? t.used : !t.used);
    const matchesType = typeFilter === 'all' || t.usedByType === typeFilter;
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
      setSelectedTokens(Array.from(new Set([...selectedTokens, ...allCodesOnPage])));
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
    const confirmed = await showConfirm('Eliminar Tokens', `¿Estás seguro de eliminar los ${selectedTokens.length} tokens seleccionados?`, 'Eliminar Todos', true);
    if (confirmed) {
      await Promise.all(selectedTokens.map(code => deleteTokenMutation.mutateAsync(code)));
      showToast(`${selectedTokens.length} tokens eliminados`, 'success');
      setSelectedTokens([]);
    }
  };

  const exportToExcel = async (forUse = false) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('La fecha de inicio no puede ser posterior a la de fin.', 'error');
      return;
    }
    if (filteredTokens.length === 0) {
      showToast('No hay datos para exportar con los filtros actuales.', 'error');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(forUse ? 'Tokens_Uso' : 'Tokens_Reporte');
    
    if (forUse) {
      worksheet.columns = [{ header: 'CÓDIGO DE ACTIVACIÓN', key: 'code', width: 35 }];
      filteredTokens.forEach(t => worksheet.addRow({ code: t.code }));
    } else {
      worksheet.columns = [
        { header: 'Token', key: 'code', width: 25 },
        { header: 'Estado', key: 'status', width: 20 },
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Correo', key: 'email', width: 30 },
        { header: 'Tipo', key: 'type', width: 20 },
        { header: 'Fecha Creación', key: 'createdAt', width: 25 }
      ];
      filteredTokens.forEach(t => worksheet.addRow({
        code: t.code, status: t.used ? 'Utilizado' : 'Disponible',
        name: t.usedByName || '-', email: t.usedBy || '-',
        type: t.usedByType || '-', createdAt: formatFullDate(t.createdAt)
      }));
    }

    worksheet.getRow(1).font = { bold: true };
    
    // Generar Nombre de Archivo Inteligente
    let fileName = forUse ? 'Tokens_Disponibles' : 'Reporte_Tokens';
    
    if (statusFilter !== 'all') {
      fileName += `_${statusFilter === 'used' ? 'Utilizados' : 'Disponibles'}`;
    }
    
    if (typeFilter !== 'all') {
      fileName += `_${typeFilter === 'alumno' ? 'Estudiantes' : 'Externos'}`;
    }

    if (startDate || endDate) {
      if (startDate && endDate) fileName += `_del_${startDate}_al_${endDate}`;
      else if (startDate) fileName += `_desde_${startDate}`;
      else if (endDate) fileName += `_hasta_${endDate}`;
    }

    const timeStamp = new Date().toLocaleString().replace(/[/]/g, '-').replace(/[:]/g, '-').replace(/[,]/g, '').replace(/ /g, '_');
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${timeStamp}.xlsx`);
    showToast(forUse ? 'Códigos exportados' : 'Reporte generado', 'success');
  };

  return (
    <section className="dashboard-section" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Control de Acceso" />
      </div>

      <ModuleCard
        title="Tokens de Activación"
        description="Gestiona las llaves de acceso para los participantes del congreso."
        headerActions={
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {selectedTokens.length > 0 && (
              <AdminButton variant="danger" onClick={handleDeleteSelectedTokens} icon={<Icons.Trash size={18} />}>
                Borrar ({selectedTokens.length})
              </AdminButton>
            )}
            <AdminButton onClick={handleGenerateToken} icon={<Icons.Plus size={18} />}>
              Nuevo Token
            </AdminButton>
            <AdminButton variant="outline" onClick={() => setIsMassModalOpen(true)} icon={<Icons.Users size={18} />}>
              Masivo
            </AdminButton>
            <AdminButton variant="success" onClick={() => exportToExcel(false)} icon={<Icons.Download size={18} />}>
              Reporte
            </AdminButton>
            {statusFilter === 'available' && (startDate || endDate) && (
              <AdminButton variant="primary" onClick={() => exportToExcel(true)} style={{ background: 'var(--accent-primary)' }} icon={<Icons.Clipboard size={18} />}>
                Solo Códigos
              </AdminButton>
            )}
          </div>
        }
      >
        {/* Filtros Premium Compactos */}
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
            <SearchBar placeholder="Buscar por nombre, correo o código..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div style={{ width: '140px' }}>
            <AdminSelect label="ESTADO" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={[{ value: 'all', label: 'Todos' }, { value: 'available', label: 'Disponibles' }, { value: 'used', label: 'Utilizados' }]} />
          </div>
          <div style={{ width: '140px' }}>
            <AdminSelect label="TIPO" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[{ value: 'all', label: 'Todos' }, { value: 'alumno', label: 'Estudiantes' }, { value: 'externo', label: 'Externos' }]} />
          </div>
          <div style={{ width: '130px' }}>
             <AdminDateInput label="DESDE" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ width: '130px' }}>
             <AdminDateInput label="HASTA" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <AdminTable
          isLoading={isLoading}
          headers={[
            <input type="checkbox" checked={currentTokensOnPage.length > 0 && currentTokensOnPage.every(t => selectedTokens.includes(t.code))} onChange={handleSelectAllTokens} />,
            "Token", "Estado", "Asignado a", "Tipo", "Creación", "Opciones"
          ]}
        >
          {currentTokensOnPage.map(t => (
            <tr key={t.code}>
              <td><input type="checkbox" checked={selectedTokens.includes(t.code)} onChange={() => handleSelectToken(t.code)} /></td>
              <td style={{ fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Source Sans 3' }}>{t.code}</td>
              <td><AdminBadge variant={t.used ? "danger" : "success"} dot>{t.used ? "Utilizado" : "Disponible"}</AdminBadge></td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{t.usedByName || '-'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.usedBy || 'Sin asignar'}</span>
                </div>
              </td>
              <td>{t.usedByType ? <AdminBadge variant="neutral">{t.usedByType === 'alumno' ? 'Estudiante' : 'Externo'}</AdminBadge> : '-'}</td>
              <td><FormattedDate date={t.createdAt} /></td>
              <td style={{ textAlign: 'right' }}>
                <button onClick={() => handleDeleteToken(t.code)} className="action-btn-danger" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}>
                  <Icons.Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>

        <Pagination current={page} total={filteredTokens.length} onPageChange={setPage} />
      </ModuleCard>

      <Modal isOpen={isMassModalOpen} onClose={() => setIsMassModalOpen(false)} title="Generación Masiva" maxWidth="420px">
        <Alert variant="info" style={{ marginBottom: '1.5rem' }}>
          Se generarán códigos únicos con el prefijo <strong>C2026-</strong> siguiendo el estándar de seguridad.
        </Alert>

        <FormField label="CANTIDAD A GENERAR" required>
          <input
            type="number"
            className="dashboard-input"
            value={massQuantity}
            onChange={e => setMassQuantity(parseInt(e.target.value) || 0)}
            min="1" max="100"
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <AdminButton onClick={handleMassGenerate} style={{ flex: 2 }} icon={<Icons.Plus size={18} />}>Generar Tokens</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsMassModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </Modal>
    </section>
  );
}

