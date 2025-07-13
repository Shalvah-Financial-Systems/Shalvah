'use client';

import { useState, useMemo } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
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
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Filter, Building, Mail, Phone } from 'lucide-react';
import { SupplierModal } from '@/components/SupplierModal';
import { useAlertModal } from '@/hooks/useAlertModal';
import { motion } from 'framer-motion';

export function SuppliersTable() {
  const { suppliers, loading, createSupplier, updateSupplier, toggleSupplierStatus } = useSuppliers();
  const { showToggleAlert } = useAlertModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Filtrar e ordenar fornecedores
  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier =>
      supplier?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      supplier?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      supplier?.cnpj?.includes(searchTerm)
    );

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliers, searchTerm, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCnpj = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCreate = async (data: CreateSupplierData): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const success = await createSupplier(data);
      if (success) {
        setModalOpen(false);
        setSelectedSupplier(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (data: UpdateSupplierData): Promise<boolean> => {
    if (!selectedSupplier) return false;
    
    setIsUpdating(true);
    try {
      const success = await updateSupplier(selectedSupplier.id, data);
      if (success) {
        setModalOpen(false);
        setSelectedSupplier(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (data: CreateSupplierData | UpdateSupplierData): Promise<boolean> => {
    if (selectedSupplier) {
      return await handleUpdate(data as UpdateSupplierData);
    } else {
      return await handleCreate(data as CreateSupplierData);
    }
  };

  const handleToggleStatus = (supplier: Supplier) => {
    const isActive = supplier.active !== false;
    const action = isActive ? 'inativar' : 'ativar';
    
    showToggleAlert(
      `${action} fornecedor`,
      `Tem certeza que deseja ${action} o fornecedor ${supplier.name}?`,
      async () => {
        setToggleLoading(supplier.id);
        try {
          const success = await toggleSupplierStatus(supplier.id);
          if (!success) {
            // Error handling is done in the hook
          }
        } catch (error) {
          console.error('Erro ao alterar status do fornecedor:', error);
        } finally {
          setToggleLoading(null);
        }
      }
    );
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedSupplier(null);
    setModalOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setSelectedSupplier(null);
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
            <Label htmlFor="search">Buscar fornecedores</Label>
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
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Fornecedor</span>
            </Button>
          </div>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 p-4 rounded-lg border space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="createdAt">Data de criação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Ordem</Label>
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="mb-6">
        <div className="text-sm text-gray-600">
          Mostrando {filteredAndSortedSuppliers.length} de {suppliers.length} fornecedores
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Criado em
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSuppliers.length > 0 ? (
                filteredAndSortedSuppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Building className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          <div className="text-sm text-gray-500 md:hidden">
                            {supplier.email || supplier.phone || 'Sem contato'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {supplier.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {supplier.cnpj ? formatCnpj(supplier.cnpj) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {supplier.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <motion.div
                        key={`${supplier.id}-${supplier.active}`}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant={supplier.active !== false ? 'default' : 'secondary'}
                          className={supplier.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {supplier.active !== false ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </motion.div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(supplier.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(supplier)}
                          disabled={isUpdating || toggleLoading === supplier.id || loading}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar fornecedor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(supplier)}
                          disabled={toggleLoading === supplier.id || isUpdating || loading}
                          className={`transition-all duration-200 ${
                            supplier.active !== false
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          } ${toggleLoading === supplier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={
                            toggleLoading === supplier.id
                              ? 'Processando...'
                              : supplier.active !== false 
                                ? 'Inativar fornecedor' 
                                : 'Ativar fornecedor'
                          }
                        >
                          <motion.div
                            key={`${supplier.id}-${supplier.active}-${toggleLoading === supplier.id}`}
                            initial={{ scale: 0.8, rotate: 0 }}
                            animate={{ scale: 1, rotate: toggleLoading === supplier.id ? 360 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {toggleLoading === supplier.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : supplier.active !== false ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </motion.div>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum fornecedor encontrado
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Comece adicionando seu primeiro fornecedor.'}
                      </p>
                      <Button onClick={openCreateModal}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Fornecedor
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SupplierModal
        isOpen={modalOpen}
        onClose={closeModals}
        onSave={handleSave}
        supplier={selectedSupplier}
        isUpdating={isUpdating}
      />
    </motion.div>
  );
}
