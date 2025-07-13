'use client';

import { useState, useEffect } from 'react';
import { EnterpriseLayout } from '@/components/EnterpriseLayout';
import { CardSaldo } from '@/components/CardSaldo';
import { GraficoFinanceiro } from '@/components/GraficoFinanceiro';
import { ListaTransacoes } from '@/components/ListaTransacoes';
import { DashboardData } from '@/types';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const user = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    transactions: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const authLoading = false; // Set this according to your actual auth loading logic if needed
  
  // Carregar dados do dashboard do endpoint específico
  // Esta função pode ser chamada para atualizar os dados após operações CRUD
  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setDashboardLoading(true);
      const response = await api.get('/transactions/dashboard');
      const data = response.data.data || response.data;
      
      // Garantir que transactions seja sempre um array
      setDashboardData({
        balance: data.balance || 0,
        income: data.income || 0,
        expenses: data.expenses || 0,
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      
      // Em caso de erro, manter estrutura segura
      setDashboardData({
        balance: 0,
        income: 0,
        expenses: 0,
        transactions: [],
      });
      
      if (error.response?.status === 401) {
        console.log('Token inválido - usuário será redirecionado pelo interceptador');
      }
    } finally {
      setDashboardLoading(false);
    }
  };
  
  useEffect(() => {
    // Carregar dados quando usuário estiver disponível
    if (user && !authLoading) {
      loadDashboardData();
    } else if (!authLoading && !user) {
      // Se não há usuário e não está carregando, redirecionar para login
      router.push('/login');
    }
  }, [user, authLoading, router]);  
  
  // Função para recarregar dados (pode ser usada por outros componentes)
  const refreshDashboard = async () => {
    await loadDashboardData();
  };

  // Mostrar loading se ainda está autenticando ou carregando dados do dashboard
  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário após carregar, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <EnterpriseLayout>
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo de volta!
            </p>
          </div>
        </motion.div>

        {/* Cards de Saldo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <CardSaldo
            balance={dashboardData.balance}
            income={dashboardData.income}
            expenses={dashboardData.expenses}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GraficoFinanceiro
              income={dashboardData.income}
              expenses={dashboardData.expenses}
            />
          </motion.div>

          {/* Lista de Transações */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ListaTransacoes
              transactions={dashboardData.transactions.slice(0, 10)} // Mostrar apenas últimas 10 transações
              showActions={true}
              showNewTransactionButton={true}
            />
          </motion.div>
        </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
