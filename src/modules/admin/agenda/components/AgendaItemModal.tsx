import { useState, type FormEvent } from 'react';
import { type AgendaItem } from '../../../../data/agendaData';
import { useSalas, useCategorias, usePonentes } from '../../../../api/hooks/useAgenda';
import { showToast } from '../../../../utils/swal';
import AdminButton from '../../../../components/ui/AdminButton';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';

interface AgendaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AgendaItem) => void;
  item: AgendaItem;
  isNew: boolean;
}

export default function AgendaItemModal({ isOpen, onClose, onSave, item, isNew }: AgendaItemModalProps) {
  const { data: rooms = [] } = useSalas();
  const { data: categories = [] } = useCategorias();
  const { data: speakers = [] } = usePonentes();

  const [formData, setFormData] = useState<AgendaItem>({ ...item });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.locationId || !formData.tagId) {
      showToast('Por favor selecciona una Sala y una Categoría obligatoriamente', 'error');
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
            <input
              type="text"
              required
              className="dashboard-input"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="08:00 AM"
            />
          </FormField>
          <FormField label="HORA FIN *" required>
            <input
              type="text"
              required
              className="dashboard-input"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="09:00 AM"
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="SALA / UBICACIÓN *" required>
            <select
              required
              className="dashboard-input"
              value={formData.locationId || ''}
              onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
            >
              <option value="">-- Seleccionar Sala --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="CATEGORÍA *" required>
            <select
              required
              className="dashboard-input"
              value={formData.tagId || ''}
              onChange={(e) => setFormData({ ...formData, tagId: Number(e.target.value) })}
            >
              <option value="">-- Seleccionar Categoría --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="PONENTE (OPCIONAL)">
          <select
            className="dashboard-input"
            value={formData.speaker?.id || ''}
            onChange={(e) => {
              const spk = speakers.find(s => s.id === parseInt(e.target.value));
              setFormData({ ...formData, speaker: spk });
            }}
          >
            <option value="">-- Sin Ponente --</option>
            {speakers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
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
