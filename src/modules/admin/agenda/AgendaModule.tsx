import { useState } from 'react';
import {
  type AgendaItem, type Speaker, type CategoryStyle
} from '../../../data/agendaData';
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



  const handleSaveAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const newAgenda = agenda.some(a => a.id === editingItem.id)
        ? currentAgenda.map(a => a.id === editingItem.id ? editingItem : a)
        : [...agenda, editingItem];

      // Intentar guardar (esto ahora lanzará error si falla la nube)
      await saveAgendaMutation.mutateAsync(newAgenda);

      setIsAgendaModalOpen(false);
      showToast('Cambios guardados correctamente', 'success');
    } catch (error: any) {
      console.error("Error al guardar actividad:", error);
      showToast(`Error al guardar: ${error.message || 'Error de conexión'}`, 'error');
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
      const newSpeakers = speakers.some(s => s.id === editingSpeaker.id)
        ? speakers.map(s => s.id === editingSpeaker.id ? editingSpeaker : s)
        : [...speakers, editingSpeaker];
      await savePonentesMutation.mutateAsync(newSpeakers);
      setIsSpeakerModalOpen(false);
      showToast('Ponente guardado', 'success');
    } catch (error: any) {
      showToast(`Error al guardar ponente: ${error.message}`, 'error');
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
      showToast(`Error: ${error.message}`, 'error');
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
    if (!editingRoom || !editingRoom.newName.trim()) return;

    try {
      let newRooms = [...rooms];
      let newAgenda = [...agenda];

      if (editingRoom.oldName && rooms.includes(editingRoom.oldName)) {
        newRooms = newRooms.map(r => r === editingRoom.oldName ? editingRoom.newName : r);
        newAgenda = agenda.map(a => a.room === editingRoom.oldName ? { ...a, room: editingRoom.newName, location: editingRoom.newName } : a);
      } else if (!rooms.includes(editingRoom.newName)) {
        newRooms.push(editingRoom.newName);
      }

      // Guardar ambos en la nube
      await Promise.all([
        saveSalasMutation.mutateAsync(newRooms),
        saveAgendaMutation.mutateAsync(newAgenda)
      ]);

      setIsRoomModalOpen(false);
      showToast('Sala actualizada correctamente', 'success');
    } catch (error: any) {
      showToast(`Error al guardar sala: ${error.message}`, 'error');
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

  // Función para convertir "8:00 AM" en un valor numérico comparable
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

  // Filtrado y Paginación para Horario
  const filteredAgenda = agenda.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentAgenda = filteredAgenda
    .sort((a, b) => parseTimeToNumber(a.time) - parseTimeToNumber(b.time))
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Filtrado y Paginación para Ponentes
  const filteredSpeakers = speakers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentSpeakers = filteredSpeakers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Filtrado y Paginación para Categorías
  const filteredCategories = Object.entries(categories).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


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
          onTabChange={(id) => setAgendaTab(id as any)}
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
            }}>+ Agregar Charla/Taller</AdminButton>

          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar
              value={searchTerm}
              onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar..."
            />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Actividad</th>
                  <th>Ubicación</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {currentAgenda.map(item => (
                  <tr key={item.id}>
                    <td>{item.time} - {item.endTime}</td>
                    <td>
                      <strong>{item.title}</strong>
                      {item.speaker && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ponente: {item.speaker.name}</div>}
                    </td>
                    <td>{item.room}</td>
                    <td>{item.tag && <AdminBadge variant="neutral" style={{ backgroundColor: categories[item.tag]?.bg, color: categories[item.tag]?.text }}>{item.tag}</AdminBadge>}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <AdminButton size="sm" variant="info" onClick={() => { setEditingItem(item); setIsAgendaModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => handleDeleteAgendaItem(item.id)}>Eliminar</AdminButton>
                    </td>
                  </tr>
                ))}
                {currentAgenda.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay actividades registradas en la agenda.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={currentPage}
            total={filteredAgenda.length}
            onPageChange={setCurrentPage}
          />
        </ModuleCard>
      )}

      {agendaTab === 'speakers' && (
        <ModuleCard
          title="Ponentes"
          description="Listado de expertos que participarán en el evento."
          headerActions={
            <AdminButton onClick={() => {
              setEditingSpeaker({ id: Date.now(), name: '', role: '', avatar: '', bio: '', initials: '', tag: '', bgColor: '#ffffff', textColor: '#01579b' });
              setIsSpeakerModalOpen(true);
            }}>+ Agregar Ponente</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar
              value={searchTerm}
              onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar..."
            />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo / Rol</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
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
                {currentSpeakers.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay ponentes registrados.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={currentPage}
            total={filteredSpeakers.length}
            onPageChange={setCurrentPage}
          />
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
              onChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar..."
            />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Vista Previa</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
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
                {currentCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay categorías registradas.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={currentPage}
            total={filteredCategories.length}
            onPageChange={setCurrentPage}
          />
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
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre de la Sala</th>
                  <th style={{ textAlign: 'right' }}>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room}>
                    <td><strong>{room}</strong></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <AdminButton size="sm" variant="info" onClick={() => { setEditingRoom({ oldName: room, newName: room }); setIsRoomModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => handleDeleteRoom(room)}>Eliminar</AdminButton>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay salas registradas.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ModuleCard>
      )}

      {/* Agenda Modal */}
      {isAgendaModalOpen && editingItem && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne', fontWeight: 800 }}>{editingItem.id ? 'Editar' : 'Nueva'} Actividad</h3>
            <form onSubmit={handleSaveAgendaItem} className="admin-form">
              <div className="form-group">
                <label>TÍTULO</label>
                <input type="text" className="dashboard-input" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <AdminSelect
                  label="HORA INICIO"
                  value={editingItem.time}
                  onChange={e => setEditingItem({ ...editingItem, time: e.target.value })}
                  containerStyle={{ flex: 1 }}
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
                <AdminSelect
                  label="HORA FIN"
                  value={editingItem.endTime}
                  onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })}
                  containerStyle={{ flex: 1 }}
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
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <AdminSelect
                  label="SALA / UBICACIÓN"
                  value={editingItem.room}
                  onChange={e => setEditingItem({ ...editingItem, room: e.target.value, location: e.target.value })}
                  containerStyle={{ flex: 1 }}
                  options={rooms.map(r => ({ value: r, label: r }))}
                />
                <AdminSelect
                  label="CATEGORÍA"
                  value={editingItem.tag}
                  onChange={e => setEditingItem({ ...editingItem, tag: e.target.value })}
                  containerStyle={{ flex: 1 }}
                  options={[
                    { value: '', label: 'Ninguna' },
                    ...Object.keys(categories).map(c => ({ value: c, label: c }))
                  ]}
                />
              </div>
              <AdminSelect
                label="PONENTE (Opcional)"
                value={editingItem.speaker?.id || ''}
                onChange={e => {
                  const s = speakers.find(sp => sp.id === parseInt(e.target.value));
                  setEditingItem({ ...editingItem, speaker: s });
                }}
                containerStyle={{ marginTop: '1rem' }}
                options={[
                  { value: '', label: 'Sin ponente' },
                  ...speakers.map(s => ({ value: s.id.toString(), label: s.name }))
                ]}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <AdminButton type="submit" style={{ flex: 1 }}>Guardar Actividad</AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => setIsAgendaModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speaker Modal */}
      {isSpeakerModalOpen && editingSpeaker && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne', fontWeight: 800 }}>Editar Ponente</h3>
            <form onSubmit={handleSaveSpeaker} className="admin-form">
              <div className="form-group"><label>NOMBRE</label><input type="text" className="dashboard-input" value={editingSpeaker.name} onChange={e => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })} required /></div>
              <div className="form-group"><label>CARGO / ROL</label><input type="text" className="dashboard-input" value={editingSpeaker.role} onChange={e => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })} required /></div>
              <div className="form-group"><label>BIO (Opcional)</label><textarea className="dashboard-input" value={editingSpeaker.bio} onChange={e => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })} style={{ minHeight: '100px' }} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <AdminButton type="submit" style={{ flex: 1 }}>Guardar Ponente</AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => setIsSpeakerModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne', fontWeight: 800 }}>Editar Categoría</h3>
            <form onSubmit={handleSaveCategory} className="admin-form">
              <div className="form-group"><label>NOMBRE DE CATEGORÍA</label><input type="text" className="dashboard-input" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} required /></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>COLOR TEXTO</label>
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
                </div>
              </div>

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
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && editingRoom && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Syne', fontWeight: 800 }}>{editingRoom.oldName ? 'Editar' : 'Nueva'} Sala</h3>
            <form onSubmit={handleSaveRoom} className="admin-form">
              <div className="form-group">
                <label>NOMBRE DE LA SALA</label>
                <input type="text" className="dashboard-input" value={editingRoom.newName} onChange={e => setEditingRoom({ ...editingRoom, newName: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <AdminButton type="submit" style={{ flex: 1 }}>Guardar Sala</AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => setIsRoomModalOpen(false)} style={{ flex: 1 }}>Cancelar</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
