import { useState, useMemo } from 'react';
import {
  type AgendaItem, type Speaker, type CategoryStyle
} from '../../../data/agendaData';
import { Pagination, ITEMS_PER_PAGE } from '../../../components/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import {
  useCharlas, usePonentes, useCategorias, useSalas,
  useSaveAgenda, useSavePonentes, useSaveCategorias, useSaveSalas
} from '../../../api/hooks/useAgenda';
import ModuleTitle from '../../../components/ModuleTitle';
import { showToast, showConfirm } from '../../../utils/swal';
import ColorPicker from '../../../components/ColorPicker';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminTabs from '../../../components/ui/AdminTabs';
import AdminSelect from '../../../components/ui/AdminSelect';
import ModuleCard from '../../../components/ui/ModuleCard';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AdminTable from '../../../components/ui/AdminTable';

export default function AgendaModule() {
  const { data: agenda = [] } = useCharlas();
  const { data: speakers = [] } = usePonentes();
  const { data: categories = {} } = useCategorias();
  const { data: rooms = [] } = useSalas();

  const saveAgendaMutation = useSaveAgenda();
  const savePonentesMutation = useSavePonentes();
  const saveCategoriasMutation = useSaveCategorias();
  const saveSalasMutation = useSaveSalas();

  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories' | 'rooms'>('schedule');

  // Modals
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string, style: CategoryStyle } | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ oldName: string, newName: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Utilidad para traducir errores de la base de datos
  const translateError = (errorMsg: string) => {
    if (errorMsg.includes('violates foreign key constraint')) {
      if (errorMsg.includes('id_categoria')) return 'La categoría seleccionada no es válida o debe elegir una.';
      if (errorMsg.includes('id_ponente')) return 'El ponente seleccionado no existe.';
      return 'Hay un error de relación con otros datos.';
    }
    if (errorMsg.includes('not-null constraint')) return 'Faltan campos obligatorios por llenar.';
    if (errorMsg.includes('unique constraint')) return 'Ya existe un registro con ese nombre.';
    return errorMsg;
  };

  const handleSaveAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const newAgenda = agenda.some(a => a.id === editingItem.id)
        ? agenda.map(a => a.id === editingItem.id ? editingItem : a)
        : [...agenda, editingItem];

      await saveAgendaMutation.mutateAsync(newAgenda);
      setIsAgendaModalOpen(false);
      showToast('Cambios guardados correctamente', 'success');
    } catch (error: any) {
      console.error("Error al guardar actividad:", error);
      showToast(`Error al guardar: ${translateError(error.message || 'Error de conexión')}`, 'error');
    }
  };

  const handleDeleteAgendaItem = (id: string) => {
    showConfirm('Eliminar Taller', '¿Eliminar taller de la agenda?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newAgenda = agenda.filter(a => a.id !== id);
          await saveAgendaMutation.mutateAsync(newAgenda);
          showToast('Actividad eliminada', 'success');
        } catch (error: any) {
          showToast(`Error al eliminar: ${error.message}`, 'error');
        }
      }
    });
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;

    try {
      const speakerWithInitials = {
        ...editingSpeaker,
        initials: editingSpeaker.initials || editingSpeaker.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      const newSpeakers = speakers.some(s => s.id === speakerWithInitials.id)
        ? speakers.map(s => s.id === speakerWithInitials.id ? speakerWithInitials : s)
        : [...speakers, speakerWithInitials];

      await savePonentesMutation.mutateAsync(newSpeakers);
      setIsSpeakerModalOpen(false);
      showToast('Ponente guardado', 'success');
    } catch (error: any) {
      showToast(`Error al guardar ponente: ${translateError(error.message)}`, 'error');
    }
  };

  const handleDeleteSpeaker = (id: number) => {
    showConfirm('Eliminar Ponente', '¿Eliminar ponente?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newSpeakers = speakers.filter(s => s.id !== id);
          await savePonentesMutation.mutateAsync(newSpeakers);
          showToast('Ponente eliminado', 'success');
        } catch (error: any) {
          showToast(`Error al eliminar: ${error.message}`, 'error');
        }
      }
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const newCategories = { ...categories, [editingCategory.name]: editingCategory.style };
      await saveCategoriasMutation.mutateAsync(newCategories);
      setIsCategoryModalOpen(false);
      showToast('Categoría guardada', 'success');
    } catch (error: any) {
      showToast(`Error al guardar categoría: ${translateError(error.message)}`, 'error');
    }
  };

  const handleDeleteCategory = (name: string) => {
    showConfirm('Eliminar Categoría', '¿Eliminar categoría?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newCategories = { ...categories };
          delete newCategories[name];
          await saveCategoriasMutation.mutateAsync(newCategories);
          showToast('Categoría eliminada', 'success');
        } catch (error: any) {
          showToast(`Error al eliminar: ${error.message}`, 'error');
        }
      }
    });
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      let newRooms = [...rooms];
      let newAgenda = [...agenda];

      if (editingRoom.oldName && rooms.includes(editingRoom.oldName)) {
        newRooms = newRooms.map(r => r === editingRoom.oldName ? editingRoom.newName : r);
        newAgenda = agenda.map(a => a.room === editingRoom.oldName ? { ...a, room: editingRoom.newName, location: editingRoom.newName } : a);
      } else if (!rooms.includes(editingRoom.newName)) {
        newRooms.push(editingRoom.newName);
      }

      await Promise.all([
        saveSalasMutation.mutateAsync(newRooms),
        saveAgendaMutation.mutateAsync(newAgenda)
      ]);

      setIsRoomModalOpen(false);
      showToast('Sala actualizada correctamente', 'success');
    } catch (error: any) {
      showToast(`Error al guardar sala: ${translateError(error.message)}`, 'error');
    }
  };

  const handleDeleteRoom = (roomName: string) => {
    showConfirm('Eliminar Sala', `¿Eliminar la sala "${roomName}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newRooms = rooms.filter(r => r !== roomName);
          await saveSalasMutation.mutateAsync(newRooms);
          showToast('Sala eliminada', 'success');
        } catch (error: any) {
          showToast(`Error al eliminar: ${error.message}`, 'error');
        }
      }
    });
  };

  const parseTimeToNumber = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) return 0;
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  };

  const { filteredAgenda, currentAgenda } = useMemo(() => {
    const filtered = agenda.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => parseTimeToNumber(a.time) - parseTimeToNumber(b.time));
    const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { filteredAgenda: filtered, currentAgenda: paginated };
  }, [agenda, searchTerm, currentPage]);

  const { filteredSpeakers, currentSpeakers } = useMemo(() => {
    const filtered = speakers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { filteredSpeakers: filtered, currentSpeakers: paginated };
  }, [speakers, searchTerm, currentPage]);

  const { filteredCategories, currentCategories } = useMemo(() => {
    const filtered = Object.entries(categories).filter(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { filteredCategories: filtered, currentCategories: paginated };
  }, [categories, searchTerm, currentPage]);


  return (
    <section className="dashboard-section">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <ModuleTitle title="Gestión de Agenda" />
        <AdminTabs
          tabs={[
            { id: 'schedule', label: 'Horario' },
            { id: 'speakers', label: 'Ponentes' },
            { id: 'categories', label: 'Categorías' },
            { id: 'rooms', label: 'Salas' }
          ]}
          activeTab={agendaTab}
          onTabChange={(id) => { setAgendaTab(id as any); setCurrentPage(1); setSearchTerm(''); }}
        />
      </div>

      {agendaTab === 'schedule' && (
        <ModuleCard
          title="Cronograma de Actividades"
          description="Gestiona las charlas y talleres del congreso."
          headerActions={
            <AdminButton onClick={() => {
              setEditingItem({ id: Math.random().toString(36).substr(2, 9), title: '', time: '', endTime: '', room: rooms[0] || '', location: rooms[0] || '', tag: '', speaker: undefined, gracePeriod: 10, description: '', period: 'Mañana' });
              setIsAgendaModalOpen(true);
            }}>+ Agregar Actividad</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar
              value={searchTerm}
              onChange={(val: string) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar actividad..."
            />
          </div>
          <AdminTable 
            headers={["Horario", "Actividad", "Ubicación", "Categoría", "Opciones"]}
            emptyMessage="No hay actividades registradas."
          >
            {currentAgenda.map(item => (
              <tr key={item.id}>
                <td>{item.time} - {item.endTime}</td>
                <td>
                  <strong>{item.title}</strong>
                  {item.speaker && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ponente: {item.speaker.name}</div>}
                </td>
                <td>{item.room}</td>
                <td>{item.tag && <AdminBadge variant="neutral" style={{ backgroundColor: categories[item.tag]?.bg, color: categories[item.tag]?.text }}>{item.tag}</AdminBadge>}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <AdminButton size="sm" variant="info" onClick={() => { setEditingItem(item); setIsAgendaModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDeleteAgendaItem(item.id)}>Eliminar</AdminButton>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination current={currentPage} total={filteredAgenda.length} onPageChange={setCurrentPage} />
        </ModuleCard>
      )}

      {agendaTab === 'speakers' && (
        <ModuleCard
          title="Ponentes"
          description="Listado de expertos que participarán en el evento."
          headerActions={
            <AdminButton onClick={() => {
              const nextId = speakers.length > 0 ? Math.max(...speakers.map(s => s.id)) + 1 : 1;
              setEditingSpeaker({ id: nextId, name: '', role: '', avatar: '', bio: '', initials: '', tag: '', bgColor: '#ffffff', textColor: '#01579b' });
              setIsSpeakerModalOpen(true);
            }}>+ Agregar Ponente</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar
              value={searchTerm}
              onChange={(val: string) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar ponente..."
            />
          </div>
          <AdminTable headers={["Nombre", "Cargo / Rol", "Opciones"]} emptyMessage="No hay ponentes registrados.">
            {currentSpeakers.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.role}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <AdminButton size="sm" variant="info" onClick={() => { setEditingSpeaker(s); setIsSpeakerModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDeleteSpeaker(s.id)}>Eliminar</AdminButton>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination current={currentPage} total={filteredSpeakers.length} onPageChange={setCurrentPage} />
        </ModuleCard>
      )}

      {agendaTab === 'categories' && (
        <ModuleCard
          title="Categorías"
          description="Etiquetas visuales para clasificar las actividades."
          headerActions={
            <AdminButton onClick={() => {
              setEditingCategory({ name: '', style: { bg: '#eef2ff', text: '#4338ca' } });
              setIsCategoryModalOpen(true);
            }}>+ Nueva Categoría</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar
              value={searchTerm}
              onChange={(val: string) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar categoría..."
            />
          </div>
          <AdminTable headers={["Nombre", "Vista Previa", "Opciones"]} emptyMessage="No hay categorías registradas.">
            {currentCategories.map(([name, style]) => (
              <tr key={name}>
                <td><strong>{name}</strong></td>
                <td><AdminBadge style={{ backgroundColor: style.bg, color: style.text }}>{name}</AdminBadge></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <AdminButton size="sm" variant="info" onClick={() => { setEditingCategory({ name, style }); setIsCategoryModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDeleteCategory(name)}>Eliminar</AdminButton>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination current={currentPage} total={filteredCategories.length} onPageChange={setCurrentPage} />
        </ModuleCard>
      )}

      {agendaTab === 'rooms' && (
        <ModuleCard
          title="Salas y Ubicaciones"
          description="Espacios físicos donde se llevarán a cabo las actividades."
          headerActions={
            <AdminButton onClick={() => {
              setEditingRoom({ oldName: '', newName: '' });
              setIsRoomModalOpen(true);
            }}>+ Nueva Sala</AdminButton>
          }
        >
          <AdminTable headers={["Nombre de la Sala", "Opciones"]} emptyMessage="No hay salas registradas.">
            {rooms.map(room => (
              <tr key={room}>
                <td><strong>{room}</strong></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <AdminButton size="sm" variant="info" onClick={() => { setEditingRoom({ oldName: room, newName: room }); setIsRoomModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDeleteRoom(room)}>Eliminar</AdminButton>
                </td>
              </tr>
            ))}
          </AdminTable>
        </ModuleCard>
      )}

      {/* Agenda Modal */}
      {isAgendaModalOpen && editingItem && (
        <Modal
          isOpen={isAgendaModalOpen}
          onClose={() => setIsAgendaModalOpen(false)}
          title={`${agenda.some(a => a.id === editingItem.id) ? 'Editar' : 'Nueva'} Actividad`}
          maxWidth="600px"
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>
          <form onSubmit={handleSaveAgendaItem}>
            <FormField label="TÍTULO" required>
              <input type="text" className="dashboard-input" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} required />
            </FormField>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="HORA INICIO" required style={{ flex: 1 }}>
                <AdminSelect
                  value={editingItem.time}
                  onChange={e => setEditingItem({ ...editingItem, time: e.target.value })}
                  required
                  options={[
                    ...Array.from({ length: 15 * 4 }).map((_, i) => {
                      const totalMinutes = (7 * 60) + (i * 15);
                      let hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12;
                      if (hours === 0) hours = 12;
                      const timeStr = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                      return { value: timeStr, label: timeStr };
                    })
                  ]}
                />
              </FormField>
              <FormField label="HORA FIN" required style={{ flex: 1 }}>
                <AdminSelect
                  value={editingItem.endTime}
                  onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })}
                  required
                  options={[
                    ...Array.from({ length: 15 * 4 }).map((_, i) => {
                      const totalMinutes = (7 * 60) + (i * 15);
                      let hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12;
                      if (hours === 0) hours = 12;
                      const timeStr = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                      return { value: timeStr, label: timeStr };
                    })
                  ]}
                />
              </FormField>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormField label="SALA / UBICACIÓN" required style={{ flex: 1 }}>
                <AdminSelect
                  value={editingItem.room}
                  onChange={e => setEditingItem({ ...editingItem, room: e.target.value, location: e.target.value })}
                  required
                  options={rooms.map(r => ({ value: r, label: r }))}
                />
              </FormField>
              <FormField label="CATEGORÍA" required style={{ flex: 1 }}>
                <AdminSelect
                  value={editingItem.tag}
                  onChange={e => setEditingItem({ ...editingItem, tag: e.target.value })}
                  required
                  options={[
                    { value: '', label: 'Seleccionar...' },
                    ...Object.keys(categories).map(c => ({ value: c, label: c }))
                  ]}
                />
              </FormField>
            </div>

            <FormField label="PONENTE (Opcional)">
              <AdminSelect
                value={editingItem.speaker?.id || ''}
                onChange={e => {
                  const s = speakers.find(sp => sp.id === parseInt(e.target.value));
                  setEditingItem({ ...editingItem, speaker: s });
                }}
                options={[
                  { value: '', label: 'Sin ponente' },
                  ...speakers.map(s => ({ value: s.id.toString(), label: s.name }))
                ]}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <AdminButton type="submit" style={{ flex: 1 }}>Guardar Actividad</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsAgendaModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Speaker Modal */}
      {isSpeakerModalOpen && editingSpeaker && (
        <Modal
          isOpen={isSpeakerModalOpen}
          onClose={() => setIsSpeakerModalOpen(false)}
          title={`${speakers.some(s => s.id === editingSpeaker.id) ? 'Editar' : 'Nuevo'} Ponente`}
          maxWidth="600px"
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>
          <form onSubmit={handleSaveSpeaker}>
            <FormField label="NOMBRE" required>
              <input type="text" className="dashboard-input" value={editingSpeaker.name} onChange={e => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })} required />
            </FormField>
            <FormField label="CARGO / ROL" required>
              <input type="text" className="dashboard-input" value={editingSpeaker.role} onChange={e => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })} required />
            </FormField>
            <FormField label="BIO (Opcional)">
              <textarea className="dashboard-input" value={editingSpeaker.bio} onChange={e => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })} style={{ minHeight: '100px' }} />
            </FormField>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <AdminButton type="submit" style={{ flex: 1 }}>Guardar Ponente</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsSpeakerModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && editingCategory && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={`${editingCategory.name ? 'Editar' : 'Nueva'} Categoría`}
          maxWidth="450px"
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>
          <form onSubmit={handleSaveCategory}>
            <FormField label="NOMBRE DE CATEGORÍA" required>
              <input type="text" className="dashboard-input" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
            </FormField>
            <FormField label="COLOR TEXTO" required>
              <ColorPicker
                selectedColor={editingCategory.style.text}
                onSelect={c => {
                  const bgWithAlpha = c.startsWith('#') ? c + '26' : c;
                  setEditingCategory({
                    ...editingCategory,
                    style: { ...editingCategory.style, text: c, bg: bgWithAlpha }
                  });
                }}
              />
            </FormField>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '10px', color: '#868e96', fontWeight: 700, textTransform: 'uppercase' }}>Previsualización</label>
              <AdminBadge style={{ backgroundColor: editingCategory.style.bg, color: editingCategory.style.text, fontSize: '14px', padding: '6px 16px' }}>
                {editingCategory.name || 'Ejemplo'}
              </AdminBadge>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <AdminButton type="submit" style={{ flex: 1 }}>Guardar Categoría</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && editingRoom && (
        <Modal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          title={`${editingRoom.oldName ? 'Editar' : 'Nueva'} Sala`}
          maxWidth="450px"
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>
          <form onSubmit={handleSaveRoom}>
            <FormField label="NOMBRE DE LA SALA" required>
              <input type="text" className="dashboard-input" value={editingRoom.newName} onChange={e => setEditingRoom({ ...editingRoom, newName: e.target.value })} required />
            </FormField>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <AdminButton type="submit" style={{ flex: 1 }}>Guardar Sala</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setIsRoomModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
