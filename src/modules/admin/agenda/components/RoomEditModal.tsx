import { useState, type FormEvent } from 'react';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminButton from '../../../../components/ui/AdminButton';


interface RoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: { oldName: string, newName: string, priority: number };
  onSave: (room: { oldName: string, newName: string, priority: number }) => void;
  isNew: boolean;
}

export default function RoomEditModal({ isOpen, onClose, room, onSave, isNew }: RoomEditModalProps) {
  const [editingRoom, setEditingRoom] = useState({ ...room });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ ...editingRoom, priority: Number(editingRoom.priority) });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isNew ? 'Nueva' : 'Editar'} Sala`}
      maxWidth="450px"
    >
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
        Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
      </p>
      <form onSubmit={handleSubmit}>
        <FormField label="NOMBRE DE LA SALA" required>
          <input
            type="text"
            className="dashboard-input"
            value={editingRoom.newName}
            onChange={e => setEditingRoom({ ...editingRoom, newName: e.target.value })}
            required
          />
        </FormField>

        <FormField label="PRIORIDAD (ORDEN)" required>
          <input
            type="number"
            min="1"
            className="dashboard-input"
            value={editingRoom.priority}
            onChange={e => {
              setError('');
              setEditingRoom({ ...editingRoom, priority: parseInt(e.target.value) || 0 });
            }}
            required
          />
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <AdminButton type="submit" style={{ flex: 1 }}>Guardar Sala</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </form>
    </Modal>
  );
}
