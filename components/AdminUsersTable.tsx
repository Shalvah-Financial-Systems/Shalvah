'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TruncatedText } from '@/components/ui/truncated-text';
import { OverflowSafeText } from '@/components/ui/overflow-safe-text';
import { 
  Edit, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Filter, 
  X, 
  Eye, 
  User, 
  Mail, 
  CreditCard 
} from 'lucide-react';
import { AdminUser } from '@/types';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAlertModal } from '@/hooks/useAlertModal';
import { motion } from 'framer-motion';

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
  onEdit: (user: AdminUser) => void;
  onView: (user: AdminUser) => void;
}

export function AdminUsersTable({
  users,
  loading,
  onEdit,
  onView,
}: AdminUsersTableProps) {
  const { toggleUserStatus } = useAdminUsers();
  const { showToggleAlert } = useAlertModal();
  
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = (user: AdminUser) => {
    const action = user.active ? 'inativar' : 'ativar';
    showToggleAlert(user.name, action, async () => {
      await toggleUserStatus(user.id);
    });
  };
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ADMIN' | 'ENTERPRISE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'type' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user?.cnpj?.includes(searchTerm);
      
      const matchesType = typeFilter === 'ALL' || user.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && user.active !== false) ||
        (statusFilter === 'INACTIVE' && user.active === false);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCnpj = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('name');
    setSortOrder('asc');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Barra de busca */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Buscar usuários</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <Label htmlFor="typeFilter">Tipo</Label>
              <Select value={typeFilter} onValueChange={(value: 'ALL' | 'ADMIN' | 'ENTERPRISE') => setTypeFilter(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="ENTERPRISE">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={(value: 'ALL' | 'ACTIVE' | 'INACTIVE') => setStatusFilter(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortBy">Ordenar por</Label>
              <Select value={sortBy} onValueChange={(value: 'name' | 'email' | 'type' | 'createdAt') => setSortBy(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                  <SelectItem value="createdAt">Data de criação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Resumo dos resultados */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {filteredAndSortedUsers.length} de {users.length} usuários
            {searchTerm && ` • Filtrado por: "${searchTerm}"`}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th style={{ width: '25%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th style={{ width: '25%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th style={{ width: '15%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tipo
                </th>
                <th style={{ width: '15%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Plano
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Criado em
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td style={{ width: '25%' }} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center w-full min-w-0">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1 overflow-hidden">
                          <OverflowSafeText 
                            className="text-sm font-medium text-gray-900"
                            title={user.name}
                          >
                            {user.name}
                          </OverflowSafeText>
                          {user.cnpj && (
                            <OverflowSafeText className="text-sm text-gray-500">
                              CNPJ: {formatCnpj(user.cnpj)}
                            </OverflowSafeText>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '25%' }} className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600 min-w-0 w-full overflow-hidden">
                        <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <OverflowSafeText title={user.email}>
                          {user.email}
                        </OverflowSafeText>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <Badge variant={user.type === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.type === 'ADMIN' ? 'Administrador' : 'Empresa'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                        {user.plan?.name || 'Nenhum plano'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <Badge
                        variant={user.active !== false ? 'default' : 'secondary'}
                        className={user.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {user.active !== false ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(user)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Visualizar usuário"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          className={`${
                            user.active !== false
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={user.active !== false ? 'Inativar usuário' : 'Ativar usuário'}
                        >
                          {user.active !== false ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                        <>
                          <p className="text-lg mb-2">Nenhum usuário encontrado</p>
                          <p className="text-sm">
                            Nenhum usuário corresponde aos filtros aplicados.
                          </p>
                          <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="mt-4"
                          >
                            Limpar filtros
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-lg mb-2">Nenhum usuário cadastrado</p>
                          <p className="text-sm">
                            Comece criando o primeiro usuário.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
