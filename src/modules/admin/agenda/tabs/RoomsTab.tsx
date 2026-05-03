import { useState, useEffect, useMemo } from 'react';
import { type Room } from '../../../../data/agendaData';
import { useSalas, useSaveSalas, useCharlas } from '../../../../api/hooks/useAgenda';
import { showToast, showConfirm } from '../../../../utils/swal';
import ModuleCard from '../../../../components/ui/ModuleCard';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminTable from '../../../../components/ui/AdminTable';
import AdminBadge from '../../../../components/ui/AdminBadge';
import SearchBar from '../../../../components/ui/SearchBar';
import { Pagination } from '../../../../components/Pagination';
import RoomEditModal from '../components/RoomEditModal';

const ITEMS_PER_PAGE = 5;

export default function RoomsTab() {
  const { data: rooms = [], isLoading } = useSalas();
  const { data: agenda = [] } = useCharlas();
  const saveSalasMutation = useSaveSalas();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ id?: number, oldName: string, newName: string, priority: number } | null>(null);

  const [localRooms, setLocalRooms] = useState<Room[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (rooms.length > 0) {
      setLocalRooms([...rooms].sort((a, b) => a.priority - b.priority));
    }
  }, [rooms]);

  const handleSaveRoom = async (roomData: { id?: number, oldName: string, newName: string, priority: number }) => {
    try {
      let updatedRooms = [...localRooms];

      if (roomData.id) {
        // Editar existente
        updatedRooms = updatedRooms.map(r => 
          r.id === roomData.id ? { ...r, name: roomData.newName, priority: roomData.priority } : r
        );
      } else {
        // Nueva sala
        updatedRooms.push({ id: 0, name: roomData.newName, priority: roomData.priority } as Room);
      }

      await saveSalasMutation.mutateAsync(updatedRooms);
      showToast(roomData.id ? 'Sala actualizada' : 'Sala creada', 'success');
      setIsRoomModalOpen(false);
      setHasOrderChanges(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteRoom = (id: number, name: string) => {
    const isAssigned = agenda.some(item => item.locationId === id);
    
    if (isAssigned) {
      showToast(`No se puede eliminar: La sala "${name}" está en uso en el horario.`, 'error');
      return;
    }

    showConfirm('Eliminar Sala', `¿Eliminar la sala "${name}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newRooms = localRooms.filter(r => r.id !== id);
          await saveSalasMutation.mutateAsync(newRooms);
          showToast('Sala eliminada', 'success');
        } catch (error: any) {
          showToast(`Error: ${error.message}`, 'error');
        }
      }
    });
  };

  const handleSaveNewOrder = async () => {
    try {
      await saveSalasMutation.mutateAsync(localRooms);
      setHasOrderChanges(false);
      showToast('Nuevo orden de salas guardado', 'success');
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDragStart = (index: number) => { setDraggedIndex(index); };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); if (index !== dragOverIndex) setDragOverIndex(index); };
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) { setDraggedIndex(null); setDragOverIndex(null); return; }
    const updated = [...localRooms];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    const reordered = updated.map((r, idx) => ({ ...r, priority: idx + 1 }));
    setLocalRooms(reordered);
    setHasOrderChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const { filteredRooms, currentRooms } = useMemo(() => {
    const filtered = localRooms.filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { filteredRooms: filtered, currentRooms: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [localRooms, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando salas...</div>;

  return (
    <ModuleCard 
      title="Salas" 
      description="Gestión de ubicaciones por ID."
      headerActions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          {hasOrderChanges && (
            <AdminButton variant="success" onClick={handleSaveNewOrder}>
              ✓ Guardar Nuevo Orden
            </AdminButton>
          )}
          <AdminButton onClick={() => { 
            const nextPriority = localRooms.length > 0 ? Math.max(...localRooms.map(r => r.priority)) + 1 : 1;
            setEditingRoom({ oldName: '', newName: '', priority: nextPriority }); 
            setIsRoomModalOpen(true); 
          }}>+ Nueva Sala</AdminButton>
        </div>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar sala..." />
      </div>
      
      <AdminTable headers={["Orden", "Nombre de Sala", "Opciones"]} emptyMessage="No hay salas.">
        {currentRooms.map((room) => {
          const globalIdx = localRooms.findIndex(r => r.id === room.id);
          const isDragging = draggedIndex === globalIdx;
          const isDragOver = dragOverIndex === globalIdx;

          return (
            <tr 
              key={room.id}
              draggable={searchTerm === ''}
              onDragStart={() => handleDragStart(globalIdx)}
              onDragOver={(e) => handleDragOver(e, globalIdx)}
              onDrop={() => handleDrop(globalIdx)}
              className={`${isDragging ? 'dragging-row' : ''} ${isDragOver ? 'drag-over-row' : ''}`}
            >
              <td style={{ width: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="drag-handle">☰</div>
                  <AdminBadge variant="info">{room.priority}</AdminBadge>
                </div>
              </td>
              <td><strong>{room.name}</strong></td>
              <td style={{ textAlign: 'right' }}>
                <AdminButton size="sm" variant="info" onClick={() => { 
                  setEditingRoom({ id: room.id, oldName: room.name, newName: room.name, priority: room.priority }); 
                  setIsRoomModalOpen(true); 
                }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => handleDeleteRoom(room.id, room.name)}>Eliminar</AdminButton>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      
      <Pagination current={currentPage} total={filteredRooms.length} onPageChange={setCurrentPage} />
      
      {isRoomModalOpen && editingRoom && (
        <RoomEditModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          onSave={handleSaveRoom}
          room={editingRoom}
          isNew={!editingRoom.id}
        />
      )}
    </ModuleCard>
  );
}
