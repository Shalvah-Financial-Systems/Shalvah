'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminProtection } from '@/hooks/useAdminProtection'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin } = useAdminProtection()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não há usuário (logout), redirecionar imediatamente para login
        router.push('/login')
      } else if (!isAdmin) {
        // Se for ENTERPRISE, redirecionar para dashboard empresarial
        if (user?.type === 'ENTERPRISE') {
          router.push('/dashboard')
        } else {
          // Se não for admin nem enterprise, redirecionar para login
          router.push('/login')
        }
      }
    }
  }, [isAdmin, loading, router, user])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta área.</p>
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
