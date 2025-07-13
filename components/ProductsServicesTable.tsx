'use client';

import { useState, useMemo } from 'react';
import { useProductsServices } from '@/hooks/useProductsServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductsServices, CreateProductsServicesData, UpdateProductsServicesData } from '@/types';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Filter, Package, Wrench } from 'lucide-react';
import { ProductServiceModal } from '@/components/ProductServiceModal';
import { useAlertModal } from '@/hooks/useAlertModal';
import { motion } from 'framer-motion';

export function ProductsServicesTable() {
  const { productsServices, loading, createProductService, updateProductService, toggleProductServiceStatus } = useProductsServices();
  const { showToggleAlert } = useAlertModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'type' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductsServices | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Filtrar e ordenar produtos/serviços
  const filteredAndSortedItems = useMemo(() => {
    let filtered = productsServices.filter(item => {
      const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        item?.description?.toLowerCase()?.includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
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
  }, [productsServices, searchTerm, sortBy, sortOrder, typeFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCreate = async (data: CreateProductsServicesData): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const success = await createProductService(data);
      if (success) {
        setModalOpen(false);
        setSelectedItem(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (data: UpdateProductsServicesData): Promise<boolean> => {
    if (!selectedItem) return false;
    
    setIsUpdating(true);
    try {
      const success = await updateProductService(selectedItem.id, data);
      if (success) {
        setModalOpen(false);
        setSelectedItem(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (data: CreateProductsServicesData | UpdateProductsServicesData): Promise<boolean> => {
    if (selectedItem) {
      return await handleUpdate(data as UpdateProductsServicesData);
    } else {
      return await handleCreate(data as CreateProductsServicesData);
    }
  };

  const handleToggleStatus = (item: ProductsServices) => {
    const isActive = item.active !== false;
    const action = isActive ? 'inativar' : 'ativar';
    const itemType = item.type === 'PRODUCT' ? 'produto' : 'serviço';
    
    showToggleAlert(
      `${action} ${itemType}`,
      `Tem certeza que deseja ${action} o ${itemType} ${item.name}?`,
      async () => {
        setToggleLoading(item.id);
        try {
          const success = await toggleProductServiceStatus(item.id);
          if (!success) {
            // Error handling is done in the hook
          }
        } catch (error) {
          console.error('Erro ao alterar status do produto/serviço:', error);
        } finally {
          setToggleLoading(null);
        }
      }
    );
  };

  const openEditModal = (item: ProductsServices) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setSelectedItem(null);
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
            <Label htmlFor="search">Buscar produtos/serviços</Label>
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
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Item</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="typeFilter">Tipo</Label>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="PRODUCT">Produtos</SelectItem>
                    <SelectItem value="SERVICE">Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="type">Tipo</SelectItem>
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
          Mostrando {filteredAndSortedItems.length} de {productsServices.length} itens
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Descrição
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
              {filteredAndSortedItems.length > 0 ? (
                filteredAndSortedItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            item.type === 'PRODUCT' ? 'bg-purple-100' : 'bg-orange-100'
                          }`}>
                            {item.type === 'PRODUCT' ? (
                              <Package className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Wrench className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {item.type === 'PRODUCT' ? 'Produto' : 'Serviço'} • {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <Badge variant={item.type === 'PRODUCT' ? 'default' : 'secondary'}>
                        {item.type === 'PRODUCT' ? 'Produto' : 'Serviço'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <motion.div
                        key={`${item.id}-${item.active}`}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant={item.active !== false ? 'default' : 'secondary'}
                          className={item.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {item.active !== false ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </motion.div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          disabled={isUpdating || toggleLoading === item.id || loading}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                          disabled={toggleLoading === item.id || isUpdating || loading}
                          className={`transition-all duration-200 ${
                            item.active !== false
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          } ${toggleLoading === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={
                            toggleLoading === item.id
                              ? 'Processando...'
                              : item.active !== false 
                                ? `Inativar ${item.type === 'PRODUCT' ? 'produto' : 'serviço'}` 
                                : `Ativar ${item.type === 'PRODUCT' ? 'produto' : 'serviço'}`
                          }
                        >
                          <motion.div
                            key={`${item.id}-${item.active}-${toggleLoading === item.id}`}
                            initial={{ scale: 0.8, rotate: 0 }}
                            animate={{ scale: 1, rotate: toggleLoading === item.id ? 360 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {toggleLoading === item.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : item.active !== false ? (
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
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum item encontrado
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || typeFilter !== 'ALL'
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Comece adicionando seu primeiro produto ou serviço.'}
                      </p>
                      <Button onClick={openCreateModal}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Item
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
      <ProductServiceModal
        isOpen={modalOpen}
        onClose={closeModals}
        onSubmit={handleSave}
        productService={selectedItem}
        title={isUpdating ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}
      />
    </motion.div>
  );
}
