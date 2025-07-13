import { useAuth } from './useAuth'

export function useAdminProtection() {
  const { user } = useAuth()

  const isAdmin = user?.type === 'ADMIN'
  
  const requireAdmin = () => {
    if (!isAdmin) {
      throw new Error('Acesso negado. Apenas administradores podem acessar esta funcionalidade.')
    }
  }

  return {
    isAdmin,
    requireAdmin
  }
}
