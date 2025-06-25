'use client';

import { useState, useEffect } from 'react';
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
import { Transaction, UpdateTransactionData } from '@/types';
import { X, Edit, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';

const editTransactionSchema = z.object({
  type: z.enum(['entrada', 'saida']).optional(),
  value: z.number().min(0.01, 'Valor deve ser maior que zero').optional(),
  date: z.string().min(1, 'Data é obrigatória').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória').optional(),
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
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateTransactionData>({
    resolver: zodResolver(editTransactionSchema),
  });

  const transactionType = watch('type');

  // Preencher formulário quando a transação mudar
  useEffect(() => {
    if (transaction && isOpen) {
      // Formatar a data corretamente para o input date
      const formattedDate = transaction.date.includes('T') 
        ? transaction.date.split('T')[0] 
        : transaction.date.split(' ')[0] || transaction.date;
        
      reset({
        type: transaction.type,
        value: transaction.value,
        date: formattedDate,
        description: transaction.description,
        categoryId: transaction.categoryId,
      });
    }
  }, [transaction, isOpen, reset]);

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
                      onValueChange={(value: string) => setValue('type', value as 'entrada' | 'saida')}
                      value={transactionType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Receita</SelectItem>
                        <SelectItem value="saida">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-10"
                        {...register('value', { valueAsNumber: true })}
                      />
                    </div>
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
                      value={watch('categoryId')}
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
                        transactionType === 'entrada'
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
