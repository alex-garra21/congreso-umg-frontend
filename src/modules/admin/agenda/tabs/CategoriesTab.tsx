import { useState, useMemo } from 'react';
import { type Category } from '../../../../data/agendaData';
import { useCategorias, useSaveCategorias, useCharlas } from '../../../../api/hooks/useAgenda';
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
  const { data: categories = [], isLoading } = useCategorias();
  const { data: agenda = [] } = useCharlas();
  
  const saveCategoriesMutation = useSaveCategorias();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSaveCategory = async (catData: Category) => {
    try {
      let updatedCategories = [...categories];
      
      if (catData.id) {
        updatedCategories = categories.map(c => c.id === catData.id ? catData : c);
      } else {
        updatedCategories.push(catData);
      }
      
      await saveCategoriesMutation.mutateAsync(updatedCategories);

      showToast(catData.id ? 'Categoría actualizada' : 'Categoría creada', 'success');
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, 'error');
    }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    const isAssigned = agenda.some(item => item.tagId === id);
    
    if (isAssigned) {
      showToast(`No se puede eliminar: La categoría "${name}" está en uso.`, 'error');
      return;
    }

    showConfirm('Eliminar Categoría', `¿Eliminar la categoría "${name}"?`, 'Eliminar', true).then(async confirmed => {
      if (confirmed) {
        try {
          const newCategories = categories.filter(c => c.id !== id);
          await saveCategoriesMutation.mutateAsync(newCategories);
          showToast('Categoría eliminada', 'success');
        } catch (error: any) {
          showToast(`Error: ${error.message}`, 'error');
        }
      }
    });
  };

  const { filteredCategories, currentCategories } = useMemo(() => {
    const filtered = categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return { 
      filteredCategories: filtered, 
      currentCategories: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) 
    };
  }, [categories, searchTerm, currentPage]);

  if (isLoading) return <div>Cargando categorías...</div>;

  return (
    <ModuleCard
      title="Categorías"
      description="Gestión de etiquetas por ID."
      headerActions={
        <AdminButton onClick={() => { 
          setEditingCategory({ id: 0, name: '', bg: '#eef2ff', text: '#4338ca' }); 
          setIsCategoryModalOpen(true); 
        }}>+ Nueva Categoría</AdminButton>
      }
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar categoría..." />
      </div>
      
      <AdminTable headers={["Nombre", "Vista Previa", "Opciones"]} emptyMessage="No hay categorías.">
        {currentCategories.map((cat) => (
          <tr key={cat.id}>
            <td><strong>{cat.name}</strong></td>
            <td><AdminBadge style={{ backgroundColor: cat.bg, color: cat.text }}>{cat.name}</AdminBadge></td>
            <td style={{ textAlign: 'right' }}>
              <AdminButton size="sm" variant="info" onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} style={{ marginRight: '8px' }}>Editar</AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => handleDeleteCategory(cat.id, cat.name)}>Eliminar</AdminButton>
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
          isNew={editingCategory.id === 0}
        />
      )}
    </ModuleCard>
  );
}
