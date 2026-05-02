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
import AdminButton from '../../../components/ui/AdminButton';
import AdminBadge from '../../../components/ui/AdminBadge';
import AdminTabs from '../../../components/ui/AdminTabs';
import ModuleCard from '../../../components/ui/ModuleCard';
import AdminTable from '../../../components/ui/AdminTable';

// Sub-componentes refactorizados
import AgendaItemModal from './components/AgendaItemModal';
import SpeakerEditModal from './components/SpeakerEditModal';
import CategoryEditModal from './components/CategoryEditModal';
import RoomEditModal from './components/RoomEditModal';

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

  // Modals state
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
      if (errorMsg.includes('id_categoria')) return 'La categoría seleccionada no es válida.';
      if (errorMsg.includes('id_ponente')) return 'El ponente seleccionado no existe.';
      return 'Hay un error de relación con otros datos.';
    }
    if (errorMsg.includes('not-null constraint')) return 'Faltan campos obligatorios.';
    if (errorMsg.includes('unique constraint')) return 'Ya existe un registro con ese nombre.';
    return errorMsg;
  };

  // HANDLERS
  const handleSaveAgendaItem = async (updatedItem: AgendaItem) => {
    try {
      const newAgenda = agenda.some(a => a.id === updatedItem.id)
        ? agenda.map(a => a.id === updatedItem.id ? updatedItem : a)
        : [...agenda, updatedItem];

      await saveAgendaMutation.mutateAsync(newAgenda);
      setIsAgendaModalOpen(false);
      showToast('Actividad guardada correctamente', 'success');
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  const handleSaveSpeaker = async (updatedSpeaker: Speaker) => {
    try {
      const speakerWithInitials = {
        ...updatedSpeaker,
        initials: updatedSpeaker.initials || updatedSpeaker.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      const newSpeakers = speakers.some(s => s.id === speakerWithInitials.id)
        ? speakers.map(s => s.id === speakerWithInitials.id ? speakerWithInitials : s)
        : [...speakers, speakerWithInitials];

      await savePonentesMutation.mutateAsync(newSpeakers);
      setIsSpeakerModalOpen(false);
      showToast('Ponente guardado', 'success');
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  const handleSaveCategory = async (updatedCat: { name: string, style: CategoryStyle }) => {
    try {
      const newCategories = { ...categories };
      if (editingCategory?.name && editingCategory.name !== updatedCat.name) {
        delete newCategories[editingCategory.name];
      }
      newCategories[updatedCat.name] = updatedCat.style;
      await saveCategoriasMutation.mutateAsync(newCategories);
      setIsCategoryModalOpen(false);
      showToast('Categoría guardada', 'success');
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  const handleSaveRoom = async (updatedRoom: { oldName: string, newName: string }) => {
    try {
      let newRooms = [...rooms];
      let newAgenda = [...agenda];
      if (updatedRoom.oldName) {
        newRooms = newRooms.map(r => r === updatedRoom.oldName ? updatedRoom.newName : r);
        newAgenda = agenda.map(a => a.room === updatedRoom.oldName ? { ...a, room: updatedRoom.newName, location: updatedRoom.newName } : a);
      } else {
        newRooms.push(updatedRoom.newName);
      }
      await Promise.all([
        saveSalasMutation.mutateAsync(newRooms),
        saveAgendaMutation.mutateAsync(newAgenda)
      ]);
      setIsRoomModalOpen(false);
      showToast('Sala guardada', 'success');
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  // DELETE HANDLERS
  const handleDeleteAgendaItem = (id: string) => {
    showConfirm('Eliminar Actividad', '¿Está seguro de eliminar esta actividad?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        const newAgenda = agenda.filter(a => a.id !== id);
        await saveAgendaMutation.mutateAsync(newAgenda);
        showToast('Actividad eliminada', 'success');
      }
    });
  };

  const handleDeleteSpeaker = (id: number) => {
    showConfirm('Eliminar Ponente', '¿Eliminar este ponente?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        const newSpeakers = speakers.filter(s => s.id !== id);
        await savePonentesMutation.mutateAsync(newSpeakers);
        showToast('Ponente eliminado', 'success');
      }
    });
  };

  const handleDeleteCategory = (name: string) => {
    showConfirm('Eliminar Categoría', '¿Eliminar esta categoría?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        const newCategories = { ...categories };
        delete newCategories[name];
        await saveCategoriasMutation.mutateAsync(newCategories);
        showToast('Categoría eliminada', 'success');
      }
    });
  };

  const handleDeleteRoom = (roomName: string) => {
    showConfirm('Eliminar Sala', `¿Eliminar la sala "${roomName}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        const newRooms = rooms.filter(r => r !== roomName);
        await saveSalasMutation.mutateAsync(newRooms);
        showToast('Sala eliminada', 'success');
      }
    });
  };

  // MEMOIZED FILTERS
  const parseTimeToNumber = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = modifier === 'PM' ? 12 : 0;
    else if (modifier === 'PM') hours += 12;
    return hours * 60 + minutes;
  };

  const { filteredAgenda, currentAgenda } = useMemo(() => {
    const filtered = agenda.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => parseTimeToNumber(a.time) - parseTimeToNumber(b.time));
    return { filteredAgenda: filtered, currentAgenda: sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [agenda, searchTerm, currentPage]);

  const { filteredSpeakers, currentSpeakers } = useMemo(() => {
    const filtered = speakers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { filteredSpeakers: filtered, currentSpeakers: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [speakers, searchTerm, currentPage]);

  const { filteredCategories, currentCategories } = useMemo(() => {
    const filtered = Object.entries(categories).filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { filteredCategories: filtered, currentCategories: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [categories, searchTerm, currentPage]);

  const { filteredRooms, currentRooms } = useMemo(() => {
    const filtered = rooms.filter(room => room.toLowerCase().includes(searchTerm.toLowerCase()));
    return { filteredRooms: filtered, currentRooms: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [rooms, searchTerm, currentPage]);

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
          title="Horario"
          description="Administra el cronograma de actividades."
          headerActions={
            <AdminButton onClick={() => {
              setEditingItem({ id: Math.random().toString(36).substr(2, 9), title: '', time: '', endTime: '', room: rooms[0] || '', location: rooms[0] || '', tag: '', gracePeriod: 10, description: '', period: 'Mañana' });
              setIsAgendaModalOpen(true);
            }}>+ Nueva Actividad</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar actividad..." />
          </div>
          <AdminTable headers={["Horario", "Actividad", "Ubicación", "Categoría", "Opciones"]} emptyMessage="No hay actividades.">
            {currentAgenda.map(item => (
              <tr key={item.id}>
                <td>{item.time} - {item.endTime}</td>
                <td><strong>{item.title}</strong><br/><small style={{color:'var(--text-secondary)'}}>{item.speaker?.name}</small></td>
                <td>{item.room}</td>
                <td>{item.tag && <AdminBadge style={{ backgroundColor: categories[item.tag]?.bg, color: categories[item.tag]?.text }}>{item.tag}</AdminBadge>}</td>
                <td style={{ textAlign: 'right' }}>
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
          description="Gestión de expertos invitados."
          headerActions={
            <AdminButton onClick={() => {
              const nextId = speakers.length > 0 ? Math.max(...speakers.map(s => s.id)) + 1 : 1;
              setEditingSpeaker({ id: nextId, name: '', role: '', bio: '', initials: '', tag: '', bgColor: '#ffffff', textColor: '#01579b', socialLinks: {} });
              setIsSpeakerModalOpen(true);
            }}>+ Agregar Ponente</AdminButton>
          }
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar ponente..." />
          </div>
          <AdminTable headers={["Nombre", "Cargo / Rol", "Opciones"]} emptyMessage="No hay ponentes.">
            {currentSpeakers.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.role}</td>
                <td style={{ textAlign: 'right' }}>
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
          description="Colores y etiquetas para actividades."
          headerActions={<AdminButton onClick={() => { setEditingCategory({ name: '', style: { bg: '#eef2ff', text: '#4338ca' } }); setIsCategoryModalOpen(true); }}>+ Nueva Categoría</AdminButton>}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar categoría..." />
          </div>
          <AdminTable headers={["Nombre", "Vista Previa", "Opciones"]} emptyMessage="No hay categorías.">
            {currentCategories.map(([name, style]) => (
              <tr key={name}>
                <td><strong>{name}</strong></td>
                <td><AdminBadge style={{ backgroundColor: style.bg, color: style.text }}>{name}</AdminBadge></td>
                <td style={{ textAlign: 'right' }}>
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
        <ModuleCard title="Salas" description="Ubicaciones del evento.">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar sala..." />
            </div>
            <AdminButton onClick={() => { setEditingRoom({ oldName: '', newName: '' }); setIsRoomModalOpen(true); }}>+ Nueva Sala</AdminButton>
          </div>
          <AdminTable headers={["Nombre de Sala", "Opciones"]} emptyMessage="No hay salas.">
            {currentRooms.map(room => (
              <tr key={room}>
                <td><strong>{room}</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <AdminButton size="sm" variant="info" onClick={() => { setEditingRoom({ oldName: room, newName: room }); setIsRoomModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDeleteRoom(room)}>Eliminar</AdminButton>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Pagination current={currentPage} total={filteredRooms.length} onPageChange={setCurrentPage} />
        </ModuleCard>
      )}

      {/* MODALS REFACTORIZADOS */}
      {isAgendaModalOpen && editingItem && (
        <AgendaItemModal 
          isOpen={isAgendaModalOpen} 
          onClose={() => setIsAgendaModalOpen(false)} 
          item={editingItem} 
          speakers={speakers} 
          categories={Object.keys(categories)} 
          rooms={rooms} 
          onSave={handleSaveAgendaItem} 
          isNew={!agenda.some(a => a.id === editingItem.id)}
        />
      )}

      {isSpeakerModalOpen && editingSpeaker && (
        <SpeakerEditModal 
          isOpen={isSpeakerModalOpen} 
          onClose={() => setIsSpeakerModalOpen(false)} 
          speaker={editingSpeaker} 
          onSave={handleSaveSpeaker} 
          isNew={!speakers.some(s => s.id === editingSpeaker.id)}
        />
      )}

      {isCategoryModalOpen && editingCategory && (
        <CategoryEditModal 
          isOpen={isCategoryModalOpen} 
          onClose={() => setIsCategoryModalOpen(false)} 
          category={editingCategory} 
          onSave={handleSaveCategory} 
          isNew={!categories[editingCategory.name]}
        />
      )}

      {isRoomModalOpen && editingRoom && (
        <RoomEditModal 
          isOpen={isRoomModalOpen} 
          onClose={() => setIsRoomModalOpen(false)} 
          room={editingRoom} 
          onSave={handleSaveRoom} 
          isNew={!editingRoom.oldName}
        />
      )}
    </section>
  );
}
