'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'

interface EnterpriseLayoutProps {
  children: React.ReactNode
}

export function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const isEnterprise = user?.type === 'ENTERPRISE'
  const isAdmin = user?.type === 'ADMIN'

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não há usuário (logout), redirecionar imediatamente para login
        router.push('/login')
      } else if (!isEnterprise && !isAdmin) {
        // Se não for enterprise nem admin, redirecionar para login
        router.push('/login')
      }
    }
  }, [isEnterprise, isAdmin, loading, router, user])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isEnterprise && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas usuários empresariais podem acessar esta área.</p>
        </div>
      </div>
    )
  }

  return (
    <Sidebar>
      {children}
    </Sidebar>
  )
}
