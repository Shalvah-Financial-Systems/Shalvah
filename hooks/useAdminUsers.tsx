import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AdminUser, CreateUserData, UpdateUserData } from '@/types';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/users');
      setUsers(data.data || data || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar usuários';
      setError(message);
      console.error('Erro ao carregar usuários:', error);
      
      if (error.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para acessar usuários');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    try {
      const response = await api.post('/users', userData);
      setUsers(prev => [response.data, ...prev]);
      toast.success('Usuário criado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
      return false;
    }
  };

  const updateUser = async (id: string, userData: UpdateUserData): Promise<boolean> => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? response.data : user
        )
      );
      toast.success('Usuário atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
      return false;
    }
  };

  const toggleUserStatus = async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      await loadUsers();
      toast.success('Status do usuário atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar status do usuário';
      toast.error(message);
      return false;
    }
  };

  const getUserById = (id: string): AdminUser | undefined => {
    return users.find(user => user.id === id);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    getUserById,
  };
}
