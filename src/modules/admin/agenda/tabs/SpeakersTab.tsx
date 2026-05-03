import { useState, useMemo } from 'react';
import { type Speaker } from '../../../../data/agendaData';
import { usePonentes, useSavePonentes } from '../../../../api/hooks/useAgenda';
import { showToast, showConfirm } from '../../../../utils/swal';
import ModuleCard from '../../../../components/ui/ModuleCard';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminTable from '../../../../components/ui/AdminTable';
import SearchBar from '../../../../components/ui/SearchBar';
import { Pagination } from '../../../../components/Pagination';
import SpeakerEditModal from '../components/SpeakerEditModal';

const ITEMS_PER_PAGE = 5;

export default function SpeakersTab() {
  const { data: speakers = [], isLoading } = usePonentes();
  const saveSpeakersMutation = useSavePonentes();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  const translateError = (errorMsg: string) => {
    if (errorMsg.toLowerCase().includes('violates foreign key constraint')) {
      return 'No puedes eliminar este ponente porque tiene actividades asignadas.';
    }
    return errorMsg;
  };

  const handleSaveSpeaker = async (speakerData: Speaker) => {
    try {
      const isNew = !speakers.some(s => s.id === speakerData.id);
      const newSpeakers = !isNew
        ? speakers.map(s => s.id === speakerData.id ? speakerData : s)
        : [...speakers, speakerData];
      
      await saveSpeakersMutation.mutateAsync(newSpeakers);
      showToast(isNew ? 'Ponente creado' : 'Ponente actualizado', 'success');
      setIsSpeakerModalOpen(false);
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  const handleDeleteSpeaker = (id: number) => {
    showConfirm('Eliminar Ponente', '¿Eliminar este ponente?', 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newSpeakers = speakers.filter(s => s.id !== id);
          await saveSpeakersMutation.mutateAsync(newSpeakers);
          showToast('Ponente eliminado', 'success');
        } catch (error: any) {
          showToast(`Error: ${translateError(error.message)}`, 'error');
        }
      }
    });
  };

  const { filteredSpeakers, currentSpeakers } = useMemo(() => {
    const filtered = speakers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { 
      filteredSpeakers: filtered, 
      currentSpeakers: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) 
    };
  }, [speakers, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando ponentes...</div>;

  return (
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
      
      {isSpeakerModalOpen && editingSpeaker && (
        <SpeakerEditModal
          isOpen={isSpeakerModalOpen}
          onClose={() => setIsSpeakerModalOpen(false)}
          onSave={handleSaveSpeaker}
          speaker={editingSpeaker}
          isNew={!speakers.some(s => s.id === editingSpeaker.id)}
        />
      )}
    </ModuleCard>
  );
}
