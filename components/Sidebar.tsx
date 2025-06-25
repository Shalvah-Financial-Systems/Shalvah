'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  X,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { logout } = useAuth();
  const [userName, setUserName] = useState<string>('Usuário');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Busca dados do usuário se necessário
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUserName(data.user.name || 'Usuário');
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUser();
  }, []);
  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/nova-transacao',
      icon: Plus,
      label: 'Nova Transação',
      active: pathname === '/nova-transacao',
    },
    {
      href: '/categorias',
      icon: Tag,
      label: 'Categorias',
      active: pathname === '/categorias',
    },
    {
      href: '/configuracoes',
      icon: Settings,
      label: 'Configurações',
      active: pathname === '/configuracoes',
    },
  ];

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '4rem' },
  };

  const SidebarContent = () => (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className="bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm"
      style={{
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-100"
        style={{
          padding: '1rem',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard"
            className="flex items-center space-x-3"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div 
              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
              style={{
                width: '2rem',
                height: '2rem',
                backgroundColor: '#2563eb',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span 
                className="text-white font-bold text-sm"
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                }}
              >
                S
              </span>
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span 
                    className="text-xl font-bold text-gray-900"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#111827',
                    }}
                  >
                    Shalvah
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div 
        className="flex-1 px-3 py-4"
        style={{
          flex: 1,
          padding: '1rem 0.75rem',
        }}
      >
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'colors 0.2s',
                  backgroundColor: item.active ? '#eff6ff' : 'transparent',
                  color: item.active ? '#1d4ed8' : '#6b7280',
                  borderRight: item.active ? '2px solid #2563eb' : 'none',
                  textDecoration: 'none',
                }}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3"
                      style={{ marginLeft: '0.75rem' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User section */}
      <div 
        className="p-4 border-t border-gray-100"
        style={{
          padding: '1rem',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 h-auto"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.5rem',
                height: 'auto',
              }}
            >
              <div 
                className="flex items-center space-x-3"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div 
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-left"
                      style={{ textAlign: 'left' }}
                    >
                      <p 
                        className="text-sm font-medium text-gray-900 truncate"
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {userName}
                      </p>
                      <p 
                        className="text-xs text-gray-500"
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        Usuário
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-sm"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 z-50"
            >
              <div style={{ width: '16rem' }}>
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <main 
          className="flex-1 overflow-auto bg-gray-50 p-6 lg:ml-0 ml-0"
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            marginLeft: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
