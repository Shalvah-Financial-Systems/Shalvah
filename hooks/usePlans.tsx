import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plan, CreatePlanData, UpdatePlanData } from '@/types';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadPlans = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('usePlans: Chamada já em progresso, ignorando...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      console.log('usePlans: Fazendo chamada para /plans');
      const { data } = await api.get('/plans');
      setPlans(data.data || data || []);
      console.log('usePlans: Dados carregados com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar planos';
      setError(message);
      console.error('usePlans: Erro ao carregar planos:', error);
      
      if (error.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para acessar planos');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const createPlan = useCallback(async (planData: CreatePlanData): Promise<boolean> => {
    try {
      const response = await api.post('/plans', planData);
      await loadPlans(); // Recarregar para pegar as permissões associadas
      toast.success('Plano criado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar plano';
      toast.error(message);
      return false;
    }
  }, [loadPlans]);

  const updatePlan = useCallback(async (id: string, planData: UpdatePlanData): Promise<boolean> => {
    try {
      await api.put(`/plans/${id}`, planData);
      await loadPlans(); // Recarregar para pegar as permissões atualizadas
      toast.success('Plano atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar plano';
      toast.error(message);
      return false;
    }
  }, [loadPlans]);

  const togglePlanStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/plans/${id}/toggle-status`);
      await loadPlans();
      toast.success('Status do plano atualizado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar status do plano';
      toast.error(message);
      return false;
    }
  }, [loadPlans]);

  const getPlanById = useCallback((id: string): Plan | undefined => {
    return plans.find(plan => plan.id === id);
  }, [plans]);

  useEffect(() => {
    // Só carregar se ainda não foi carregado
    if (plans.length === 0 && !isLoadingRef.current) {
      console.log('usePlans: Iniciando carregamento...');
      loadPlans();
    }
  }, [loadPlans, plans.length]);

  return {
    plans,
    loading,
    error,
    loadPlans,
    createPlan,
    updatePlan,
    togglePlanStatus,
    getPlanById,
  };
}
