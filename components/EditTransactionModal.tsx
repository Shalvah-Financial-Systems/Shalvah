'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, UpdateTransactionData } from '@/types';
import { X, Edit, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useClients } from '@/hooks/useClients';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProductsServices } from '@/hooks/useProductsServices';
import { toast } from 'sonner';

const editTransactionSchema = z.object({
  type: z.enum(['INCOME', 'COST']).optional(),
  classification: z.enum(['EXPENSE', 'COST']).optional(),
  typeExpense: z.enum(['FIXED', 'VARIABLE']).optional(),
  value: z.number().min(0.01, 'Valor deve ser maior que zero').optional(),
  date: z.string().min(1, 'Data é obrigatória').optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória').optional(),
  productServiceId: z.string().optional(),
  clientId: z.string().optional(),
  supplierId: z.string().optional(),
});

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateTransactionData) => Promise<boolean>;
  transaction: Transaction | null;
  isUpdating: boolean;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  isUpdating
}: EditTransactionModalProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { clients, loading: clientsLoading } = useClients();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { productsServices, loading: productsServicesLoading } = useProductsServices();
  
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateTransactionData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      type: undefined,
      classification: undefined,
      typeExpense: undefined,
      value: 0,
      date: '',
      description: '',
      categoryId: '',
      productServiceId: '',
      clientId: '',
      supplierId: '',
    }
  });

  const transactionType = watch('type');
  
  // Valores específicos para os selects com fallback
  const currentType = isFormLoaded ? (watch('type') || '') : '';
  const currentClassification = isFormLoaded ? (watch('classification') || '') : '';
  const currentTypeExpense = isFormLoaded ? (watch('typeExpense') || '') : '';
  const currentCategoryId = isFormLoaded ? (watch('categoryId') || '') : '';
  const currentClientId = isFormLoaded ? (watch('clientId') || '') : '';
  const currentSupplierId = isFormLoaded ? (watch('supplierId') || '') : '';
  const currentProductServiceId = isFormLoaded ? (watch('productServiceId') || '') : '';

  // Preencher formulário quando a transação mudar
  useEffect(() => {
    if (transaction && isOpen) {
      setIsFormLoaded(false);
      
      // Pequeno delay para garantir que o modal esteja completamente renderizado
      setTimeout(() => {
        // Formatar a data corretamente para o input date
        const formattedDate = transaction.date.includes('T') 
          ? transaction.date.split('T')[0] 
          : transaction.date.split(' ')[0] || transaction.date;
          
        const formData = {
          type: transaction.type,
          classification: transaction.classification,
          typeExpense: transaction.typeExpense,
          value: transaction.value,
          date: formattedDate,
          description: transaction.description,
          categoryId: transaction.categoryId ? transaction.categoryId.toString() : '',
          productServiceId: transaction.productServiceId ? transaction.productServiceId.toString() : '',
          clientId: transaction.clientId ? transaction.clientId.toString() : '',
          supplierId: transaction.supplierId ? transaction.supplierId.toString() : '',
        };
        
        // Reset com os dados formatados
        reset(formData);
        
        // Garantir que os valores sejam definidos individualmente também
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            setValue(key as keyof typeof formData, value);
          }
        });
        
        setIsFormLoaded(true);
      }, 100);
    }
  }, [transaction, isOpen, reset, setValue]);

  // Limpar formulário quando modal for fechado
  useEffect(() => {
    if (!isOpen) {
      setIsFormLoaded(false);
      reset({
        type: undefined,
        classification: undefined,
        typeExpense: undefined,
        value: undefined,
        date: '',
        description: '',
        categoryId: '',
        productServiceId: '',
        clientId: '',
        supplierId: '',
      });
    }
  }, [isOpen, reset]);

  const handleSave = async (data: UpdateTransactionData) => {
    const success = await onSave(data);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!transaction) return null;

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
            className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Edit className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Editar Transação</CardTitle>
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
                  {/* Tipo de Transação */}
                  <div className="space-y-2">
                    <Label>Tipo de Transação</Label>
                    <Select
                      onValueChange={(value: string) => setValue('type', value as 'INCOME' | 'COST')}
                      value={currentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="COST">Custo/Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Classificação (apenas para COST) */}
                  {transactionType === 'COST' && (
                    <div className="space-y-2">
                      <Label>Classificação</Label>
                      <Select
                        onValueChange={(value: string) => setValue('classification', value as 'EXPENSE' | 'COST')}
                        value={currentClassification}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Despesa</SelectItem>
                          <SelectItem value="COST">Custo</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.classification && (
                        <p className="text-sm text-red-600">{errors.classification.message}</p>
                      )}
                    </div>
                  )}

                  {/* Tipo de Despesa (apenas para COST) */}
                  {transactionType === 'COST' && (
                    <div className="space-y-2">
                      <Label>Tipo de Despesa</Label>
                      <Select
                        onValueChange={(value: string) => setValue('typeExpense', value as 'FIXED' | 'VARIABLE')}
                        value={currentTypeExpense}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">Fixa</SelectItem>
                          <SelectItem value="VARIABLE">Variável</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.typeExpense && (
                        <p className="text-sm text-red-600">{errors.typeExpense.message}</p>
                      )}
                    </div>
                  )}

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <CurrencyInput
                      value={watch('value') || 0}
                      onChange={(value) => setValue('value', value)}
                      showCurrencySymbol={true}
                    />
                    {errors.value && (
                      <p className="text-sm text-red-600">{errors.value.message}</p>
                    )}
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date')}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      onValueChange={(value: string) => setValue('categoryId', value)}
                      value={currentCategoryId}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            categoriesLoading 
                              ? "Carregando categorias..." 
                              : categories.length > 0 
                                ? "Selecione uma categoria"
                                : "Nenhuma categoria encontrada"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Cliente (apenas para receitas) */}
                  {transactionType === 'INCOME' && (
                    <div className="space-y-2">
                      <Label>Cliente (opcional)</Label>
                      <Select 
                        onValueChange={(value: string) => setValue('clientId', value === 'none' ? '' : value)}
                        value={watch('clientId') || 'none'}
                        disabled={clientsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              clientsLoading 
                                ? "Carregando clientes..." 
                                : "Selecione um cliente (opcional)"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum cliente</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.clientId && (
                        <p className="text-sm text-red-600">{errors.clientId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Fornecedor (apenas para custos/despesas) */}
                  {transactionType === 'COST' && (
                    <div className="space-y-2">
                      <Label>Fornecedor (opcional)</Label>
                      <Select 
                        onValueChange={(value: string) => setValue('supplierId', value === 'none' ? '' : value)}
                        value={watch('supplierId') || 'none'}
                        disabled={suppliersLoading}
                      >
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              suppliersLoading 
                                ? "Carregando fornecedores..." 
                                : "Selecione um fornecedor (opcional)"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum fornecedor</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.supplierId && (
                        <p className="text-sm text-red-600">{errors.supplierId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Produto/Serviço (apenas para receitas) */}
                  {transactionType === 'INCOME' && (
                    <div className="space-y-2">
                      <Label>Produto/Serviço (opcional)</Label>
                      <Select 
                        onValueChange={(value: string) => setValue('productServiceId', value === 'none' ? '' : value)}
                        value={watch('productServiceId') || 'none'}
                        disabled={productsServicesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              productsServicesLoading 
                                ? "Carregando produtos/serviços..." 
                                : "Selecione um produto/serviço (opcional)"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum produto/serviço</SelectItem>
                          {productsServices.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - R$ {item.price.toFixed(2)} ({item.type === 'PRODUCT' ? 'Produto' : 'Serviço'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.productServiceId && (
                        <p className="text-sm text-red-600">{errors.productServiceId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      type="text"
                      placeholder="Descreva a transação"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
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
                      className={`flex-1 ${
                        transactionType === 'INCOME'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
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
                          Salvar
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
