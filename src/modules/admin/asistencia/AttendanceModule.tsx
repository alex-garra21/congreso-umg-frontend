import { useState, useRef } from 'react';
import { useAllUsers } from '../../../api/hooks/useUsers';
import { generateSlug, type AgendaItem } from '../../../utils/agendaStore';
import { useCharlas, useSaveAgenda } from '../../../api/hooks/useAgenda';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast } from '../../../utils/swal';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import SearchBar from '../../../components/ui/SearchBar';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';
import AttendanceQR, { type AttendanceQRHandle } from '../../../components/admin/AttendanceQR';
import { toPng } from 'html-to-image';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import AdminTable from '../../../components/ui/AdminTable';
import FormField from '../../../components/ui/FormField';
import Alert from '../../../components/ui/Alert';
import { timeToMinutes, generateTimeOptions, normalizeTime } from '../../../utils/timeUtils';
import { useTimeConfig } from '../../../context/TimeContext';

export default function AttendanceModule() {
  const { data: users = [] } = useAllUsers();
  const { data: agenda = [] } = useCharlas();
  const saveAgendaMutation = useSaveAgenda();
  const { timeInterval } = useTimeConfig();
  
  const [searchAgenda, setSearchAgenda] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('all');
  const [endTimeFilter, setEndTimeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Opciones de horas centralizadas
  const timeOptions = generateTimeOptions(timeInterval, true);

  // Modals
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);
  const [graceWorkshop, setGraceWorkshop] = useState<AgendaItem | null>(null);
  const [tempGraceHours, setTempGraceHours] = useState<number>(0);
  const [tempGraceMinutes, setTempGraceMinutes] = useState<number>(10);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrWorkshop, setQRWorkshop] = useState<AgendaItem | null>(null);
  const [qrLink, setQRLink] = useState('');
  const qrRef = useRef<AttendanceQRHandle>(null);

  const handleDownloadQR = async () => {
    if (qrRef.current && qrWorkshop) {
      const node = qrRef.current.getCardRef();
      if (node) {
        try {
          const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
          const link = document.createElement('a');
          link.download = `QR-Asistencia-${qrWorkshop.title.replace(/\s+/g, '-')}.png`;
          link.href = dataUrl;
          link.click();
        } catch (error) { console.error('Error QR:', error); }
      }
    }
  };

  const handleUpdateGracePeriod = (workshopId: string) => {
    const workshop = agenda.find(a => a.id === workshopId);
    if (!workshop) return;
    setGraceWorkshop(workshop);
    const totalMinutes = workshop.gracePeriod ?? 10;
    setTempGraceHours(Math.floor(totalMinutes / 60));
    setTempGraceMinutes(totalMinutes % 60);
    setIsGraceModalOpen(true);
  };

  const saveGracePeriod = () => {
    if (!graceWorkshop) return;
    const totalMinutes = (tempGraceHours * 60) + tempGraceMinutes;
    const newAgenda = agenda.map(a => a.id === graceWorkshop.id ? { ...a, gracePeriod: totalMinutes } : a);
    saveAgendaMutation.mutateAsync(newAgenda).then(() => {
      setIsGraceModalOpen(false);
      showToast('Tiempo de gracia actualizado', 'success');
    });
  };

  const handleShowQR = (workshopId: string) => {
    const workshop = agenda.find(w => w.id === workshopId);
    if (!workshop) return;
    setQRWorkshop(workshop);
    setQRLink(`${window.location.origin}/asistencia/${generateSlug(workshop.title)}`);
    setIsQRModalOpen(true);
  };

  const filteredAgenda = agenda.filter(item => {
    // 1. Excluir categorías GENERALES del control de asistencia
    if (item.tag === 'GENERAL') return false;

    const matchesSearch = item.title.toLowerCase().includes(searchAgenda.toLowerCase());
    
    let matchesTime = true;
    const hasStart = startTimeFilter !== 'all';
    const hasEnd = endTimeFilter !== 'all';

    if (hasStart && hasEnd) {
      const fStart = timeToMinutes(startTimeFilter);
      const fEnd = timeToMinutes(endTimeFilter);
      const aStart = timeToMinutes(item.time);
      const aEnd = timeToMinutes(item.endTime);
      matchesTime = (aStart < fEnd && aEnd > fStart) || (aStart === fStart) || (aEnd === fEnd);
    } else if (hasStart) {
      matchesTime = normalizeTime(item.time) === normalizeTime(startTimeFilter);
    } else if (hasEnd) {
      matchesTime = normalizeTime(item.endTime) === normalizeTime(endTimeFilter);
    }

    return matchesSearch && matchesTime;
  });
  const paginatedAgenda = filteredAgenda.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <section className="dashboard-section" style={{ padding: '0' }}>
      <div style={{ padding: '2rem 2.5rem 0' }}>
        <ModuleTitle title="Control de Asistencia" />
      </div>

      <ModuleCard
        title="Validación por Actividad"
        description="Genera códigos QR y gestiona los tiempos de tolerancia para la toma de asistencia."
      >
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          alignItems: 'flex-end',
          justifyContent: 'center', 
          marginBottom: '2.5rem', 
          background: 'var(--bg-app)', 
          padding: '1.25rem 1.5rem', 
          borderRadius: '16px', 
          border: '1px solid var(--border-soft)',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <SearchBar value={searchAgenda} onChange={(val) => { setSearchAgenda(val); setPage(1); }} placeholder="Buscar taller por nombre..." />
          </div>
          <div style={{ width: '150px' }}>
            <AdminSelect label="HORA INICIO" value={startTimeFilter} onChange={e => { setStartTimeFilter(e.target.value); setPage(1); }} options={timeOptions} />
          </div>
          <div style={{ width: '150px' }}>
            <AdminSelect label="HORA FIN" value={endTimeFilter} onChange={e => { setEndTimeFilter(e.target.value); setPage(1); }} options={timeOptions} />
          </div>
        </div>
        <AdminTable
          headers={["Actividad", "Horario", "Tolerancia", "Inscritos", "Asistencia", "Acciones"]}
          emptyMessage="No se encontraron talleres."
        >
          {paginatedAgenda.map(item => (
            <tr key={item.id}>
              <td>
                <div style={{ fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📍 {item.room}</div>
              </td>
              <td style={{ fontSize: '13px', fontWeight: 600 }}>{item.time} - {item.endTime}</td>
              <td>
                <AdminBadge variant="info">
                  {(() => {
                    const total = item.gracePeriod ?? 10;
                    if (total >= 60) return `+${Math.floor(total / 60)}h ${total % 60}m`;
                    return `+${total} min`;
                  })()}
                </AdminBadge>
              </td>
              <td>
                <AdminBadge variant="neutral">{users.filter(u => u.talleres?.some(t => t.id === item.id)).length} pers.</AdminBadge>
              </td>
              <td>
                <AdminBadge variant="success" dot>{users.filter(u => u.asistencias?.some(a => a.workshopId === item.id)).length} marcadas</AdminBadge>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleUpdateGracePeriod(item.id)} className="action-btn" title="Configurar Gracia" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Icons.Clock size={18} />
                  </button>
                  <a href={`${window.location.origin}/asistencia/${generateSlug(item.title)}`} target="_blank" rel="noreferrer" className="action-btn" title="Abrir Enlace" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Icons.Layout size={18} />
                  </a>
                  <button onClick={() => handleShowQR(item.id)} className="action-btn" title="Ver QR" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Icons.Camera size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination current={page} total={filteredAgenda.length} onPageChange={setPage} />
      </ModuleCard>

      <Modal isOpen={isGraceModalOpen} onClose={() => setIsGraceModalOpen(false)} title="Configurar Tolerancia" maxWidth="420px">
        <Alert variant="info" style={{ marginBottom: '1.5rem' }}>
          Actividad: <strong>{graceWorkshop?.title}</strong>
        </Alert>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <FormField label="HORAS" style={{ flex: 1 }}>
            <AdminSelect value={tempGraceHours.toString()} onChange={e => setTempGraceHours(parseInt(e.target.value))} options={[0,1,2,3].map(h => ({ value: h.toString(), label: `${h} h` }))} />
          </FormField>
          <FormField label="MINUTOS" style={{ flex: 1 }}>
            <AdminSelect value={tempGraceMinutes.toString()} onChange={e => setTempGraceMinutes(parseInt(e.target.value))} options={[0,5,10,15,20,25,30,45].map(m => ({ value: m.toString(), label: `${m} min` }))} />
          </FormField>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Límite de Asistencia</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Source Sans 3' }}>
            {(() => {
              if (!graceWorkshop) return '--:--';
              const total = (tempGraceHours * 60) + tempGraceMinutes;
              const [time, modifier] = graceWorkshop.endTime.split(' ');
              let [h, m] = time.split(':').map(Number);
              if (h === 12) h = modifier === 'PM' ? 12 : 0; else if (modifier === 'PM') h += 12;
              const d = new Date(); d.setHours(h, m + total, 0);
              return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            })()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <AdminButton onClick={saveGracePeriod} style={{ flex: 2 }}>Guardar Ajustes</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsGraceModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </Modal>

      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} showCloseButton={true} maxWidth="420px">
        <div style={{ marginTop: '1rem' }}>
          <AttendanceQR ref={qrRef} workshop={qrWorkshop!} link={qrLink} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <AdminButton onClick={handleDownloadQR} style={{ flex: 1 }} icon={<Icons.Download size={18} />}>Descargar PNG</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsQRModalOpen(false)} style={{ flex: 1 }}>Cerrar</AdminButton>
        </div>
      </Modal>
    </section>
  );
}

