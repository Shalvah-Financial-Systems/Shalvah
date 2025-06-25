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
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFormData } from '@/types';

const transactionSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  value: z.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
});

function FormularioTransacao() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
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
    resolver: zodResolver(transactionSchema),    defaultValues: {
      type: 'entrada',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
      style={{
        maxWidth: '42rem',
        margin: '0 auto'
      }}
    >
      <div 
        className="mb-6"
        style={{
          marginBottom: '1.5rem'
        }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }} />
          Voltar
        </Button>
        
        <h1 
          className="text-3xl font-bold text-gray-900"
          style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.25rem'
          }}
        >
          Nova Transação
        </h1>
        <p 
          className="text-gray-600 mt-1"
          style={{
            color: '#6b7280',
            marginTop: '0.25rem'
          }}
        >
          Adicione uma nova receita ou despesa
        </p>
      </div>

      <Card
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}
      >        <CardHeader
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <CardTitle
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827'
            }}
          >
            Detalhes da Transação
          </CardTitle>
        </CardHeader>
        <CardContent
          style={{
            padding: '1.5rem'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">            {/* Tipo de Transação */}
            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <Select
                onValueChange={(value: string) => setValue('type', value as 'entrada' | 'saida')}
                defaultValue="entrada"
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
            </div>            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                onValueChange={(value: string) => setValue('categoryId', value)}
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
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>              <Button
                type="submit"
                className={`flex-1 ${
                  transactionType === 'entrada'
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
      </Card>    </motion.div>
  );
}

export default FormularioTransacao;
