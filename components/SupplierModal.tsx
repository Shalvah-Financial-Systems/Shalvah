'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CEPInput } from '@/components/ui/cep-input';
import { CNPJInput } from '@/components/ui/cnpj-input';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types';
import { X, Building, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCEPSearch } from '@/hooks/useCEPSearch';
import { useCNPJSearch } from '@/hooks/useCNPJSearch';
import { formatPhone, formatNumber, formatLettersOnly, formatState, validateCPFCNPJ } from '@/lib/masks';
import { useState } from 'react';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  fantasyName: z.string().optional(),
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

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSupplierData | UpdateSupplierData) => Promise<boolean>;
  supplier: Supplier | null;
  isUpdating: boolean;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSave,
  supplier,
  isUpdating
}: SupplierModalProps) {
  const [cnpjError, setCnpjError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateSupplierData>({
    resolver: zodResolver(supplierSchema),
  });

  const watchedCnpj = watch('cnpj') || '';

  const { isSearchingCEP, handleCEPSearch, resetSearch: resetCEPSearch } = useCEPSearch({ setValue });
  const { isSearchingCNPJ, handleCNPJSearch, resetSearch: resetCNPJSearch } = useCNPJSearch({ setValue });

  // Preencher formulário quando fornecedor mudar
  useEffect(() => {
    if (supplier && isOpen) {
      reset({
        name: supplier.name,
        cnpj: supplier.cnpj || '',
        fantasyName: supplier.fantasyName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        number: supplier.number || '',
        complement: supplier.complement || '',
        district: supplier.district || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zipCode: supplier.zipCode || '',
      });
    } else if (isOpen && !supplier) {
      reset({
        name: '',
        cnpj: '',
        fantasyName: '',
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
  }, [supplier, isOpen, reset]);

  const handleSave = async (data: CreateSupplierData) => {
    const success = await onSave(data);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    setCnpjError('');
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
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Building className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">
                      {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                        placeholder="Nome do fornecedor"
                        className={errors.name ? 'border-red-500 bg-red-50' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <div className="relative">
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          className={cnpjError ? 'border-red-500 bg-red-50' : ''}
                          value={watchedCnpj}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/[^\d]/g, '');
                            let formattedValue = '';
                            
                            if (cleanValue.length <= 2) formattedValue = cleanValue;
                            else if (cleanValue.length <= 5) formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
                            else if (cleanValue.length <= 8) formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
                            else if (cleanValue.length <= 12) formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
                            else formattedValue = `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
                            
                            setValue('cnpj', formattedValue);
                            
                            // Validar CNPJ
                            if (cleanValue.length === 14) {
                              setCnpjError('');
                            } else if (cleanValue.length > 0) {
                              setCnpjError('CNPJ deve ter 14 dígitos');
                            } else {
                              setCnpjError('');
                            }
                          }}
                          onBlur={(e) => {
                            const cnpj = e.target.value;
                            if (cnpj) {
                              handleCNPJSearch(cnpj);
                            }
                          }}
                        />
                        {isSearchingCNPJ && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      {cnpjError && (
                        <p className="text-sm text-red-600">{cnpjError}</p>
                      )}
                      {errors.cnpj && (
                        <p className="text-sm text-red-600">{errors.cnpj.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fantasyName">Nome Fantasia</Label>
                      <Input
                        id="fantasyName"
                        {...register('fantasyName')}
                        placeholder="Nome fantasia da empresa"
                      />
                      {errors.fantasyName && (
                        <p className="text-sm text-red-600">{errors.fantasyName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="fornecedor@email.com"
                        className={errors.email ? 'border-red-500 bg-red-50' : ''}
                        onChange={(e) => {
                          e.target.value = e.target.value.toLowerCase();
                        }}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                          placeholder="Sala, Andar, etc."
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
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
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
                          {supplier ? 'Atualizar' : 'Salvar'}
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
