import { useState, type FormEvent } from 'react';
import { type AgendaItem } from '../../../../data/agendaData';
import { useSalas, useCategorias, usePonentes } from '../../../../api/hooks/useAgenda';
import { showToast } from '../../../../utils/swal';
import AdminButton from '../../../../components/ui/AdminButton';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminSelect from '../../../../components/ui/AdminSelect';
import { generateTimeOptions, timeToMinutes } from '../../../../utils/timeUtils';
import { useTimeConfig } from '../../../../context/TimeContext';

interface AgendaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AgendaItem) => void;
  item: AgendaItem;
  isNew: boolean;
  agenda: AgendaItem[];
}

export default function AgendaItemModal({ isOpen, onClose, onSave, item, isNew, agenda }: AgendaItemModalProps) {
  const { data: rooms = [] } = useSalas();
  const { data: categories = [] } = useCategorias();
  const { data: speakers = [] } = usePonentes();
  const { timeInterval } = useTimeConfig();

  const [formData, setFormData] = useState<AgendaItem>({ ...item });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.locationId || !formData.tagId) {
      showToast('Por favor selecciona una Sala y una Categoría obligatoriamente', 'error');
      return;
    }

    // Validación de Disponibilidad (Traslape en la misma sala)
    const newStart = timeToMinutes(formData.time);
    const newEnd = timeToMinutes(formData.endTime);

    if (newStart >= newEnd) {
      showToast('La hora de inicio debe ser menor a la hora de fin', 'error');
      return;
    }

    const collision = agenda.find(a => {
      // Omitir el mismo item si estamos editando
      if (a.id === formData.id) return false;
      
      // Misma sala
      if (a.locationId === formData.locationId) {
        const aStart = timeToMinutes(a.time);
        const aEnd = timeToMinutes(a.endTime);
        
        // Lógica de traslape: (StartA < EndB) && (EndA > StartB)
        return (newStart < aEnd && newEnd > aStart);
      }
      return false;
    });

    if (collision) {
      showToast(`¡Conflicto de Horario! El salón ya está ocupado por: "${collision.title}" de ${collision.time} a ${collision.endTime}`, 'error');
      return;
    }

    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Nueva Actividad' : 'Editar Actividad'}
      maxWidth="600px"
    >
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2rem', marginTop: '-1rem' }}>
        Configura los detalles de la charla o taller. Los cambios se sincronizan por ID.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <FormField label="TÍTULO DE LA ACTIVIDAD *" required>
          <input
            type="text"
            required
            className="dashboard-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Conferencia de Ciberseguridad"
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="HORA INICIO *" required>
            <AdminSelect
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              options={generateTimeOptions(timeInterval)}
            />
          </FormField>
          <FormField label="HORA FIN *" required>
            <AdminSelect
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              options={generateTimeOptions(timeInterval)}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="SALA / UBICACIÓN *" required>
            <AdminSelect
              value={formData.locationId || ''}
              onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
              options={rooms.map(r => ({ value: r.id.toString(), label: r.name }))}
              placeholder="-- Seleccionar Sala --"
            />
          </FormField>
          <FormField label="CATEGORÍA *" required>
            <AdminSelect
              value={formData.tagId || ''}
              onChange={(e) => setFormData({ ...formData, tagId: Number(e.target.value) })}
              options={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
              placeholder="-- Seleccionar Categoría --"
            />
          </FormField>
        </div>

        <FormField label="PONENTE (OPCIONAL)">
          <AdminSelect
            value={formData.speaker?.id || ''}
            onChange={(e) => {
              const spk = speakers.find(s => s.id === parseInt(e.target.value));
              setFormData({ ...formData, speaker: spk });
            }}
            options={speakers.map(s => ({ value: s.id.toString(), label: s.name }))}
            placeholder="-- Sin Ponente --"
          />
        </FormField>

        <FormField label="DESCRIPCIÓN *" required>
          <textarea
            required
            className="dashboard-input"
            style={{ minHeight: '100px', paddingTop: '10px' }}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </FormField>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <AdminButton type="submit" style={{ flex: 2 }}>
            {isNew ? 'Crear Actividad' : 'Guardar Cambios'}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}
