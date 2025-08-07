'use client'

import { Sidebar } from '@/components/Sidebar'

interface EnterpriseLayoutProps {
  children: React.ReactNode
}

export function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  // A proteção de autenticação agora é feita no Server Component
  // Este layout apenas renderiza o Sidebar
  return (
    <Sidebar>
      {children}
    </Sidebar>
  )
}
