'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CEPInput } from '@/components/ui/cep-input';
import { Client, CreateClientData, UpdateClientData } from '@/types';
import { X, User, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCEPSearch } from '@/hooks/useCEPSearch';
import { useCNPJSearch } from '@/hooks/useCNPJSearch';
import { formatPhone, formatNumber, formatLettersOnly, formatState, formatCPFCNPJ, validateCPFCNPJ, isValidCNPJ } from '@/lib/masks';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpfCnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 letras').optional().or(z.literal('')),
  zipCode: z.string().optional(),
});

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClientData | UpdateClientData) => Promise<boolean>;
  client: Client | null;
  isUpdating: boolean;
}

export function ClientModal({
  isOpen,
  onClose,
  onSave,
  client,
  isUpdating
}: ClientModalProps) {
  const [cpfCnpjError, setCpfCnpjError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateClientData>({
    resolver: zodResolver(clientSchema),
  });

  const watchedCpfCnpj = watch('cpfCnpj') || '';

  const { isSearchingCEP, handleCEPSearch, resetSearch: resetCEPSearch } = useCEPSearch({ setValue });
  const { isSearchingCNPJ, handleCNPJSearch, resetSearch: resetCNPJSearch } = useCNPJSearch({ setValue });

  // Preencher formulário quando cliente mudar
  useEffect(() => {
    if (client && isOpen) {
      reset({
        name: client.name,
        cpfCnpj: client.cpfCnpj || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        number: client.number || '',
        complement: client.complement || '',
        district: client.district || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
      });
    } else if (isOpen && !client) {
      reset({
        name: '',
        cpfCnpj: '',
        email: '',
        phone: '',
        address: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: '',
      });
    }
  }, [client, isOpen, reset]);

  const handleSave = async (data: CreateClientData) => {
    const success = await onSave(data);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    setCpfCnpjError('');
    resetCEPSearch();
    resetCNPJSearch();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">
                      {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Nome do cliente"
                        className={errors.name ? 'border-red-500 bg-red-50' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                      <div className="relative">
                        <Input
                          id="cpfCnpj"
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          className={cpfCnpjError ? 'border-red-500 bg-red-50' : ''}
                          value={watchedCpfCnpj}
                          onChange={(e) => {
                            const formattedValue = formatCPFCNPJ(e.target.value);
                            setValue('cpfCnpj', formattedValue);
                            
                            // Validar em tempo real
                            const validation = validateCPFCNPJ(formattedValue);
                            setCpfCnpjError(validation.message);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            // Se tem 14 dígitos, é CNPJ e faz busca
                            if (value.length === 14 && isValidCNPJ(e.target.value)) {
                              handleCNPJSearch(e.target.value);
                            }
                          }}
                        />
                        {isSearchingCNPJ && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      {cpfCnpjError && (
                        <p className="text-sm text-red-600">{cpfCnpjError}</p>
                      )}
                      {errors.cpfCnpj && (
                        <p className="text-sm text-red-600">{errors.cpfCnpj.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="cliente@email.com"
                        className={errors.email ? 'border-red-500 bg-red-50' : ''}
                        onChange={(e) => {
                          // Aplicar formatação de email básica (lowercase)
                          e.target.value = e.target.value.toLowerCase();
                        }}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="(11) 99999-9999"
                        onChange={(e) => {
                          e.target.value = formatPhone(e.target.value);
                        }}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address">Logradouro</Label>
                        <Input
                          id="address"
                          {...register('address')}
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          {...register('number')}
                          placeholder="123"
                          onChange={(e) => {
                            e.target.value = formatNumber(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          {...register('complement')}
                          placeholder="Apto, Sala, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">Bairro</Label>
                        <Input
                          id="district"
                          {...register('district')}
                          placeholder="Nome do bairro"
                          onChange={(e) => {
                            e.target.value = formatLettersOnly(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder="Nome da cidade"
                          onChange={(e) => {
                            e.target.value = formatLettersOnly(e.target.value);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          {...register('state')}
                          placeholder="SP"
                          maxLength={2}
                          className={errors.state ? 'border-red-500 bg-red-50' : ''}
                          onChange={(e) => {
                            e.target.value = formatState(e.target.value);
                          }}
                        />
                        {errors.state && (
                          <p className="text-sm text-red-600">{errors.state.message}</p>
                        )}
                      </div>

                      <CEPInput
                        register={register}
                        isSearchingCEP={isSearchingCEP}
                        onCEPSearch={handleCEPSearch}
                        error={errors.zipCode?.message}
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={isUpdating}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          {client ? 'Atualizar' : 'Salvar'}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
