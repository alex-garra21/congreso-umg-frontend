import { useState } from 'react';
import {
  getAgenda, saveAgenda,
  getSpeakers, saveSpeakers,
  getCategories, saveCategories,
  getRooms, saveRooms,
  type AgendaItem, type Speaker, type CategoryStyle
} from '../../../utils/agendaStore';
import ModuleTitle from '../../../components/ModuleTitle';
import { showConfirm } from '../../../utils/swal';
import ColorPicker from '../../../components/ColorPicker';
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminTabs from '../../../components/ui/AdminTabs';
import AdminSelect from '../../../components/ui/AdminSelect';
import ModuleCard from '../../../components/ui/ModuleCard';

export default function AgendaModule() {
  const [agenda, setAgenda] = useState<AgendaItem[]>(getAgenda());
  const [speakers, setSpeakers] = useState<Speaker[]>(getSpeakers());
  const [categories, setCategories] = useState<Record<string, CategoryStyle>>(getCategories());
  const [rooms, setRooms] = useState<string[]>(getRooms());

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



  const handleSaveAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const newAgenda = agenda.some(a => a.id === editingItem.id)
      ? agenda.map(a => a.id === editingItem.id ? editingItem : a)
      : [...agenda, editingItem];
    setAgenda(newAgenda);
    saveAgenda(newAgenda);
    setIsAgendaModalOpen(false);
  };

  const handleDeleteAgendaItem = (id: string) => {
    showConfirm('Eliminar Taller', '¿Eliminar taller de la agenda?', 'Eliminar', true).then(confirmed => {
      if (confirmed) {
        const newAgenda = agenda.filter(a => a.id !== id);
        setAgenda(newAgenda);
        saveAgenda(newAgenda);
      }
    });
  };

  const handleSaveSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;
    const newSpeakers = speakers.some(s => s.id === editingSpeaker.id)
      ? speakers.map(s => s.id === editingSpeaker.id ? editingSpeaker : s)
      : [...speakers, editingSpeaker];
    setSpeakers(newSpeakers);
    saveSpeakers(newSpeakers);
    setIsSpeakerModalOpen(false);
  };

  const handleDeleteSpeaker = (id: number) => {
    showConfirm('Eliminar Ponente', '¿Eliminar ponente?', 'Eliminar', true).then(confirmed => {
      if (confirmed) {
        const newSpeakers = speakers.filter(s => s.id !== id);
        setSpeakers(newSpeakers);
        saveSpeakers(newSpeakers);
      }
    });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const newCategories = { ...categories, [editingCategory.name]: editingCategory.style };
    setCategories(newCategories);
    saveCategories(newCategories);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (name: string) => {
    showConfirm('Eliminar Categoría', '¿Eliminar categoría?', 'Eliminar', true).then(confirmed => {
      if (confirmed) {
        const newCategories = { ...categories };
        delete newCategories[name];
        setCategories(newCategories);
        saveCategories(newCategories);
      }
    });
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.newName.trim()) return;

    let newRooms = [...rooms];
    if (editingRoom.oldName && rooms.includes(editingRoom.oldName)) {
      newRooms = newRooms.map(r => r === editingRoom.oldName ? editingRoom.newName : r);
      const newAgenda = agenda.map(a => a.room === editingRoom.oldName ? { ...a, room: editingRoom.newName, location: editingRoom.newName } : a);
      setAgenda(newAgenda);
      saveAgenda(newAgenda);
    } else if (!rooms.includes(editingRoom.newName)) {
      newRooms.push(editingRoom.newName);
    }

    setRooms(newRooms);
    saveRooms(newRooms);
    setIsRoomModalOpen(false);
  };

  const handleDeleteRoom = (roomName: string) => {
    showConfirm('Eliminar Sala', `¿Eliminar la sala "${roomName}"?`, 'Eliminar', true).then(confirmed => {
      if (confirmed) {
        const newRooms = rooms.filter(r => r !== roomName);
        setRooms(newRooms);
        saveRooms(newRooms);
      }
    });
  };

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
                {agenda.sort((a, b) => a.time.localeCompare(b.time)).map(item => (
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
                {agenda.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay actividades registradas en la agenda.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                {speakers.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.role}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <AdminButton size="sm" variant="info" onClick={() => { setEditingSpeaker(s); setIsSpeakerModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => handleDeleteSpeaker(s.id)}>Eliminar</AdminButton>
                    </td>
                  </tr>
                ))}
                {speakers.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay ponentes registrados.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                {Object.entries(categories).map(([name, style]) => (
                  <tr key={name}>
                    <td><strong>{name}</strong></td>
                    <td><AdminBadge style={{ backgroundColor: style.bg, color: style.text }}>{name}</AdminBadge></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <AdminButton size="sm" variant="info" onClick={() => { setEditingCategory({ name, style }); setIsCategoryModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => handleDeleteCategory(name)}>Eliminar</AdminButton>
                    </td>
                  </tr>
                ))}
                {Object.keys(categories).length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No hay categorías registradas.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                <div className="form-group" style={{ flex: 1 }}>
                  <label>HORA INICIO</label>
                  <input type="text" className="dashboard-input" value={editingItem.time} onChange={e => setEditingItem({ ...editingItem, time: e.target.value })} placeholder="Ej: 8:00 AM" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>HORA FIN</label>
                  <input type="text" className="dashboard-input" value={editingItem.endTime} onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })} placeholder="Ej: 9:00 AM" required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
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
