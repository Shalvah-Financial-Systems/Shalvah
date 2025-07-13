'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ProductsServices, CreateProductsServicesData, UpdateProductsServicesData } from '@/types';

interface UseProductsServicesReturn {
  productsServices: ProductsServices[];
  loading: boolean;
  error: string | null;
  createProductService: (data: CreateProductsServicesData) => Promise<boolean>;
  updateProductService: (id: string, data: UpdateProductsServicesData) => Promise<boolean>;
  toggleProductServiceStatus: (id: string) => Promise<boolean>;
  getProductService: (id: string) => Promise<ProductsServices | null>;
  refreshProductsServices: () => Promise<void>;
}

export function useProductsServices(): UseProductsServicesReturn {
  const [productsServices, setProductsServices] = useState<ProductsServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos/serviços
  const loadProductsServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products-services');
      const data = response.data.data ?? [];
      setProductsServices(data);
    } catch (err: any) {
      console.error('Erro ao carregar produtos/serviços:', err);
      const message = err.response?.data?.message || 'Erro ao carregar produtos/serviços';
      setError(message);
      setProductsServices([]);
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar produtos/serviços');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar produto/serviço
  const createProductService = async (data: CreateProductsServicesData): Promise<boolean> => {
    try {
      const response = await api.post('/products-services', data);
      console.log('Create response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setProductsServices(prev => [response.data, ...prev]);
        toast.success('Produto/Serviço criado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadProductsServices();
        toast.success('Produto/Serviço criado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao criar produto/serviço:', err);
      const message = err.response?.data?.message || 'Erro ao criar produto/serviço';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para criar produtos/serviços');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Atualizar produto/serviço
  const updateProductService = async (id: string, data: UpdateProductsServicesData): Promise<boolean> => {
    try {
      const response = await api.patch(`/products-services/${id}`, data);
      console.log('Update response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setProductsServices(prev => 
          prev.map(item => item.id === id ? response.data : item)
        );
        toast.success('Produto/Serviço atualizado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadProductsServices();
        toast.success('Produto/Serviço atualizado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao atualizar produto/serviço:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar produto/serviço';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para editar este produto/serviço');
      } else if (err.response?.status === 404) {
        toast.error('Produto/Serviço não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Alterar status do produto/serviço (ativar/inativar)
  const toggleProductServiceStatus = async (id: string): Promise<boolean> => {
    // Encontrar o produto/serviço atual
    const currentItem = productsServices.find(p => p.id === id);
    if (!currentItem) {
      toast.error('Produto/Serviço não encontrado');
      return false;
    }

    // Atualização otimista - atualizar o estado imediatamente
    const optimisticUpdate = !currentItem.active;
    setProductsServices(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, active: optimisticUpdate } 
          : item
      )
    );

    try {
      await api.patch(`/products-services/${id}/toggle-status`);
      const itemType = currentItem.type === 'PRODUCT' ? 'Produto' : 'Serviço';
      toast.success(`${itemType} ${optimisticUpdate ? 'ativado' : 'inativado'} com sucesso!`);
      return true;
    } catch (err: any) {
      // Reverter a atualização otimista em caso de erro
      setProductsServices(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, active: currentItem.active } 
            : item
        )
      );

      console.error('Erro ao atualizar status do produto/serviço:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar status do produto/serviço';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para alterar este produto/serviço');
      } else if (err.response?.status === 404) {
        toast.error('Produto/Serviço não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Buscar produto/serviço específico
  const getProductService = async (id: string): Promise<ProductsServices | null> => {
    try {
      const response = await api.get(`/products-services/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar produto/serviço:', err);
      const message = err.response?.data?.message || 'Erro ao buscar produto/serviço';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar este produto/serviço');
      } else if (err.response?.status === 404) {
        toast.error('Produto/Serviço não encontrado');
      } else {
        toast.error(message);
      }
      return null;
    }
  };

  // Recarregar produtos/serviços
  const refreshProductsServices = useCallback(async () => {
    await loadProductsServices();
  }, [loadProductsServices]);

  // Carregar produtos/serviços na inicialização
  useEffect(() => {
    loadProductsServices();
  }, [loadProductsServices]);

  return {
    productsServices,
    loading,
    error,
    createProductService,
    updateProductService,
    toggleProductServiceStatus,
    getProductService,
    refreshProductsServices,
  };
}
