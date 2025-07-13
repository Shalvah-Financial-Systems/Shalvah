'use client';

import { useState, useMemo } from 'react';
import { useClients } from '@/hooks/useClients';
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
import { Client, CreateClientData, UpdateClientData } from '@/types';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Filter, User, Mail, Phone } from 'lucide-react';
import { ClientModal } from '@/components/ClientModal';
import { ToggleClientModal } from '@/components/ToggleClientModal';
import { motion } from 'framer-motion';

export function ClientsTable() {
  const { clients, loading, createClient, updateClient, toggleClientStatus } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtrar e ordenar clientes
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client =>
      client?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      client?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      client?.cpfCnpj?.includes(searchTerm)
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
  }, [clients, searchTerm, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCpfCnpj = (cpfCnpj: string) => {
    if (cpfCnpj.length === 11) {
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpfCnpj.length === 14) {
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpfCnpj;
  };

  const handleCreate = async (data: CreateClientData): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const success = await createClient(data);
      if (success) {
        setModalOpen(false);
        setSelectedClient(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (data: UpdateClientData): Promise<boolean> => {
    if (!selectedClient) return false;
    
    setIsUpdating(true);
    try {
      const success = await updateClient(selectedClient.id, data);
      if (success) {
        setModalOpen(false);
        setSelectedClient(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (data: CreateClientData | UpdateClientData): Promise<boolean> => {
    if (selectedClient) {
      return await handleUpdate(data as UpdateClientData);
    } else {
      return await handleCreate(data as CreateClientData);
    }
  };

  const handleToggleStatus = async (): Promise<boolean> => {
    if (!selectedClient) return false;
    
    setIsUpdating(true);
    try {
      const success = await toggleClientStatus(selectedClient.id);
      if (success) {
        setToggleModalOpen(false);
        setSelectedClient(null);
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const openToggleModal = (client: Client) => {
    setSelectedClient(client);
    setToggleModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setToggleModalOpen(false);
    setSelectedClient(null);
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
            <Label htmlFor="search">Buscar clientes</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
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
              <span className="hidden sm:inline">Novo Cliente</span>
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
          Mostrando {filteredAndSortedClients.length} de {clients.length} clientes
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
                  CPF/CNPJ
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
              {filteredAndSortedClients.length > 0 ? (
                filteredAndSortedClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500 md:hidden">
                            {client.email || client.phone || 'Sem contato'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {client.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {client.cpfCnpj ? formatCpfCnpj(client.cpfCnpj) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {client.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <Badge
                        variant={client.active !== false ? 'default' : 'secondary'}
                        className={client.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {client.active !== false ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(client)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openToggleModal(client)}
                          className={`${
                            client.active !== false
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={client.active !== false ? 'Inativar cliente' : 'Ativar cliente'}
                        >
                          {client.active !== false ? (
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum cliente encontrado
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Comece adicionando seu primeiro cliente.'}
                      </p>
                      <Button onClick={openCreateModal}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Cliente
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
      <ClientModal
        isOpen={modalOpen}
        onClose={closeModals}
        onSave={handleSave}
        client={selectedClient}
        isUpdating={isUpdating}
      />
      
      <ToggleClientModal
        isOpen={toggleModalOpen}
        onClose={closeModals}
        onConfirm={handleToggleStatus}
        client={selectedClient}
        isToggling={isUpdating}
      />
    </motion.div>
  );
}
