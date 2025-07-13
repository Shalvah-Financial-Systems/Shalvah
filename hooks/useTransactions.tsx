'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Transaction, CreateTransactionData, UpdateTransactionData } from '@/types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  createTransaction: (data: CreateTransactionData) => Promise<boolean>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<boolean>;
  toggleTransactionStatus: (id: string) => Promise<boolean>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  refreshTransactions: () => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/transactions?include=category,productService,client,supplier');
      // Garantir que sempre seja um array
      const transactionsData = response.data.data ?? [];
      setTransactions(transactionsData);

    } catch (err: any) {
      console.error('Erro ao carregar transações:', err);
      const message = err.response?.data?.message || 'Erro ao carregar transações';
      setError(message);
      
      // Em caso de erro, garantir que transactions seja um array vazio
      setTransactions([]);
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar essas transações');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Criar nova transação
  const createTransaction = async (data: CreateTransactionData): Promise<boolean> => {
    try {
      const response = await api.post('/transactions', data);
      
      // Adicionar a nova transação ao estado local
      setTransactions(prev => [response.data, ...prev]);
      
      toast.success('Transação criada com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao criar transação:', err);
      const message = err.response?.data?.message || 'Erro ao criar transação';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para criar transações');
      } else if (err.response?.status === 404) {
        toast.error('Categoria não encontrada');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Atualizar transação
  const updateTransaction = async (id: string, data: UpdateTransactionData): Promise<boolean> => {
    try {
      const response = await api.put(`/transactions/${id}`, data);
      
      // Atualizar a transação no estado local
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? response.data : transaction
        )
      );
      
      toast.success('Transação atualizada com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar transação:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar transação';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para editar esta transação');
      } else if (err.response?.status === 404) {
        toast.error('Transação não encontrada');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Cancelar/Ativar transação
  const toggleTransactionStatus = async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/transactions/${id}/toggle-status`);
      
      // Recarregar transações para obter o status atualizado
      await loadTransactions();
      
      toast.success('Status da transação atualizado com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar status da transação:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar status da transação';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para alterar esta transação');
      } else if (err.response?.status === 404) {
        toast.error('Transação não encontrada');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Buscar transação específica
  const getTransaction = async (id: string): Promise<Transaction | null> => {
    try {
      const response = await api.get(`/transactions/${id}?include=category,productService,client,supplier`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar transação:', err);
      const message = err.response?.data?.message || 'Erro ao buscar transação';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar esta transação');
      } else if (err.response?.status === 404) {
        toast.error('Transação não encontrada');
      } else {
        toast.error(message);
      }
      return null;
    }
  };

  // Recarregar transações
  const refreshTransactions = async () => {
    await loadTransactions();
  };

  // Carregar transações na inicialização
  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    toggleTransactionStatus,
    getTransaction,
    refreshTransactions,
  };
}
