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
import { Select } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { RegisterData } from '@/types';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  type: z.enum(['ADMIN', 'ENTERPRISE'], { required_error: 'Tipo de usuário é obrigatório' }),
  cnpj: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
}).refine((data) => {
  if (data.type === 'ENTERPRISE' && !data.cnpj) {
    return false;
  }
  return true;
}, {
  message: 'CNPJ é obrigatório para usuários do tipo ENTERPRISE',
  path: ['cnpj'],
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

// Função para formatar telefone
const formatPhone = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

// Função para formatar CEP
const formatZipCode = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      type: 'ENTERPRISE',
    },
  });

  const userType = watch('type');
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Limpar máscaras antes de enviar
      const cleanData = {
        ...data,
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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
        style={{
          width: '100%',
          maxWidth: '42rem'
        }}
      >
        <Card 
          className="shadow-xl"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Criar Conta
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Preencha os dados para criar sua conta
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email e Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Tipo de Usuário */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Usuário *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ENTERPRISE">Empresa</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              {/* Campos específicos para ENTERPRISE */}
              {userType === 'ENTERPRISE' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    <div className="space-y-2">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        placeholder="Empresa Exemplo"
                        {...register('name')}
                      />
                    </div>                    <div className="space-y-2">
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

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          placeholder="Cidade Exemplo"
                          {...register('city')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          placeholder="SP"
                          {...register('state')}
                        />
                      </div>                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          placeholder="12345-678"
                          {...register('zipCode')}
                          onChange={(e) => {
                            e.target.value = formatZipCode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Nome para ADMIN */}
              {userType === 'ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    {...register('name')}
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold transition-colors"
                style={{
                  width: '100%',
                  backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  borderRadius: '0.375rem',
                  transition: 'background-color 0.2s'
                }}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 font-semibold"
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
