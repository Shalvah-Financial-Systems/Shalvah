'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertModal } from '@/components/AlertModal';
import { useAlertModal } from '@/hooks/useAlertModal';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Category, CategoryFormData } from '@/types';

interface AdvancedCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<boolean>;
  category?: Category | null;
  title?: string;
}

export function AdvancedCategoryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  category = null,
  title 
}: AdvancedCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const alertModal = useAlertModal();

  // Detectar mudanças no formulário
  const handleFormChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Verificar se há mudanças
    if (category) {
      const originalName = category.name || '';
      const originalDescription = category.description || '';
      const newName = field === 'name' ? value : formData.name;
      const newDescription = field === 'description' ? value : formData.description;
      
      setHasChanges(
        newName !== originalName || 
        newDescription !== originalDescription
      );    } else {
      setHasChanges(
        value.trim() !== '' || 
        formData.name.trim() !== '' || 
        (formData.description || '').trim() !== ''
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    // Se for edição e há mudanças significativas, mostrar alerta
    if (category && hasChanges && (formData.name !== category.name)) {
      alertModal.showAlert({
        title: 'Confirmar Alterações',
        description: `Você está alterando o nome da categoria de "${category.name}" para "${formData.name}". Esta alteração pode afetar transações existentes. Deseja continuar?`,
        type: 'warning',
        confirmText: 'Salvar Alterações',
        cancelText: 'Cancelar',
        onConfirm: () => performSubmit(),
      });
      return;
    }

    performSubmit();
  };

  const performSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    
    if (success) {
      handleClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Se há mudanças não salvas, mostrar alerta
    if (hasChanges) {
      alertModal.showAlert({
        title: 'Descartar Alterações?',
        description: 'Você tem alterações não salvas. Tem certeza que deseja fechar sem salvar?',
        type: 'warning',
        confirmText: 'Descartar',
        cancelText: 'Continuar Editando',
        onConfirm: () => {
          resetForm();
          onClose();
        },
      });
      return;
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: category?.name || '',
      description: category?.description || '',
    });
    setHasChanges(false);
  };

  if (!isOpen) return null;

  const modalTitle = title || (category ? 'Editar Categoria' : 'Nova Categoria');

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {modalTitle}
              {hasChanges && (
                <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full" title="Há alterações não salvas"></span>
              )}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="advanced-category-name">Nome *</Label>
              <Input
                id="advanced-category-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Nome da categoria"
                required
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="advanced-category-description">Descrição</Label>
              <Input
                id="advanced-category-description"
                type="text"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Descrição opcional"
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className={`flex-1 ${hasChanges ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

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
    </>
  );
}
