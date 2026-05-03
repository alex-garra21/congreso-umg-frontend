import { useState, useMemo } from 'react';
import { type CategoryStyle } from '../../../../data/agendaData';
import { useCategorias, useSaveCategorias } from '../../../../api/hooks/useAgenda';
import { showToast, showConfirm } from '../../../../utils/swal';
import ModuleCard from '../../../../components/ui/ModuleCard';
import AdminButton from '../../../../components/ui/AdminButton';
import AdminTable from '../../../../components/ui/AdminTable';
import AdminBadge from '../../../../components/ui/AdminBadge';
import SearchBar from '../../../../components/ui/SearchBar';
import { Pagination } from '../../../../components/Pagination';
import CategoryEditModal from '../components/CategoryEditModal';

const ITEMS_PER_PAGE = 5;

export default function CategoriesTab() {
  const { data: categories = {}, isLoading } = useCategorias();
  const saveCategoriesMutation = useSaveCategorias();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string, style: CategoryStyle } | null>(null);

  const translateError = (errorMsg: string) => {
    if (errorMsg.toLowerCase().includes('violates foreign key constraint')) {
      return 'No puedes eliminar esta categoría porque hay actividades que la están usando.';
    }
    return errorMsg;
  };

  const handleSaveCategory = async (catData: { name: string, style: CategoryStyle }) => {
    try {
      const newCategories = { ...categories };
      const isRename = editingCategory?.name && editingCategory.name !== catData.name;
      
      if (isRename) {
        delete newCategories[editingCategory!.name];
      }
      
      newCategories[catData.name] = catData.style;
      await saveCategoriesMutation.mutateAsync(newCategories);
      showToast(editingCategory?.name ? 'Categoría actualizada' : 'Categoría creada', 'success');
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      showToast(`Error: ${translateError(error.message)}`, 'error');
    }
  };

  const handleDeleteCategory = (name: string) => {
    showConfirm('Eliminar Categoría', `¿Eliminar la categoría "${name}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newCategories = { ...categories };
          delete newCategories[name];
          await saveCategoriesMutation.mutateAsync(newCategories);
          showToast('Categoría eliminada', 'success');
        } catch (error: any) {
          showToast(`Error: ${translateError(error.message)}`, 'error');
        }
      }
    });
  };

  const { filteredCategories, currentCategories } = useMemo(() => {
    const entries = Object.entries(categories);
    const filtered = entries.filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { 
      filteredCategories: filtered, 
      currentCategories: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) 
    };
  }, [categories, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando categorías...</div>;

  return (
    <ModuleCard
      title="Categorías"
      description="Colores y etiquetas para actividades."
      headerActions={
        <AdminButton onClick={() => { 
          setEditingCategory({ name: '', style: { bg: '#eef2ff', text: '#4338ca' } }); 
          setIsCategoryModalOpen(true); 
        }}>+ Nueva Categoría</AdminButton>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar categoría..." />
      </div>
      
      <AdminTable headers={["Nombre", "Vista Previa", "Opciones"]} emptyMessage="No hay categorías.">
        {currentCategories.map(([name, style]) => (
          <tr key={name}>
            <td><strong>{name}</strong></td>
            <td><AdminBadge style={{ backgroundColor: style.bg, color: style.text }}>{name}</AdminBadge></td>
            <td style={{ textAlign: 'right' }}>
              <AdminButton size="sm" variant="info" onClick={() => { setEditingCategory({ name, style }); setIsCategoryModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => handleDeleteCategory(name)}>Eliminar</AdminButton>
            </td>
          </tr>
        ))}
      </AdminTable>
      
      <Pagination current={currentPage} total={filteredCategories.length} onPageChange={setCurrentPage} />
      
      {isCategoryModalOpen && editingCategory && (
        <CategoryEditModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
          isNew={editingCategory.name === ''}
        />
      )}
    </ModuleCard>
  );
}
