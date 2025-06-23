'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MEIConfig } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Calculator, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const meiConfigSchema = z.object({
  monthlyRevenue: z.number().min(0, 'Faturamento deve ser positivo'),
});

type MEIConfigFormData = z.infer<typeof meiConfigSchema>;

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [meiConfig, setMeiConfig] = useState<MEIConfig>({
    monthlyRevenue: 0,
    dasValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MEIConfigFormData>({
    resolver: zodResolver(meiConfigSchema),
  });

  const monthlyRevenue = watch('monthlyRevenue');  const loadMEIConfig = useCallback(async () => {
    try {
      const response = await api.get('/mei-config');
      const config = response.data;
      setMeiConfig(config);
      setValue('monthlyRevenue', config.monthlyRevenue);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    // O middleware já protege a rota
    loadMEIConfig();
  }, [loadMEIConfig]);

  useEffect(() => {
    if (monthlyRevenue) {
      const dasValue = calculateDAS(monthlyRevenue);
      setMeiConfig(prev => ({ ...prev, dasValue }));
    }
  }, [monthlyRevenue]);

  const calculateDAS = (revenue: number): number => {
    // Cálculo simplificado do DAS para MEI
    // Em 2024, o valor fixo do DAS MEI é em torno de R$ 66,60
    // Mas pode variar dependendo da atividade
    const baseDAS = 66.60;
    
    // Se exceder o limite anual de R$ 81.000 (R$ 6.750/mês), 
    // deve considerar desenquadramento
    const monthlyLimit = 6750;
    
    if (revenue > monthlyLimit) {
      return baseDAS * 1.5; // Simulação de acréscimo por excesso
    }
    
    return baseDAS;
  };

  const onSubmit = async (data: MEIConfigFormData) => {
    setIsSaving(true);
    try {
      await api.put('/mei-config', data);
      toast.success('Configurações salvas com sucesso!');
      setMeiConfig(prev => ({ ...prev, monthlyRevenue: data.monthlyRevenue }));    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar configurações';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>        </div>
      </div>
    );
  }

  return (
    <Sidebar>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
        style={{
          maxWidth: '56rem',
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Configure suas informações de MEI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Configuração */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações MEI</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Faturamento Mensal Estimado</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                      <Input
                        id="monthlyRevenue"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-10"
                        {...register('monthlyRevenue', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.monthlyRevenue && (
                      <p className="text-sm text-red-600">{errors.monthlyRevenue.message}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Limite anual MEI: R$ 81.000,00 (R$ 6.750,00/mês)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cálculo do DAS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Cálculo do DAS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      Valor estimado do DAS mensal:
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(meiConfig.dasValue)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Faturamento informado:</strong> {' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(monthlyRevenue || 0)}
                    </p>
                    
                    {monthlyRevenue > 6750 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">
                          ⚠️ Atenção: Faturamento acima do limite mensal MEI
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Considere o desenquadramento para Microempresa
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      * Cálculo estimado. Consulte um contador para valores exatos.
                    </p>
                  </div>
                </div>              </CardContent>
            </Card>
          </div>
        </motion.div>
    </Sidebar>
  );
}
