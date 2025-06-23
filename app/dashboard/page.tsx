'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CardSaldo } from '@/components/CardSaldo';
import { GraficoFinanceiro } from '@/components/GraficoFinanceiro';
import { ListaTransacoes } from '@/components/ListaTransacoes';
import { Button } from '@/components/ui/button';
import { DashboardData } from '@/types';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    transactions: [],
  });
  console.log(dashboardData)
  const [dataLoading, setDataLoading] = useState(true);
  useEffect(() => {
    // Carrega dados do dashboard - o middleware já protege a rota
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get('/transactions/dashboard');
      console.log('Dados do dashboard:', data);
      setDashboardData(data.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);    } finally {
      setDataLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Sidebar>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>            <p className="text-gray-600 mt-1">
              Bem-vindo de volta!
            </p>
          </div>
          
          <Link href="/nova-transacao">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </Link>
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
            transition={{ duration: 0.5, delay: 0.3 }}          >
            <ListaTransacoes
              transactions={dashboardData.transactions}
              onTransactionDeleted={loadDashboardData}
            />
          </motion.div>
        </div>
    </Sidebar>
  );
}
