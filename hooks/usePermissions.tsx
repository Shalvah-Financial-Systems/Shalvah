import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadPermissions = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('usePermissions: Chamada já em progresso, ignorando...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      console.log('usePermissions: Fazendo chamada para /permissions');
      const { data } = await api.get('/permissions');
      setPermissions(data.data || data || []);
      console.log('usePermissions: Dados carregados com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar permissões';
      setError(message);
      console.error('usePermissions: Erro ao carregar permissões:', error);
      
      if (error.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para acessar permissões');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const createPermission = useCallback(async (permissionData: CreatePermissionData): Promise<boolean> => {
    try {
      const response = await api.post('/permissions', permissionData);
      setPermissions(prev => [response.data, ...prev]);
      toast.success('Permissão criada com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar permissão';
      toast.error(message);
      return false;
    }
  }, []);

  const updatePermission = useCallback(async (id: string, permissionData: UpdatePermissionData): Promise<boolean> => {
    try {
      const response = await api.put(`/permissions/${id}`, permissionData);
      setPermissions(prev => 
        prev.map(permission => 
          permission.id === id ? response.data : permission
        )
      );
      toast.success('Permissão atualizada com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar permissão';
      toast.error(message);
      return false;
    }
  }, []);

  const togglePermissionStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/permissions/${id}/toggle-status`);
      await loadPermissions();
      toast.success('Status da permissão atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar status da permissão';
      toast.error(message);
      return false;
    }
  }, [loadPermissions]);

  const getPermissionById = useCallback((id: string): Permission | undefined => {
    return permissions.find(permission => permission.id === id);
  }, [permissions]);

  useEffect(() => {
    // Só carregar se ainda não foi carregado
    if (permissions.length === 0 && !isLoadingRef.current) {
      console.log('usePermissions: Iniciando carregamento...');
      loadPermissions();
    }
  }, [loadPermissions, permissions.length]);

  return {
    permissions,
    loading,
    error,
    loadPermissions,
    createPermission,
    updatePermission,
    togglePermissionStatus,
    getPermissionById,
  };
}
