import { useState, useMemo } from 'react';
import { type Speaker } from '../../../../data/agendaData';
import { usePonentes, useSavePonentes, useCharlas, useSaveAgenda } from '../../../../api/hooks/useAgenda';
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
  const { data: agenda = [] } = useCharlas();

  const saveSpeakersMutation = useSavePonentes();
  const saveAgendaMutation = useSaveAgenda();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  const handleSaveSpeaker = async (speakerData: Speaker) => {
    try {
      let updatedSpeakers = [...speakers];
      let updatedAgenda = [...agenda];
      let needsAgendaUpdate = false;

      if (speakerData.id && speakers.some(s => s.id === speakerData.id)) {
        // Actualizar ponente existente
        updatedSpeakers = speakers.map(s => s.id === speakerData.id ? speakerData : s);

        // Sincronizar en cascada con la Agenda (Horario)
        needsAgendaUpdate = agenda.some(item => item.speaker?.id === speakerData.id);
        if (needsAgendaUpdate) {
          updatedAgenda = agenda.map(item =>
            item.speaker?.id === speakerData.id ? { ...item, speaker: speakerData } : item
          );
        }
      } else {
        // Nuevo ponente (asignar ID si es necesario)
        const newId = speakers.length > 0 ? Math.max(...speakers.map(s => s.id)) + 1 : 1;
        updatedSpeakers.push({ ...speakerData, id: newId });
      }

      // 1. Guardar Ponentes
      await saveSpeakersMutation.mutateAsync(updatedSpeakers);

      // 2. Guardar Agenda si hubo sincronización
      if (needsAgendaUpdate) {
        await saveAgendaMutation.mutateAsync(updatedAgenda);
      }

      showToast(speakerData.id ? 'Ponente actualizado' : 'Ponente creado', 'success');
      setIsSpeakerModalOpen(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteSpeaker = (id: number, name: string) => {
    const isAssigned = agenda.some(item => item.speaker?.id === id);
    const warningText = isAssigned
      ? `ATENCIÓN: ${name} tiene actividades asignadas en el horario. Si lo eliminas, esas actividades quedarán sin ponente.`
      : `¿Eliminar al ponente "${name}"?`;

    showConfirm('Eliminar Ponente', warningText, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newSpeakers = speakers.filter(s => s.id !== id);
          await saveSpeakersMutation.mutateAsync(newSpeakers);
          showToast('Ponente eliminado', 'success');
        } catch (error: any) {
          showToast(`Error: ${error.message}`, 'error');
        }
      }
    });
  };

  const { filteredSpeakers, currentSpeakers } = useMemo(() => {
    const filtered = speakers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { filteredSpeakers: filtered, currentSpeakers: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) };
  }, [speakers, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando ponentes...</div>;

  return (
    <ModuleCard
      title="Ponentes"
      description="Gestión de conferencistas y expertos."
      headerActions={
        <AdminButton onClick={() => {
          setEditingSpeaker({
            id: 0, name: '', initials: '', role: '', tag: '', bio: '',
            bgColor: '#e6f1fb', textColor: '#0C447C', socialLinks: {}
          });
          setIsSpeakerModalOpen(true);
        }}>+ Nuevo Ponente</AdminButton>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o cargo..." />
      </div>

      <AdminTable headers={["Ponente", "Especialidad", "Opciones"]} emptyMessage="No hay ponentes registrados.">
        {currentSpeakers.map((s) => (
          <tr key={s.id}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: s.bgColor, color: s.textColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '12px'
                }}>
                  {s.initials || s.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.role}</div>
                </div>
              </div>
            </td>
            <td><span style={{ fontSize: '13px' }}>{s.tag}</span></td>
            <td style={{ textAlign: 'right' }}>
              <AdminButton size="sm" variant="info" onClick={() => { setEditingSpeaker(s); setIsSpeakerModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => handleDeleteSpeaker(s.id, s.name)}>Eliminar</AdminButton>
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
          isNew={editingSpeaker.id === 0}
        />
      )}
    </ModuleCard>
  );
}
