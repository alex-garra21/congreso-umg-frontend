import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminSelect from '../../../../components/ui/AdminSelect';
import type { AgendaItem, Speaker } from '../../../../data/agendaData';

interface AgendaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AgendaItem;
  speakers: Speaker[];
  categories: string[];
  rooms: string[];
  onSave: (item: AgendaItem) => void;
  isNew: boolean;
}

export default function AgendaItemModal({ 
  isOpen, onClose, item, speakers, categories, rooms, onSave, isNew 
}: AgendaItemModalProps) {
  const [editingItem, setEditingItem] = useState<AgendaItem>({ ...item });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingItem);
  };

  // Generar opciones de tiempo de 7:00 AM a 10:00 PM en intervalos de 15 min
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const m = min === 0 ? '00' : min;
        const timeStr = `${h}:${m} ${ampm}`;
        options.push({ value: timeStr, label: timeStr });
        if (hour === 22 && min === 0) break; // Terminar en 10:00 PM
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isNew ? 'Nueva' : 'Editar'} Actividad`}
      maxWidth="600px"
    >
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Los campos marcados con <span style={{ color: 'var(--status-error)' }}>*</span> son obligatorios.
      </p>
      <form onSubmit={handleSubmit}>
        <FormField label="TÍTULO DE LA ACTIVIDAD" required>
          <input 
            type="text" 
            className="dashboard-input" 
            value={editingItem.title} 
            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} 
            required 
          />
        </FormField>
        <FormField label="DESCRIPCIÓN" required>
          <textarea 
            className="dashboard-input" 
            value={editingItem.description} 
            onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} 
            required 
            style={{ minHeight: '80px' }} 
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <FormField label="HORA INICIO" required style={{ flex: 1 }}>
            <AdminSelect
              value={editingItem.time}
              onChange={(e: { target: { value: string } }) => setEditingItem({ ...editingItem, time: e.target.value })}
              options={timeOptions}
            />
          </FormField>
          <FormField label="HORA FIN" required style={{ flex: 1 }}>
            <AdminSelect
              value={editingItem.endTime}
              onChange={(e: { target: { value: string } }) => setEditingItem({ ...editingItem, endTime: e.target.value })}
              options={timeOptions}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <FormField label="SALA" required style={{ flex: 1 }}>
            <AdminSelect
              value={editingItem.room}
              onChange={(e: { target: { value: string } }) => setEditingItem({ ...editingItem, room: e.target.value, location: e.target.value })}
              options={rooms.map(r => ({ value: r, label: r }))}
            />
          </FormField>
          <FormField label="CATEGORÍA" required style={{ flex: 1 }}>
            <AdminSelect
              value={editingItem.tag}
              onChange={(e: { target: { value: string } }) => setEditingItem({ ...editingItem, tag: e.target.value })}
              options={[
                { value: '', label: 'Seleccionar...' },
                ...categories.map(c => ({ value: c, label: c }))
              ]}
            />
          </FormField>
        </div>

        <FormField label="PONENTE (Opcional)">
          <AdminSelect
            value={editingItem.speaker?.id || ''}
            onChange={(e: { target: { value: string } }) => {
              const s = speakers.find(sp => sp.id === parseInt(e.target.value));
              setEditingItem({ ...editingItem, speaker: s });
            }}
            options={[
              { value: '', label: 'Sin ponente' },
              ...speakers.map(s => ({ value: s.id.toString(), label: s.name }))
            ]}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <AdminButton type="submit" style={{ flex: 1 }}>Guardar Actividad</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </form>
    </Modal>
  );
}
