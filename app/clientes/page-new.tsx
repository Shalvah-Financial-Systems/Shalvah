import { withEnterpriseProtection } from '@/lib/auth-protection';
import ClientesClient from './clientes-client';

export default async function ClientesPage() {
  // Proteção SSR - verificar autenticação e autorização
  await withEnterpriseProtection();
  
  return <ClientesClient />;
}
