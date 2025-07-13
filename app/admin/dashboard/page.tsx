'use client';

import { Users, UserCheck, UserX, Building2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatsCard } from '@/components/StatsCard';
import { UsersByPlanChart } from '@/components/UsersByPlanChart';
import { RecentUsers } from '@/components/RecentUsers';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminDashboard() {
  const { stats, loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600">
            Visão geral dos usuários e estatísticas do sistema
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={Users}
            description="Todos os usuários registrados"
          />
          <StatsCard
            title="Usuários Ativos"
            value={stats.activeUsers}
            icon={UserCheck}
            description="Usuários com status ativo"
          />
          <StatsCard
            title="Usuários Inativos"
            value={stats.inactiveUsers}
            icon={UserX}
            description="Usuários com status inativo"
          />
          <StatsCard
            title="Empresas"
            value={stats.usersByType?.find(t => t.type === 'ENTERPRISE')?.count || 0}
            icon={Building2}
            description="Usuários do tipo empresa"
          />
        </motion.div>

        {/* Charts and Tables */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Users by Plan Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <UsersByPlanChart data={stats.usersByPlan || []} />
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <RecentUsers users={stats.recentUsers || []} />
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {/* User Types Distribution */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo</h3>
            <div className="space-y-3">
              {stats.usersByType?.map((type) => (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {type.type === 'ADMIN' ? 'Administradores' : 'Empresas'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{type.count}</span>
                    <span className="text-xs text-gray-500">
                      ({stats.totalUsers > 0 ? ((type.count / stats.totalUsers) * 100).toFixed(1) : '0.0'}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active vs Inactive */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Status dos Usuários</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ativos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{stats.activeUsers}</span>
                  <span className="text-xs text-gray-500">
                    ({stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inativos</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">{stats.inactiveUsers}</span>
                  <span className="text-xs text-gray-500">
                    ({stats.totalUsers > 0 ? ((stats.inactiveUsers / stats.totalUsers) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
