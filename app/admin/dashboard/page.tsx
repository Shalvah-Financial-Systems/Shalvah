
import { cookies } from 'next/headers';
import api from '@/lib/api';
import { redirect } from 'next/navigation';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import { AdminLayout } from '@/components/AdminLayout';

export default async function AdminDashboard() {
  // SSR: buscar perfil do usuário
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  let user = null;
  try {
    const response = await api.get('/auth/profile', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    user = response.data.user || response.data;
  } catch {
    console.log('Usuário não autenticado - redirecionando para login');
  }
  if (!user || user.type != 'ADMIN') {
    console.log('Usuário não é admin - redirecionando para login')
    redirect('/login');
  }

  let stats = null;
  let error = null;
  try {
    const response = await api.get('/users/dashboard', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    stats = response.data;
  } catch (err: any) {
    // Se o endpoint não existir, usar dados mock
    console.warn('Endpoint /admin/stats não encontrado, usando dados mock');
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
    <AdminDashboardContent stats={stats} />
  );
}
