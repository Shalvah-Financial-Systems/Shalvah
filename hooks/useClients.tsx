'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Client, CreateClientData, UpdateClientData } from '@/types';

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  createClient: (data: CreateClientData) => Promise<boolean>;
  updateClient: (id: string, data: UpdateClientData) => Promise<boolean>;
  toggleClientStatus: (id: string) => Promise<boolean>;
  getClient: (id: string) => Promise<Client | null>;
  refreshClients: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar clientes
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/clients');
      const data = response.data.data ?? [];
      setClients(data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      const message = err.response?.data?.message || 'Erro ao carregar clientes';
      setError(message);
      setClients([]);
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar clientes');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar cliente
  const createClient = async (data: CreateClientData): Promise<boolean> => {
    try {
      const response = await api.post('/clients', data);
      console.log('Create client response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setClients(prev => [response.data, ...prev]);
        toast.success('Cliente criado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadClients();
        toast.success('Cliente criado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err);
      const message = err.response?.data?.message || 'Erro ao criar cliente';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para criar clientes');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Atualizar cliente
  const updateClient = async (id: string, data: UpdateClientData): Promise<boolean> => {
    try {
      const response = await api.patch(`/clients/${id}`, data);
      console.log('Update client response:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      if (response.data && response.data.id) {
        setClients(prev => 
          prev.map(client => client.id === id ? response.data : client)
        );
        toast.success('Cliente atualizado com sucesso!');
        return true;
      } else {
        // Se a resposta não contém os dados, recarregar a lista
        console.warn('Resposta da API não contém dados esperados, recarregando lista...');
        await loadClients();
        toast.success('Cliente atualizado com sucesso!');
        return true;
      }
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar cliente';
      
      if (err.response?.status === 400) {
        toast.error('Dados inválidos. Verifique os campos preenchidos.');
      } else if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para editar este cliente');
      } else if (err.response?.status === 404) {
        toast.error('Cliente não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Alterar status do cliente (ativar/inativar)
  const toggleClientStatus = async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/clients/${id}/toggle-status`);
      await loadClients(); // Recarregar para obter o status atualizado
      toast.success('Status do cliente atualizado com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar status do cliente:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar status do cliente';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para alterar este cliente');
      } else if (err.response?.status === 404) {
        toast.error('Cliente não encontrado');
      } else {
        toast.error(message);
      }
      return false;
    }
  };

  // Buscar cliente específico
  const getClient = async (id: string): Promise<Client | null> => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar cliente:', err);
      const message = err.response?.data?.message || 'Erro ao buscar cliente';
      
      if (err.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (err.response?.status === 403) {
        toast.error('Você não tem permissão para acessar este cliente');
      } else if (err.response?.status === 404) {
        toast.error('Cliente não encontrado');
      } else {
        toast.error(message);
      }
      return null;
    }
  };

  // Recarregar clientes
  const refreshClients = useCallback(async () => {
    await loadClients();
  }, [loadClients]);

  // Carregar clientes na inicialização
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    toggleClientStatus,
    getClient,
    refreshClients,
  };
}
