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

  // Función para generar un código único que no exista en la lista actual
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

      // Validación de segmentos internos: evitar que los segmentos sean iguales entre sí
      if (seg1 === seg2 || seg1 === seg3 || seg2 === seg3) {
        attempts++;
        continue;
      }

      // Formato: C2026-XXXX-XXXX-XXXX (Prefijo + 3 segmentos para máxima seguridad)
      newCode = `C2026-${seg1}-${seg2}-${seg3}`;

      // Verificamos contra la base de datos Y contra la lista negra de placeholders
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
    const tempTokens = [...tokens]; // Para validar duplicados entre los nuevos generados

    for (let i = 0; i < massQuantity; i++) {
      const code = generateUniqueCode(tempTokens);
      tempTokens.push({ code, used: false } as any); // Añadimos con las propiedades mínimas para evitar error de tipos
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
      showToast('La fecha de inicio no puede ser posterior a la de fin.', 'error');
      return;
    }

    if (filteredTokens.length === 0) {
      showToast('No hay datos para exportar con los filtros actuales.', 'error');
      return;
    }

    // Notificaciones inteligentes unificadas
    if (startDate && endDate && startDate === endDate) {
      showToast(`Exportando reporte completo del día ${new Date(startDate).toLocaleDateString()}`, 'info');
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      showToast(`Exportando reporte de este día`, 'info');
    } else if (startDate && endDate) {
      showToast(`Exportando reporte del rango seleccionado`, 'info');
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
    const buffer = await workbook.xlsx.writeBuffer();

    // Generar nombre de archivo inteligente
    let filename = 'Tokens_General';
    const sDate = startDate ? startDate.split('-').reverse().join('_') : '';
    const eDate = endDate ? endDate.split('-').reverse().join('_') : '';

    if (startDate && endDate) {
      filename = startDate === endDate ? `Tokens_${sDate}` : `Tokens_${sDate}_al_${eDate}`;
    } else if (startDate) {
      filename = `Tokens_desde_${sDate}`;
    } else if (endDate) {
      filename = `Tokens_hasta_${eDate}`;
    }

    saveAs(new Blob([buffer]), `${filename}.xlsx`);
  };

  const exportTokensForUse = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('La fecha de inicio no puede ser posterior a la de fin.', 'error');
      return;
    }

    if (filteredTokens.length === 0) {
      showToast('No hay tokens disponibles para exportar en este rango.', 'error');
      return;
    }

    // Notificaciones inteligentes unificadas
    if (startDate && endDate && startDate === endDate) {
      showToast(`Exportando tokens del día ${new Date(startDate).toLocaleDateString()}`, 'info');
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      showToast(`Exportando reporte de este día`, 'info');
    } else if (startDate && endDate) {
      showToast(`Exportando reporte del rango seleccionado`, 'info');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tokens_para_Uso');
    worksheet.columns = [
      { header: 'CÓDIGO DE ACTIVACIÓN', key: 'code', width: 35 }
    ];

    filteredTokens.forEach(t => {
      worksheet.addRow({ code: t.code });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();

    // Generar nombre de archivo inteligente para tokens de uso
    let filename = 'Tokens_Disponibles';
    const sDate = startDate ? startDate.split('-').reverse().join('_') : '';
    const eDate = endDate ? endDate.split('-').reverse().join('_') : '';

    if (startDate && endDate) {
      filename = startDate === endDate ? `Tokens_Disponibles_${sDate}` : `Tokens_Disponibles_${sDate}_al_${eDate}`;
    } else if (startDate) {
      filename = `Tokens_Disponibles_desde_${sDate}`;
    } else if (endDate) {
      filename = `Tokens_Disponibles_hasta_${eDate}`;
    }

    saveAs(new Blob([buffer]), `${filename}.xlsx`);
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

            {statusFilter === 'available' && (startDate || endDate) && (
              <AdminButton
                variant="primary"
                onClick={exportTokensForUse}
                style={{ background: '#6366f1' }}
              >
                Exportar para uso
              </AdminButton>
            )}

            <AdminButton variant="success" onClick={exportTokensToExcel}>
              Exportar Excel
            </AdminButton>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <SearchBar placeholder="Buscar por nombre, correo o código..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <AdminSelect label="ESTADO" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} options={[{ value: 'all', label: 'Todos' }, { value: 'available', label: 'Disponibles' }, { value: 'used', label: 'Utilizados' }]} />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <AdminSelect label="TIPO" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} options={[{ value: 'all', label: 'Todos' }, { value: 'alumno', label: 'Estudiantes' }, { value: 'externo', label: 'Externos' }]} />
          </div>
          <div style={{ flex: 2, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Rango de Fecha</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AdminDateInput label="INICIO" value={startDate} onChange={e => setStartDate(e.target.value)} containerStyle={{ flex: 1 }} />
              <AdminDateInput label="FIN" value={endDate} onChange={e => setEndDate(e.target.value)} containerStyle={{ flex: 1 }} />
            </div>
          </div>
        </div>

        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <Alert variant="error" style={{ marginBottom: '1rem' }}>La fecha de inicio no puede ser posterior a la fecha de fin.</Alert>
        )}

        <AdminTable
          isLoading={isLoading}
          headers={[
            <input
              type="checkbox"
              checked={currentTokensOnPage.length > 0 && currentTokensOnPage.every(t => selectedTokens.includes(t.code))}
              onChange={handleSelectAllTokens}
            />,
            "Token", "Estado", "Nombre", "Correo", "Tipo", "Generado por", "Validado el", "Creado el", "Opciones"
          ]}
        >
          {currentTokensOnPage.map(t => (
            <tr key={t.code}>
              <td><input type="checkbox" checked={selectedTokens.includes(t.code)} onChange={() => handleSelectToken(t.code)} /></td>
              <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{t.code}</td>
              <td><AdminBadge variant={t.used ? "danger" : "success"} dot>{t.used ? "Utilizado" : "Disponible"}</AdminBadge></td>
              <td>{t.usedByName || '-'}</td>
              <td>{t.usedBy || '-'}</td>
              <td>{t.usedByType ? <AdminBadge variant="neutral">{t.usedByType === 'alumno' ? 'Estudiante' : 'Externo'}</AdminBadge> : '-'}</td>
              <td style={{ fontSize: '0.85rem' }}>{t.createdByName || '-'}</td>
              <td><FormattedDate date={t.usedAt} /></td>
              <td><FormattedDate date={t.createdAt} /></td>
              <td style={{ textAlign: 'right' }}>
                <AdminButton size="sm" variant="danger" onClick={() => handleDeleteToken(t.code)}>Eliminar</AdminButton>
              </td>
            </tr>
          ))}
        </AdminTable>

        <Pagination current={page} total={filteredTokens.length} onPageChange={setPage} />
      </ModuleCard>

      <Modal
        isOpen={isMassModalOpen}
        onClose={() => setIsMassModalOpen(false)}
        title="Generación Masiva"
        maxWidth="400px"
      >
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>Ingresa la cantidad de tokens que deseas generar automáticamente.</p>

        <FormField label="Cantidad de tokens" required>
          <input
            type="number"
            className="dashboard-input"
            value={massQuantity}
            onChange={e => setMassQuantity(parseInt(e.target.value))}
            min="1" max="100"
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <AdminButton onClick={handleMassGenerate} style={{ flex: 1 }}>Generar</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsMassModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </Modal>
    </section>
  );
}
