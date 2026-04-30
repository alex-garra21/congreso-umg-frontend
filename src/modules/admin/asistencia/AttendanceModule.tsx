import { useState, useEffect } from 'react';
import { getAllUsersQuery } from '../../../api/supabase/users/userQueries';
import { type UserData } from '../../../utils/auth';
import { getAgenda, saveAgenda, generateSlug, type AgendaItem } from '../../../utils/agendaStore';
import ModuleTitle from '../../../components/ModuleTitle';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import SearchBar from '../../../components/ui/SearchBar';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminSelect from '../../../components/ui/AdminSelect';
import Swal from 'sweetalert2';

export default function AttendanceModule() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>(getAgenda());
  const [searchAgenda, setSearchAgenda] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false);
  const [graceWorkshop, setGraceWorkshop] = useState<AgendaItem | null>(null);
  const [tempGraceHours, setTempGraceHours] = useState<number>(0);
  const [tempGraceMinutes, setTempGraceMinutes] = useState<number>(10);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    getAllUsersQuery().then(setUsers);
  }, []);

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
    setAgenda(newAgenda);
    saveAgenda(newAgenda);
    setIsGraceModalOpen(false);
    setIsSuccessModalOpen(true);
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
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}`;

    Swal.fire({
      title: 'Código QR',
      html: `<p style="margin-bottom: 1.5rem; color: #4a5568; font-size: 14px;">${workshop.title}</p><img src="${qrUrl}" alt="QR Code" style="display: block; margin: 0 auto; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px;" />`,
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1a365d',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title'
      }
    });
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
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Taller</th>
                <th>Horario</th>
                <th>Gracia</th>
                <th>Inscritos</th>
                <th>Asistencia</th>
                <th style={{ textAlign: 'right' }}>Opciones</th>
              </tr>
            </thead>
            <tbody>
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
              {paginatedAgenda.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>No se encontraron talleres con los criterios de búsqueda.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={filteredAgenda.length} onPageChange={setPage} />
      </ModuleCard>

      {/* Modal Gracia */}
      {isGraceModalOpen && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontFamily: 'Syne', fontWeight: 800 }}>Configurar Tiempo de Gracia</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>Taller: <strong>{graceWorkshop?.title}</strong></p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <AdminSelect 
                  label="HORAS"
                  value={tempGraceHours.toString()}
                  onChange={e => setTempGraceHours(parseInt(e.target.value))}
                  options={[0,1,2,3,4,5].map(h => ({ value: h.toString(), label: `${h} h` }))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <AdminSelect 
                  label="MINUTOS"
                  value={tempGraceMinutes.toString()}
                  onChange={e => setTempGraceMinutes(parseInt(e.target.value))}
                  options={[0,5,10,15,20,25,30,35,40,45,50,55].map(m => ({ value: m.toString(), label: `${m} min` }))}
                />
              </div>
            </div>

            <div style={{ 
              marginTop: '1.5rem', 
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
              <AdminButton onClick={saveGracePeriod} style={{ flex: 1 }}>Guardar Cambios</AdminButton>
              <AdminButton variant="secondary" onClick={() => setIsGraceModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Éxito */}
      {isSuccessModalOpen && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#40c057' }}>✓</div>
            <h3>¡Configuración Guardada!</h3>
            <p>El tiempo de gracia ha sido actualizado.</p>
            <button className="btn-lg btn-lg-primary" onClick={() => setIsSuccessModalOpen(false)} style={{ marginTop: '1.5rem' }}>Aceptar</button>
          </div>
        </div>
      )}
    </section>
  );
}
