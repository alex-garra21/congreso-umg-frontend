import { useState, useEffect, useMemo } from 'react';
import { type Room } from '../../../../data/agendaData';
import { useSalas, useSaveSalas } from '../../../../api/hooks/useAgenda';
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
  const saveSalasMutation = useSaveSalas();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ oldName: string, newName: string, priority: number } | null>(null);

  const [localRooms, setLocalRooms] = useState<Room[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  
  // Estado para el drag & drop nativo
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (rooms.length > 0) {
      setLocalRooms([...rooms].sort((a, b) => a.priority - b.priority));
    } else {
      setLocalRooms([]);
    }
  }, [rooms]);

  const handleSaveRoom = async (roomData: { oldName: string, newName: string, priority: number }) => {
    try {
      let updatedRooms = [...localRooms];
      
      if (roomData.oldName) {
        // Caso: Editando una sala existente
        const collisionIndex = updatedRooms.findIndex(r => r.priority === roomData.priority && r.name !== roomData.oldName);
        if (collisionIndex !== -1) {
          const oldPriority = updatedRooms.find(r => r.name === roomData.oldName)?.priority || 0;
          updatedRooms[collisionIndex].priority = oldPriority;
        }
        updatedRooms = updatedRooms.map(r => 
          r.name === roomData.oldName ? { name: roomData.newName, priority: roomData.priority } : r
        );
      } else {
        // Caso: Creando una sala nueva
        // Si hay una colisión de prioridad, desplazamos la existente
        const collisionIndex = updatedRooms.findIndex(r => r.priority === roomData.priority);
        if (collisionIndex !== -1) {
          const maxPriority = Math.max(...updatedRooms.map(r => r.priority));
          updatedRooms[collisionIndex].priority = maxPriority + 1;
        }
        updatedRooms.push({ name: roomData.newName, priority: roomData.priority });
      }

      // Guardamos inmediatamente en la base de datos (esto también persiste cambios de orden pendientes)
      await saveSalasMutation.mutateAsync(updatedRooms);
      
      showToast(roomData.oldName ? 'Sala actualizada' : 'Sala creada y orden sincronizado', 'success');
      setIsRoomModalOpen(false);
      setHasOrderChanges(false); // Al guardar la sala, se sincroniza todo el orden
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteRoom = (roomName: string) => {
    showConfirm('Eliminar Sala', `¿Eliminar la sala "${roomName}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newRooms = localRooms.filter(r => r.name !== roomName);
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

  // --- Lógica de Drag & Drop Nativo ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dragOverIndex) setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

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
      description="Ubicaciones del evento. Arrastra las filas o usa las flechas para reordenar."
      headerActions={
        <div style={{ display: 'flex', gap: '1rem' }}>
          {hasOrderChanges && (
            <AdminButton variant="success" onClick={handleSaveNewOrder} style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar sala..." />
        </div>
        {hasOrderChanges && <span style={{ fontSize: '13px', color: 'var(--status-success)', fontWeight: 600 }}>⚠️ Tienes cambios sin guardar</span>}
      </div>
      
      <AdminTable headers={["Orden", "Nombre de Sala", "Opciones"]} emptyMessage="No hay salas.">
        {currentRooms.map((room) => {
          const globalIdx = localRooms.findIndex(r => r.name === room.name);
          const isDragging = draggedIndex === globalIdx;
          const isDragOver = dragOverIndex === globalIdx;

          return (
            <tr 
              key={room.name}
              draggable={searchTerm === ''}
              onDragStart={() => handleDragStart(globalIdx)}
              onDragOver={(e) => handleDragOver(e, globalIdx)}
              onDrop={() => handleDrop(globalIdx)}
              className={`${isDragging ? 'dragging-row' : ''} ${isDragOver ? 'drag-over-row' : ''}`}
            >
              <td style={{ width: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="drag-handle" title="Arrastrar para reordenar">☰</div>
                  <AdminBadge variant="info" style={{ minWidth: '24px', textAlign: 'center' }}>{room.priority}</AdminBadge>
                </div>
              </td>
              <td><strong>{room.name}</strong></td>
              <td style={{ textAlign: 'right' }}>
                <AdminButton size="sm" variant="info" onClick={() => { setEditingRoom({ oldName: room.name, newName: room.name, priority: room.priority }); setIsRoomModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => handleDeleteRoom(room.name)}>Eliminar</AdminButton>
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
          isNew={editingRoom.oldName === ''}
        />
      )}
    </ModuleCard>
  );
}
