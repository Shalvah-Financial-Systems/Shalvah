import { withEnterpriseProtection } from '@/lib/auth-protection';
import CategoriasClient from './categorias-client';

export default async function CategoriasPage() {
  // Proteção SSR - verificar autenticação e autorização
  await withEnterpriseProtection();
  
  return <CategoriasClient />;
}
