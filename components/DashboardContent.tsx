"use client";

import { CardSaldo } from '@/components/CardSaldo';
import { GraficoFinanceiro } from '@/components/GraficoFinanceiro';
import { ListaTransacoes } from '@/components/ListaTransacoes';
import { motion } from 'framer-motion';

interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  transactions: any[];
}

export default function DashboardContent({ dashboardData }: { dashboardData: DashboardData }) {
  return (
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
  );
}
