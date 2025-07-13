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
  CreditCard,
  DollarSign 
} from 'lucide-react';
import { Plan } from '@/types';
import { usePlans } from '@/hooks/usePlans';
import { useAlertModal } from '@/hooks/useAlertModal';
import { motion } from 'framer-motion';

interface PlansTableProps {
  plans: Plan[];
  loading: boolean;
  onEdit: (plan: Plan) => void;
  onView: (plan: Plan) => void;
}

export function PlansTable({ plans, loading, onEdit, onView }: PlansTableProps) {
  const { togglePlanStatus } = usePlans();
  const { showToggleAlert } = useAlertModal();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleStatus = (plan: Plan) => {
    const action = plan.active ? 'inativar' : 'ativar';
    showToggleAlert(plan.name, action, async () => {
      await togglePlanStatus(plan.id);
    });
  };

  // Filtrar e ordenar planos
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plans.filter(plan => {
      const matchesSearch = plan?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        plan?.description?.toLowerCase()?.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && plan.active !== false) ||
        (statusFilter === 'INACTIVE' && plan.active === false);
      
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
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
  }, [plans, searchTerm, statusFilter, sortBy, sortOrder]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
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
            <Label htmlFor="search">Buscar planos</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nome ou descrição..."
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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
          >
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
              <Select value={sortBy} onValueChange={(value: 'name' | 'price' | 'createdAt') => setSortBy(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
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
            {filteredAndSortedPlans.length} de {plans.length} planos
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
                  Plano
                </th>
                <th style={{ width: '15%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Preço
                </th>
                <th style={{ width: '30%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Descrição
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Permissões
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
              {filteredAndSortedPlans.length > 0 ? (
                filteredAndSortedPlans.map((plan, index) => (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td style={{ width: '25%' }} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center w-full min-w-0">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1 overflow-hidden">
                          <OverflowSafeText 
                            className="text-sm font-medium text-gray-900"
                            title={plan.name}
                          >
                            {plan.name}
                          </OverflowSafeText>
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '15%' }} className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        {formatPrice(plan.price)}
                      </div>
                    </td>
                    <td style={{ width: '30%' }} className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <OverflowSafeText 
                        className="text-sm text-gray-600"
                        title={plan.description || '-'}
                      >
                        {plan.description || '-'}
                      </OverflowSafeText>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <Badge
                        variant={plan.active !== false ? 'default' : 'secondary'}
                        className={plan.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {plan.active !== false ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {plan.permissions?.length || 0} permissões
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(plan)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Visualizar plano"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(plan)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar plano"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(plan)}
                          className={`${
                            plan.active !== false
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={plan.active !== false ? 'Inativar plano' : 'Ativar plano'}
                        >
                          {plan.active !== false ? (
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
                      {searchTerm || statusFilter !== 'ALL' ? (
                        <>
                          <p className="text-lg mb-2">Nenhum plano encontrado</p>
                          <p className="text-sm">
                            Nenhum plano corresponde aos filtros aplicados.
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
                          <p className="text-lg mb-2">Nenhum plano cadastrado</p>
                          <p className="text-sm">
                            Comece criando o primeiro plano.
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
