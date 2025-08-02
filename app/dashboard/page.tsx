
import { cookies } from 'next/headers';
import api from '@/lib/api';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';
import { EnterpriseLayout } from '@/components/EnterpriseLayout';

export default async function DashboardPage() {
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
    // Não autenticado
  }
  if (!user) {
    redirect('/login');
  }
  // Remover redirecionamento do admin - permitir que admin acesse dashboard enterprise
  // if (user.type === 'ADMIN') {
  //   redirect('/admin/dashboard');
  // }

  // SSR: buscar dados do dashboard
  let dashboardData = {
    balance: 0,
    income: 0,
    expenses: 0,
    transactions: [],
  };
  let error = null;
  try {
    const response = await api.get('/transactions/dashboard', {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });
    const data = response.data.data || response.data;
    dashboardData = {
      balance: data.balance || 0,
      income: data.income || 0,
      expenses: data.expenses || 0,
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
    };
  } catch (err: any) {
    error = err.message || 'Erro ao carregar dados do dashboard';
  }

  if (error) {
    return (
      <EnterpriseLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout>
      <DashboardContent dashboardData={dashboardData} />
    </EnterpriseLayout>
  );
}
