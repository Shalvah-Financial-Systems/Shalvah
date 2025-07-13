'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { RegisterData } from '@/types';
import { formatPhone, formatNumber, formatLettersOnly, formatState, formatCEP } from '@/lib/masks';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  inscricaoEstadual: z.string().optional(),
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 letras').optional().or(z.literal('')),
  zipCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Função para formatar CNPJ
const formatCNPJ = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Limpar máscaras antes de enviar e adicionar tipo ENTERPRISE
      const cleanData = {
        ...data,
        type: 'ENTERPRISE' as const,
        cnpj: data.cnpj?.replace(/\D/g, ''),
        phone: data.phone?.replace(/\D/g, ''),
        zipCode: data.zipCode?.replace(/\D/g, ''),
      };

      const response = await api.post('/auth/register', cleanData);
      toast.success('Cadastro realizado com sucesso!');
      router.push('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const message = error.response?.data?.message || 'Erro ao realizar cadastro';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4 flex justify-center overflow-y-auto"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
        padding: '1rem',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
        style={{
          width: '100%',
          maxWidth: '64rem'
        }}
      >
        <Card 
          className="shadow-lg border-0"
          style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minHeight: 'auto',
            padding: '0'
          }}
        >
          <CardHeader className="text-center py-8 px-8">
            <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
              Cadastro Empresarial
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Preencha os dados da sua empresa para criar sua conta
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção: Dados de Acesso */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Dados de Acesso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="empresa@email.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      {...register('password')}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Dados da Empresa */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      {...register('cnpj')}
                      className={errors.cnpj ? 'border-red-500' : ''}
                      onChange={(e) => {
                        e.target.value = formatCNPJ(e.target.value);
                      }}
                    />
                    {errors.cnpj && (
                      <p className="text-sm text-red-500">{errors.cnpj.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricaoEstadual"
                      placeholder="123456789"
                      {...register('inscricaoEstadual')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      placeholder="Empresa Exemplo Ltda"
                      {...register('name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      {...register('phone')}
                      onChange={(e) => {
                        e.target.value = formatPhone(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Endereço */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Endereço (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Rua</Label>
                    <Input
                      id="address"
                      placeholder="Rua Exemplo"
                      {...register('address')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      placeholder="123"
                      {...register('number')}
                      onChange={(e) => {
                        e.target.value = formatNumber(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      placeholder="Apto 101"
                      {...register('complement')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Bairro</Label>
                    <Input
                      id="district"
                      placeholder="Centro"
                      {...register('district')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      {...register('city')}
                      onChange={(e) => {
                        e.target.value = formatLettersOnly(e.target.value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      placeholder="SP"
                      {...register('state')}
                      maxLength={2}
                      onChange={(e) => {
                        e.target.value = formatState(e.target.value);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345-678"
                      {...register('zipCode')}
                      onChange={(e) => {
                        e.target.value = formatCEP(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Cadastro */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold transition-colors rounded-lg"
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </div>
            </form>

            {/* Link para Login */}
            <div className="text-center pt-6 border-t mt-8">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
