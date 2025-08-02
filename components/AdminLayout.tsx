'use client'

import { Sidebar } from '@/components/Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Não precisa mais de proteção client-side, pois é feita no Server Component
  return (
    <Sidebar>
      {children}
    </Sidebar>
  )
}
