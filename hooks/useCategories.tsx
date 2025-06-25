import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Category, CategoryFormData } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/categories');
      // Tentar diferentes estruturas de resposta da API
      setCategories(data.categories || data.data || data || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar categorias';
      setError(message);
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CategoryFormData): Promise<boolean> => {
    try {
      await api.post('/categories', categoryData);
      toast.success('Categoria criada com sucesso!');
      await loadCategories();
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar categoria';
      toast.error(message);
      return false;
    }
  };

  const updateCategory = async (id: string, categoryData: CategoryFormData): Promise<boolean> => {
    try {
      await api.put(`/categories/${id}`, categoryData);
      toast.success('Categoria atualizada com sucesso!');
      await loadCategories();
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar categoria';
      toast.error(message);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoria excluída com sucesso!');
      await loadCategories();
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir categoria';
      toast.error(message);
      return false;
    }
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
