'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types';

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  createSupplier: (data: CreateSupplierData) => Promise<boolean>;
  updateSupplier: (id: string, data: UpdateSupplierData) => Promise<boolean>;
  toggleSupplierStatus: (id: string) => Promise<boolean>;
  getSupplier: (id: string) => Promise<Supplier | null>;
  refreshSuppliers: () => Promise<void>;
}

export function useSuppliers(): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar fornecedores
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/suppliers');
      const data = response.data.data ?? [];
      setSuppliers(data);
    } catch (err: any) {
      console.error('Erro ao carregar fornecedores:', err);
      const message = err.response?.data?.message || 'Erro ao carregar fornecedores';
      setError(message);
      setSuppliers([]);
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar fornecedores');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar fornecedor
  const createSupplier = async (data: CreateSupplierData): Promise<boolean> => {
    try {
      const response = await api.post('/suppliers', data);
      console.log('Create supplier response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setSuppliers(prev => [response.data, ...prev]);
        toast.success('Fornecedor criado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadSuppliers();
        toast.success('Fornecedor criado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao criar fornecedor:', err);
      const message = err.response?.data?.message || 'Erro ao criar fornecedor';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para criar fornecedores');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Atualizar fornecedor
  const updateSupplier = async (id: string, data: UpdateSupplierData): Promise<boolean> => {
    try {
      const response = await api.patch(`/suppliers/${id}`, data);
      console.log('Update supplier response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setSuppliers(prev => 
          prev.map(supplier => supplier.id === id ? response.data : supplier)
        );
        toast.success('Fornecedor atualizado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadSuppliers();
        toast.success('Fornecedor atualizado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao atualizar fornecedor:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar fornecedor';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para editar este fornecedor');
      } else if (err.response?.status === 404) {
        toast.error('Fornecedor não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Alterar status do fornecedor (ativar/inativar)
  const toggleSupplierStatus = async (id: string): Promise<boolean> => {
    // Encontrar o fornecedor atual
    const currentSupplier = suppliers.find(s => s.id === id);
    if (!currentSupplier) {
      toast.error('Fornecedor não encontrado');
      return false;
    }

    // Atualização otimista - atualizar o estado imediatamente
    const optimisticUpdate = !currentSupplier.active;
    setSuppliers(prev => 
      prev.map(supplier => 
        supplier.id === id 
          ? { ...supplier, active: optimisticUpdate } 
          : supplier
      )
    );

    try {
      await api.patch(`/suppliers/${id}/toggle-status`);
      toast.success(`Fornecedor ${optimisticUpdate ? 'ativado' : 'inativado'} com sucesso!`);
      return true;
    } catch (err: any) {
      // Reverter a atualização otimista em caso de erro
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id 
            ? { ...supplier, active: currentSupplier.active } 
            : supplier
        )
      );

      console.error('Erro ao atualizar status do fornecedor:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar status do fornecedor';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para alterar este fornecedor');
      } else if (err.response?.status === 404) {
        toast.error('Fornecedor não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Buscar fornecedor específico
  const getSupplier = async (id: string): Promise<Supplier | null> => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar fornecedor:', err);
      const message = err.response?.data?.message || 'Erro ao buscar fornecedor';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar este fornecedor');
      } else if (err.response?.status === 404) {
        toast.error('Fornecedor não encontrado');
      } else {
        toast.error(message);
      }
      return null;
    }
  };

  // Recarregar fornecedores
  const refreshSuppliers = useCallback(async () => {
    await loadSuppliers();
  }, [loadSuppliers]);

  // Carregar fornecedores na inicialização
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    toggleSupplierStatus,
    getSupplier,
    refreshSuppliers,
  };
}
