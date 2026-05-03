import { useState, type FormEvent } from 'react';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminBadge from '../../../../components/ui/AdminBadge';
import ColorPicker from '../../../../components/ColorPicker';
import type { Category } from '../../../../data/agendaData';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onSave: (category: Category) => void;
  isNew: boolean;
}

export default function CategoryEditModal({ isOpen, onClose, category, onSave, isNew }: CategoryEditModalProps) {
  const [editingCategory, setEditingCategory] = useState<Category>({ ...category });

  const handleSubmit = (e: FormEvent) => {
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
        Elige un nombre y un color que represente a la categoría.
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
        <FormField label="COLOR REPRESENTATIVO" required>
          <ColorPicker
            selectedColor={editingCategory.text}
            onSelect={c => {
              const bgWithAlpha = c.startsWith('#') ? c + '26' : c;
              setEditingCategory({
                ...editingCategory,
                text: c,
                bg: bgWithAlpha
              });
            }}
          />
        </FormField>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Vista Previa</label>
          <AdminBadge style={{ backgroundColor: editingCategory.bg, color: editingCategory.text, fontSize: '14px', padding: '6px 16px' }}>
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
