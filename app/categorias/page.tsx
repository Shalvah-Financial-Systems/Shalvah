'use client';

import { useState } from 'react';
import { EnterpriseLayout } from '@/components/EnterpriseLayout';
import { Button } from '@/components/ui/button';
import { CategoriesTable } from '@/components/CategoriesTable';
import { CategoryModal } from '@/components/CategoryModal';
import { AlertModal } from '@/components/AlertModal';
import { useCategories } from '@/hooks/useCategories';
import { useAlertModal } from '@/hooks/useAlertModal';
import { Category, CategoryFormData } from '@/types';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriasPage() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
  } = useCategories();

  const alertModal = useAlertModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSubmit = async (data: CategoryFormData): Promise<boolean> => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, data);
    } else {
      return await createCategory(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleCategoryStatus(id);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <EnterpriseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando categorias...</p>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  if (error) {
    return (
      <EnterpriseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as categorias das suas transações
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Tabela de Categorias */}
        <CategoriesTable
          categories={categories}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={alertModal.showToggleAlert}
          onUpdateCategoryStatus={handleToggleStatus}
        />
      </motion.div>

      {/* Modal de Categoria */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        category={editingCategory}
      />

      {/* Modal de Alerta */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.closeAlert}
        onConfirm={alertModal.confirmAlert}
        title={alertModal.config?.title || ''}
        description={alertModal.config?.description || ''}
        type={alertModal.config?.type}
        confirmText={alertModal.config?.confirmText}
        cancelText={alertModal.config?.cancelText}
        isLoading={alertModal.isLoading}
      />
    </EnterpriseLayout>
  );
}
