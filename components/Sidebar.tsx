'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProtection } from '@/hooks/useAdminProtection';
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
  Tag,
  Users,
  Truck,
  Package,
  ChevronDown,
  ChevronRight,
  Shield,
  CreditCard,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { logout, user } = useAuth();
  const { isAdmin } = useAdminProtection();
  const [userName, setUserName] = useState<string>('Usuário');
  const [userLabel, setUserLabel] = useState<string>('Usuário');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  const userType = user?.type;

  // Memoizar a detecção de submenu ativo para evitar recálculos
  const shouldExpandParametrizacao = useMemo(() => {
    return pathname.startsWith('/categorias') || 
           pathname.startsWith('/clientes') || 
           pathname.startsWith('/fornecedores') || 
           pathname.startsWith('/produtos-servicos');
  }, [pathname]);

  useEffect(() => {
    // Usar dados do usuário já disponíveis no contexto de autenticação
    if (user) {
      setUserName(user.name || 'Usuário');
      
      // Definir o label baseado no tipo de usuário
      if (user.type === 'ENTERPRISE') {
        // Para ENTERPRISE, verificar se há informações do plano
        const planName = (user as any).plan?.name;
        setUserLabel(planName || 'Sem Plano');
      } else if (user.type) {
        // Para outros tipos, capitalizar apenas a primeira letra (verificar se type existe)
        const formattedType = user.type.charAt(0).toUpperCase() + user.type.slice(1).toLowerCase();
        setUserLabel(formattedType);
      } else {
        // Se não há type definido
        setUserLabel('Usuário');
      }
    } else {
      // Se não há usuário, resetar os estados
      setUserName('Usuário');
      setUserLabel('Usuário');
    }
  }, [user]);

  // Inicializar menus expandidos baseado na rota atual
  useEffect(() => {
    if (!isInitialized) {
      const initialExpandedMenus: string[] = [];
      
      // Verificar se estamos em uma rota que deveria expandir o submenu de parametrização
      if (shouldExpandParametrizacao) {
        initialExpandedMenus.push('parametrizacao');
      }
      
      // Verificar se estamos em uma rota admin que deveria expandir outros submenus (se houver no futuro)
      // Pode adicionar mais lógica aqui para outros submenus
      
      if (initialExpandedMenus.length > 0) {
        setExpandedMenus(initialExpandedMenus);
      }
      
      setIsInitialized(true);
    }
  }, [shouldExpandParametrizacao, isInitialized]);

  // Manter submenu aberto quando navegar para uma rota filha
  useEffect(() => {
    if (isInitialized) {
      setExpandedMenus(prev => {
        const newExpanded = [...prev];
        const hasParametrizacao = newExpanded.includes('parametrizacao');
        
        if (shouldExpandParametrizacao && !hasParametrizacao) {
          return [...newExpanded, 'parametrizacao'];
        }
        
        // Se não deveria estar expandido e está, opcionalmente fechar
        // Por enquanto vou manter aberto para melhor UX
        
        return prev; // Retornar o estado anterior se não há mudanças
      });
    }
  }, [shouldExpandParametrizacao, isInitialized]);

  const toggleSubmenu = useCallback((menuKey: string) => {
    setExpandedMenus(prev => {
      const newExpanded = [...prev];
      
      if (newExpanded.includes(menuKey)) {
        // Se é 'parametrizacao' e estamos em uma de suas rotas, não fechar
        if (menuKey === 'parametrizacao' && shouldExpandParametrizacao) {
          return newExpanded; // Manter aberto
        }
        return newExpanded.filter(key => key !== menuKey);
      } else {
        return [...newExpanded, menuKey];
      }
    });
  }, [shouldExpandParametrizacao]);

  const menuItems = useMemo(() => [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: pathname === '/dashboard',
      userType: 'ENTERPRISE', // Apenas para empresas
    },
    {
      href: '/nova-transacao',
      icon: Plus,
      label: 'Nova Transação',
      active: pathname === '/nova-transacao',
      userType: 'ENTERPRISE', // Apenas para empresas
    },
    {
      key: 'parametrizacao',
      icon: Settings,
      label: 'Parametrização',
      isSubmenu: true,
      active: pathname.startsWith('/categorias') || pathname.startsWith('/clientes') || pathname.startsWith('/fornecedores') || pathname.startsWith('/produtos-servicos'),
      userType: 'ENTERPRISE', // Apenas para empresas
      submenuItems: [
        {
          href: '/categorias',
          icon: Tag,
          label: 'Categorias',
          active: pathname === '/categorias',
        },
        {
          href: '/clientes',
          icon: Users,
          label: 'Clientes',
          active: pathname === '/clientes',
        },
        {
          href: '/fornecedores',
          icon: Truck,
          label: 'Fornecedores',
          active: pathname === '/fornecedores',
        },
        {
          href: '/produtos-servicos',
          icon: Package,
          label: 'Produtos/Serviços',
          active: pathname === '/produtos-servicos',
        },
      ]
    },
    {
      href: '/configuracoes',
      icon: Settings,
      label: 'Configurações',
      active: pathname === '/configuracoes',
      userType: 'ENTERPRISE', // Apenas para empresas
    },
    {
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard Admin',
      active: pathname === '/admin/dashboard',
      userType: 'ADMIN', // Apenas para admins
    },
    {
      href: '/admin/users',
      icon: UserCheck,
      label: 'Usuários',
      active: pathname === '/admin/users',
      userType: 'ADMIN', // Apenas para admins
    },
    {
      href: '/admin/plans',
      icon: CreditCard,
      label: 'Planos',
      active: pathname === '/admin/plans',
      userType: 'ADMIN', // Apenas para admins
    },
    {
      href: '/admin/permissions',
      icon: Shield,
      label: 'Permissões',
      active: pathname === '/admin/permissions',
      userType: 'ADMIN', // Apenas para admins
    },
  ], [pathname]);

  const filteredMenuItems = useMemo(() => {
    // Se está no admin dashboard, mostrar todos os menus para admin
    if (pathname.startsWith('/admin/')) {
      return menuItems.filter(item => item.userType === 'ADMIN');
    }
    
    // Se está em rota enterprise e é admin, mostrar menus enterprise
    if (userType === 'ADMIN') {
      return menuItems.filter(item => item.userType === 'ENTERPRISE');
    }
    
    // Se está em rota enterprise e é enterprise, mostrar menus enterprise  
    if (userType === 'ENTERPRISE') {
      return menuItems.filter(item => item.userType === 'ENTERPRISE');
    }
    
    // Fallback: se não há user logado ainda, mostrar todos os menus
    return menuItems;
  }, [menuItems, userType, pathname]);

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
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            
            // Se é um submenu
            if (item.isSubmenu && item.submenuItems) {
              const isExpanded = expandedMenus.includes(item.key || '');
              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleSubmenu(item.key || '')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'colors 0.2s',
                      backgroundColor: item.active ? '#eff6ff' : 'transparent',
                      color: item.active ? '#1d4ed8' : '#6b7280',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center">
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
                    </div>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                        {item.submenuItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                subItem.active
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
                                backgroundColor: subItem.active ? '#eff6ff' : 'transparent',
                                color: subItem.active ? '#1d4ed8' : '#6b7280',
                                borderRight: subItem.active ? '2px solid #2563eb' : 'none',
                                textDecoration: 'none',
                              }}
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <SubIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-3" style={{ marginLeft: '0.75rem' }}>
                                {subItem.label}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            
            // Menu item normal
            return (
              <Link
                key={item.href}
                href={item.href!}
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
                className="flex items-center space-x-3 min-w-0 w-full"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: 0,
                  width: '100%',
                }}
              >
                <div 
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
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
                      className="text-left min-w-0 flex-1"
                      style={{ 
                        textAlign: 'left',
                        minWidth: 0,
                        flex: 1,
                        overflow: 'hidden',
                      }}
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
                          maxWidth: '100%',
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
                        {userLabel}
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
