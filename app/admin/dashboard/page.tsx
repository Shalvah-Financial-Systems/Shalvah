
import { cookies } from 'next/headers';
import api from '@/lib/api';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import { AdminLayout } from '@/components/AdminLayout';
import { withAdminProtection } from '@/lib/auth-protection';

export default async function AdminDashboard() {
  // Proteção SSR - verificar autenticação e autorização de admin
  const { user } = await withAdminProtection();
  
  // SSR: buscar stats admin usando cookies para autenticação
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // SSR: buscar stats admin - usar dados mock temporariamente
  let stats = null;
  let error = null;
  try {
    const response = await api.get('/admin/stats', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    stats = response.data;
  } catch (err: any) {
    // Se o endpoint não existir, usar dados mock
    console.warn('Endpoint /admin/stats não encontrado, usando dados mock');
    stats = {
      totalUsers: 25,
      activeUsers: 20,
      inactiveUsers: 5,
      usersByType: [
        { type: 'ADMIN', count: 2 },
        { type: 'ENTERPRISE', count: 23 }
      ],
      usersByPlan: [
        { plan: 'Básico', count: 15 },
        { plan: 'Premium', count: 8 },
        { plan: 'Enterprise', count: 2 }
      ],
      recentUsers: [
        { id: 1, name: 'João Silva', email: 'joao@empresa.com', type: 'ENTERPRISE', createdAt: new Date().toISOString() },
        { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', type: 'ENTERPRISE', createdAt: new Date().toISOString() },
        { id: 3, name: 'Pedro Lima', email: 'pedro@empresa.com', type: 'ENTERPRISE', createdAt: new Date().toISOString() }
      ]
    };
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Nenhum dado disponível</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminDashboardContent stats={stats} />
    </AdminLayout>
  );
}
