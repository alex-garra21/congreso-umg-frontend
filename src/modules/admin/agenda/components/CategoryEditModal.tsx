import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminBadge from '../../../../components/ui/AdminBadge';
import ColorPicker from '../../../../components/ColorPicker';
import type { CategoryStyle } from '../../../../data/agendaData';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { name: string, style: CategoryStyle };
  onSave: (category: { name: string, style: CategoryStyle }) => void;
  isNew: boolean;
}

export default function CategoryEditModal({ isOpen, onClose, category, onSave, isNew }: CategoryEditModalProps) {
  const [editingCategory, setEditingCategory] = useState({ ...category });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingCategory);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isNew ? 'Nueva' : 'Editar'} Categoría`}
      maxWidth="450px"
    >
      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1.5rem' }}>
        Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
      </p>
      <form onSubmit={handleSubmit}>
        <FormField label="NOMBRE DE CATEGORÍA" required>
          <input 
            type="text" 
            className="dashboard-input" 
            value={editingCategory.name} 
            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} 
            required 
          />
        </FormField>
        <FormField label="COLOR TEXTO" required>
          <ColorPicker
            selectedColor={editingCategory.style.text}
            onSelect={c => {
              const bgWithAlpha = c.startsWith('#') ? c + '26' : c;
              setEditingCategory({
                ...editingCategory,
                style: { ...editingCategory.style, text: c, bg: bgWithAlpha }
              });
            }}
          />
        </FormField>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '10px', color: '#868e96', fontWeight: 700, textTransform: 'uppercase' }}>Previsualización</label>
          <AdminBadge style={{ backgroundColor: editingCategory.style.bg, color: editingCategory.style.text, fontSize: '14px', padding: '6px 16px' }}>
            {editingCategory.name || 'Ejemplo'}
          </AdminBadge>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <AdminButton type="submit" style={{ flex: 1 }}>Guardar Categoría</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</AdminButton>
        </div>
      </form>
    </Modal>
  );
}
