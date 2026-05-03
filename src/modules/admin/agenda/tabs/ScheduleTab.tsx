import { useState, useMemo } from 'react';
import { type AgendaItem } from '../../../../data/agendaData';
import { useCharlas, useSaveAgenda, useCategorias, useSalas } from '../../../../api/hooks/useAgenda';
import { showToast, showConfirm } from '../../../../utils/swal';
import ModuleCard from '../../../../components/ui/ModuleCard';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminTable from '../../../../components/ui/AdminTable';
import AdminBadge from '../../../../components/ui/AdminBadge';
import SearchBar from '../../../../components/ui/SearchBar';
import { Pagination } from '../../../../components/Pagination';
import AgendaItemModal from '../components/AgendaItemModal';

const ITEMS_PER_PAGE = 5;

export default function ScheduleTab() {
  const { data: agenda = [], isLoading } = useCharlas();
  const { data: categories = [] } = useCategorias();
  const { data: rooms = [] } = useSalas();
  
  const saveAgendaMutation = useSaveAgenda();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);

  const handleSaveAgendaItem = async (updatedItem: AgendaItem) => {
    try {
      const isExisting = agenda.some(a => a.id === updatedItem.id);
      const newAgenda = isExisting
        ? agenda.map(a => a.id === updatedItem.id ? updatedItem : a)
        : [...agenda, updatedItem];
      
      await saveAgendaMutation.mutateAsync(newAgenda);
      showToast(isExisting ? 'Actividad actualizada' : 'Actividad creada', 'success');
      setIsAgendaModalOpen(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteAgendaItem = (id: string) => {
    showConfirm('Eliminar Actividad', '¿Eliminar esta actividad del cronograma?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newAgenda = agenda.filter(a => a.id !== id);
          await saveAgendaMutation.mutateAsync(newAgenda);
          showToast('Actividad eliminada', 'success');
        } catch (error: any) {
          showToast(`Error: ${error.message}`, 'error');
        }
      }
    });
  };

  const { filteredAgenda, currentAgenda } = useMemo(() => {
    const filtered = agenda.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.speaker?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Ordenar por hora
    const sorted = [...filtered].sort((a, b) => a.time.localeCompare(b.time));
    return { 
      filteredAgenda: sorted, 
      currentAgenda: sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) 
    };
  }, [agenda, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando cronograma...</div>;

  const handleNewActivity = () => {
    setEditingItem({ 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      time: '08:00 AM', 
      endTime: '09:00 AM', 
      room: rooms[0]?.name || 'SALA A', 
      locationId: rooms[0]?.id || 0,
      tagId: categories[0]?.id || 0,
      tag: categories[0]?.name || 'General', 
      gracePeriod: 10, 
      description: '', 
      period: 'Mañana' 
    } as AgendaItem);
    setIsAgendaModalOpen(true);
  };

  return (
    <ModuleCard
      title="Horario"
      description="Administra el cronograma de actividades."
      headerActions={
        <AdminButton onClick={handleNewActivity}>+ Nueva Actividad</AdminButton>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar actividad..." />
      </div>
      
      <AdminTable headers={["Horario", "Actividad", "Ubicación", "Categoría", "Opciones"]} emptyMessage="No hay actividades.">
        {currentAgenda.map(item => (
          <tr key={item.id}>
            <td>{item.time} - {item.endTime}</td>
            <td>
              <strong>{item.title}</strong><br/>
              <small style={{color:'var(--text-secondary)'}}>{item.speaker?.name || 'Sin ponente'}</small>
            </td>
            <td>{item.room}</td>
            <td>
              {item.tagStyle && (
                <AdminBadge style={{ backgroundColor: item.tagStyle.bg, color: item.tagStyle.text }}>
                  {item.tag}
                </AdminBadge>
              )}
            </td>
            <td style={{ textAlign: 'right' }}>
              <AdminButton size="sm" variant="info" onClick={() => { setEditingItem(item); setIsAgendaModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => handleDeleteAgendaItem(item.id)}>Eliminar</AdminButton>
            </td>
          </tr>
        ))}
      </AdminTable>
      
      <Pagination current={currentPage} total={filteredAgenda.length} onPageChange={setCurrentPage} />
      
      {isAgendaModalOpen && editingItem && (
        <AgendaItemModal
          isOpen={isAgendaModalOpen}
          onClose={() => setIsAgendaModalOpen(false)}
          onSave={handleSaveAgendaItem}
          item={editingItem}
          isNew={!agenda.some(a => a.id === editingItem.id)}
        />
      )}
    </ModuleCard>
  );
}
