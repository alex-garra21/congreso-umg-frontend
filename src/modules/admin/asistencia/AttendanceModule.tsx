import { useState, useRef } from 'react';
import { useAllUsers } from '../../../api/hooks/useUsers';
import { generateSlug, type AgendaItem } from '../../../utils/agendaStore';
import { useCharlas, useSaveAgenda } from '../../../api/hooks/useAgenda';
import ModuleTitle from '../../../components/ModuleTitle';
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

export default function AttendanceModule() {
  const { data: users = [] } = useAllUsers();
  const { data: agenda = [] } = useCharlas();
  const saveAgendaMutation = useSaveAgenda();
  const [searchAgenda, setSearchAgenda] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);
  const [graceWorkshop, setGraceWorkshop] = useState<AgendaItem | null>(null);
  const [tempGraceHours, setTempGraceHours] = useState<number>(0);
  const [tempGraceMinutes, setTempGraceMinutes] = useState<number>(10);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrWorkshop, setQRWorkshop] = useState<AgendaItem | null>(null);
  const [qrLink, setQRLink] = useState('');
  const qrRef = useRef<AttendanceQRHandle>(null);

  const handleDownloadQR = async () => {
    if (qrRef.current && qrWorkshop) {
      const node = qrRef.current.getCardRef();
      if (node) {
        try {
          const dataUrl = await toPng(node, { 
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          const link = document.createElement('a');
          link.download = `QR-Asistencia-${qrWorkshop.title.replace(/\s+/g, '-')}.png`;
          link.href = dataUrl;
          link.click();
        } catch (error) {
          console.error('Error al generar la imagen del QR:', error);
        }
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
      setIsSuccessModalOpen(true);
    });
  };

  const handleShowLink = (workshopId: string) => {
    const workshop = agenda.find(w => w.id === workshopId);
    if (!workshop) return;
    const slug = generateSlug(workshop.title);
    const link = `${window.location.origin}/asistencia/${slug}`;
    window.open(link, '_blank');
  };

  const handleShowQR = (workshopId: string) => {
    const workshop = agenda.find(w => w.id === workshopId);
    if (!workshop) return;
    const slug = generateSlug(workshop.title);
    const link = `${window.location.origin}/asistencia/${slug}`;
    
    setQRWorkshop(workshop);
    setQRLink(link);
    setIsQRModalOpen(true);
  };

  const filteredAgenda = agenda.filter(item => item.title.toLowerCase().includes(searchAgenda.toLowerCase()));
  const paginatedAgenda = filteredAgenda.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <section className="dashboard-section">
      <ModuleTitle title="Control de Asistencia" />

      <ModuleCard
        title="Asistencia por Taller"
        description="Gestiona los tiempos de gracia y genera los códigos de asistencia para cada actividad."
        headerActions={
          <SearchBar
            value={searchAgenda}
            onChange={(val) => { setSearchAgenda(val); setPage(1); }}
            placeholder="Buscar taller por nombre..."
            style={{ maxWidth: '350px' }}
          />
        }
      >
        <AdminTable
          headers={["Taller", "Horario", "Gracia", "Inscritos", "Asistencia", "Opciones"]}
          emptyMessage="No se encontraron talleres con los criterios de búsqueda."
        >
          {paginatedAgenda.map(item => (
            <tr key={item.id}>
              <td>
                <strong>{item.title}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.room}</div>
              </td>
              <td>{item.time} - {item.endTime}</td>
              <td>
                <AdminBadge variant="info">
                  {(() => {
                    const total = item.gracePeriod ?? 10;
                    if (total >= 60) {
                      const h = Math.floor(total / 60);
                      const m = total % 60;
                      return `+${h}h ${m}min`;
                    }
                    return `+${total} min`;
                  })()}
                </AdminBadge>
              </td>
              <td>
                <AdminBadge variant="neutral">
                  {users.filter(u => u.talleres?.includes(item.id)).length} inscritos
                </AdminBadge>
              </td>
              <td>
                <AdminBadge variant="success" dot>
                  {users.filter(u => u.asistencias?.some(a => a.workshopId === item.id)).length} asistieron
                </AdminBadge>
              </td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <AdminButton size="sm" variant="secondary" onClick={() => handleUpdateGracePeriod(item.id)} style={{ marginRight: '8px' }}>
                  Gracia
                </AdminButton>
                <AdminButton size="sm" variant="info" onClick={() => handleShowLink(item.id)} style={{ marginRight: '8px' }}>
                  Enlace
                </AdminButton>
                <AdminButton size="sm" variant="success" onClick={() => handleShowQR(item.id)}>
                  QR
                </AdminButton>
              </td>
            </tr>
          ))}
        </AdminTable>
        <Pagination current={page} total={filteredAgenda.length} onPageChange={setPage} />
      </ModuleCard>

      <Modal
        isOpen={isGraceModalOpen}
        onClose={() => setIsGraceModalOpen(false)}
        title="Configurar Tiempo de Gracia"
        maxWidth="400px"
      >
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Taller: <strong>{graceWorkshop?.title}</strong></p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <FormField label="Horas" style={{ flex: 1 }}>
            <AdminSelect 
              value={tempGraceHours.toString()}
              onChange={e => setTempGraceHours(parseInt(e.target.value))}
              options={[0,1,2,3,4,5].map(h => ({ value: h.toString(), label: `${h} h` }))}
            />
          </FormField>
          <FormField label="Minutos" style={{ flex: 1 }}>
            <AdminSelect 
              value={tempGraceMinutes.toString()}
              onChange={e => setTempGraceMinutes(parseInt(e.target.value))}
              options={[0,5,10,15,20,25,30,35,40,45,50,55].map(m => ({ value: m.toString(), label: `${m} min` }))}
            />
          </FormField>
        </div>

        <div style={{ 
          marginTop: '0.5rem', 
          padding: '1rem', 
          background: '#f8fafc', 
          borderRadius: '10px', 
          border: '1px solid #e2e8f0',
          fontSize: '13px',
          color: '#475569',
          lineHeight: 1.5
        }}>
          La asistencia se cerrará a las: <strong style={{ color: 'var(--blue)' }}>
            {(() => {
              if (!graceWorkshop) return '';
              const total = (tempGraceHours * 60) + tempGraceMinutes;
              const [time, modifier] = graceWorkshop.endTime.split(' ');
              let [hours, minutes] = time.split(':').map(Number);
              
              if (hours === 12) hours = modifier === 'PM' ? 12 : 0;
              else if (modifier === 'PM') hours += 12;
              
              const date = new Date();
              date.setHours(hours, minutes + total, 0);
              
              return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            })()}
          </strong>
          <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
            ({tempGraceHours > 0 ? `${tempGraceHours}h ` : ''}{tempGraceMinutes}min extra después del fin)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <AdminButton onClick={saveGracePeriod} style={{ flex: 1 }}>Guardar</AdminButton>
          <AdminButton variant="secondary" onClick={() => setIsGraceModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </Modal>

      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        showCloseButton={false}
        padding="0"
        maxWidth="400px"
        zIndex={10002}
        style={{ background: 'transparent', boxShadow: 'none' }}
      >
        <AttendanceQR ref={qrRef} workshop={qrWorkshop!} link={qrLink} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <button 
            className="btn-solid" 
            onClick={() => setIsQRModalOpen(false)}
            style={{ background: 'white', color: '#1a365d', fontWeight: 800, padding: '12px 30px', borderRadius: '100px', border: '1px solid #e2e8f0' }}
          >
            Cerrar
          </button>
          <button 
            className="btn-solid" 
            onClick={handleDownloadQR}
            style={{ 
              background: '#1a365d', 
              color: 'white', 
              fontWeight: 800, 
              padding: '12px 30px', 
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Icons.Download size={18} strokeWidth={2.5} />
            Descargar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="¡Configuración Guardada!"
        maxWidth="400px"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.CheckCircle size={64} color="#40c057" />
          </div>
          <p>El tiempo de gracia ha sido actualizado con éxito.</p>
          <AdminButton onClick={() => setIsSuccessModalOpen(false)} style={{ marginTop: '1.5rem', width: '100%' }}>Aceptar</AdminButton>
        </div>
      </Modal>
    </section>
  );
}
