import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByPlan: {
    planName: string;
    userCount: number;
    planId: string;
  }[];
  usersByType: {
    type: 'ADMIN' | 'ENTERPRISE';
    count: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    type: 'ADMIN' | 'ENTERPRISE';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
  }[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadStats = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('useAdminStats: Chamada já em progresso, ignorando...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      console.log('useAdminStats: Fazendo chamada para /users/dashboard');
      const { data } = await api.get('/users/dashboard');
      
      // Garantir que os dados têm a estrutura esperada
      const normalizedData: UserStats = {
        totalUsers: data?.data.totalUsers || 0,
        activeUsers: data?.data?.activeUsers || 0,
        inactiveUsers: data?.data?.inactiveUsers || 0,
        usersByPlan: data?.data?.usersByPlan || [],
        usersByType: data?.data?.usersByType || [],
        recentUsers: data?.data?.recentUsers || []
      };
      
      console.log('useAdminStats: Dados carregados com sucesso:', normalizedData);
      setStats(normalizedData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar estatísticas';
      setError(message);
      console.error('useAdminStats: Erro ao carregar estatísticas:', error);
      
      if (error.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para acessar estatísticas');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Só carregar se ainda não foi carregado
    if (!stats && !isLoadingRef.current) {
      console.log('useAdminStats: Iniciando carregamento...');
      loadStats();
    }
  }, [loadStats, stats]);

  return {
    stats,
    loading,
    error,
    loadStats,
  };
}
