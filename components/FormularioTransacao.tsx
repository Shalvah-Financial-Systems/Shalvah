'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useClients } from '@/hooks/useClients';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProductsServices } from '@/hooks/useProductsServices';
import { TransactionFormData } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'COST']),
  classification: z.enum(['EXPENSE', 'COST']).optional(),
  typeExpense: z.enum(['FIXED', 'VARIABLE']).optional(),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  productServiceId: z.string().optional(),
  clientId: z.string().optional(),
  supplierId: z.string().optional(),
});

function FormularioTransacao() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  const { clients, loading: clientsLoading } = useClients();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { productsServices, loading: productsServicesLoading } = useProductsServices();
  const { createTransaction } = useTransactions();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const transactionType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const success = await createTransaction(data);
      if (success) {
        reset();
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Erro no formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-full px-6"
        >
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Nova Transação
            </h1>
            <p className="text-gray-600 mt-1">
              Adicione uma nova receita ou despesa
            </p>
          </div>

          <Card className="bg-white rounded-lg shadow-lg border border-gray-200">
            <CardHeader className="p-6 border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Detalhes da Transação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Grid responsivo para campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {/* Tipo de Transação */}
                  <div className="space-y-2">
                    <Label>Tipo de Transação</Label>
                    <Select
                      onValueChange={(value: string) => setValue('type', value as 'INCOME' | 'COST')}
                      defaultValue="INCOME"
                    >
                      <SelectTrigger className="h-11 w-full">
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

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <CurrencyInput
                      value={watch('value') || 0}
                      onChange={(value) => setValue('value', value)}
                      className="h-11 w-full"
                      showCurrencySymbol={true}
                    />
                    {errors.value && (
                      <p className="text-sm text-red-600">{errors.value.message}</p>
                    )}
                  </div>

                  {/* Data */}
                  <div className="space-y-2 md:col-span-2 xl:col-span-1">
                    <Label htmlFor="date">Data</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        className="h-11 w-full pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:transform [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                        {...register('date')}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                {/* Campos condicionais para COST */}
                {transactionType === 'COST' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Classificação (apenas para COST) */}
                    <div className="space-y-2">
                      <Label>Classificação</Label>
                      <Select
                        onValueChange={(value: string) => setValue('classification', value as 'EXPENSE' | 'COST')}
                        value={watch('classification')}
                      >
                        <SelectTrigger className="h-11 w-full">
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

                    {/* Tipo de Despesa (apenas para COST) */}
                    <div className="space-y-2">
                      <Label>Tipo de Despesa</Label>
                      <Select
                        onValueChange={(value: string) => setValue('typeExpense', value as 'FIXED' | 'VARIABLE')}
                        value={watch('typeExpense')}
                      >
                        <SelectTrigger className="h-11 w-full">
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
                  </div>
                )}

                {/* Segunda linha de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <SearchableSelect
                      options={categories.map((category: any) => ({
                        value: category.id.toString(),
                        label: category.name
                      }))}
                      value={watch('categoryId') || ''}
                      onValueChange={(value) => setValue('categoryId', value)}
                      placeholder={
                        categoriesLoading 
                          ? "Carregando categorias..." 
                          : categories.length > 0 
                            ? "Selecione uma categoria"
                            : "Nenhuma categoria encontrada"
                      }
                      searchPlaceholder="Buscar categoria..."
                      emptyText="Nenhuma categoria encontrada"
                      disabled={categoriesLoading}
                      className="w-full"
                    />
                    {errors.categoryId && (
                      <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      placeholder="Descreva a transação"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      rows={3}
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Cliente (apenas para receitas) */}
                {transactionType === 'INCOME' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label>Cliente (opcional)</Label>
                      <SearchableSelect
                        options={[
                          { value: 'none', label: 'Nenhum cliente' },
                          ...clients.map((client) => ({
                            value: client.id,
                            label: client.name
                          }))
                        ]}
                        value={watch('clientId') || 'none'}
                        onValueChange={(value) => setValue('clientId', value === 'none' ? '' : value)}
                        placeholder={
                          clientsLoading 
                            ? "Carregando clientes..." 
                            : "Selecione um cliente (opcional)"
                        }
                        searchPlaceholder="Buscar cliente..."
                        emptyText="Nenhum cliente encontrado"
                        disabled={clientsLoading}
                        className="w-full"
                      />
                      {errors.clientId && (
                        <p className="text-sm text-red-600">{errors.clientId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Produto/Serviço (opcional)</Label>
                      <SearchableSelect
                        options={[
                          { value: 'none', label: 'Nenhum produto/serviço' },
                          ...productsServices.map((item) => ({
                            value: item.id,
                            label: `${item.name} - R$ ${item.price.toFixed(2)} (${item.type === 'PRODUCT' ? 'Produto' : 'Serviço'})`
                          }))
                        ]}
                        value={watch('productServiceId') || 'none'}
                        onValueChange={(value) => setValue('productServiceId', value === 'none' ? '' : value)}
                        placeholder={
                          productsServicesLoading 
                            ? "Carregando produtos/serviços..." 
                            : "Selecione um produto/serviço (opcional)"
                        }
                        searchPlaceholder="Buscar produto/serviço..."
                        emptyText="Nenhum produto/serviço encontrado"
                        disabled={productsServicesLoading}
                        className="w-full"
                      />
                      {errors.productServiceId && (
                        <p className="text-sm text-red-600">{errors.productServiceId.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Fornecedor (apenas para custos/despesas) */}
                {transactionType === 'COST' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label>Fornecedor (opcional)</Label>
                      <SearchableSelect
                        options={[
                          { value: 'none', label: 'Nenhum fornecedor' },
                          ...suppliers.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.name
                          }))
                        ]}
                        value={watch('supplierId') || 'none'}
                        onValueChange={(value) => setValue('supplierId', value === 'none' ? '' : value)}
                        placeholder={
                          suppliersLoading 
                            ? "Carregando fornecedores..." 
                            : "Selecione um fornecedor (opcional)"
                        }
                        searchPlaceholder="Buscar fornecedor..."
                        emptyText="Nenhum fornecedor encontrado"
                        disabled={suppliersLoading}
                        className="w-full"
                      />
                      {errors.supplierId && (
                        <p className="text-sm text-red-600">{errors.supplierId.message}</p>
                      )}
                    </div>
                    
                    {/* Campo vazio para balancear o grid */}
                    <div></div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-11 w-full"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className={`flex-1 h-11 w-full ${
                      transactionType === 'INCOME'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Transação'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default FormularioTransacao;
