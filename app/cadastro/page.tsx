'use client';

import { useState, useEffect } from 'react';
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
import { useCEPSearch } from '@/hooks/useCEPSearch';
import { useCNPJSearch } from '@/hooks/useCNPJSearch';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  inscricaoEstadual: z.string().optional(),
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().optional(),
  zipCode: z.string().min(1, 'CEP é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  district: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
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
  const [companyNameFromCNPJ, setCompanyNameFromCNPJ] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Hooks para busca de CEP e CNPJ
  const { isSearchingCEP, handleCEPSearch } = useCEPSearch({ setValue });
  const { isSearchingCNPJ, handleCNPJSearch, resetSearch } = useCNPJSearch({ setValue });

  // Monitorar quando a busca de CNPJ é concluída
  useEffect(() => {
    if (!isSearchingCNPJ && !companyNameFromCNPJ) {
      // Pode ter concluído uma busca, verificar se preencheu o nome
      const checkName = setTimeout(() => {
        const nameElement = document.getElementById('name') as HTMLInputElement;
        if (nameElement && nameElement.value) {
          setCompanyNameFromCNPJ(true);
        }
      }, 100);
      
      return () => clearTimeout(checkName);
    }
  }, [isSearchingCNPJ, companyNameFromCNPJ]);

  // Função para resetar estados quando CNPJ é modificado
  const handleCNPJReset = () => {
    resetSearch();
    setCompanyNameFromCNPJ(false);
  };
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Limpar máscaras antes de enviar e adicionar tipo ENTERPRISE
      const { confirmPassword, ...submitData } = data;
      const cleanData = {
        ...submitData,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Container scrollável com scroll suave e otimizado */}
      <div 
        className="h-screen overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch', // Para iOS
        }}
      >
        <div className="min-h-full flex items-center justify-center p-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl my-2 sm:my-4"
          >
            <Card className="shadow-xl border-0 bg-white rounded-lg">
              <CardHeader className="text-center py-4 px-4 sm:py-6 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                  Cadastro
                </CardTitle>
                <p className="text-gray-600 text-sm sm:text-base">
                  Preencha os dados da sua empresa para criar sua conta
                </p>
              </CardHeader>
              
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Seção: Dados de Acesso */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Dados de Acesso
                  </h3>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          {...register('password')}
                          className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          {...register('confirmPassword')}
                          className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção: Dados da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Dados da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">
                        CNPJ * {isSearchingCNPJ && <span className="text-blue-500 text-xs">(Buscando...)</span>}
                      </Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        {...register('cnpj')}
                        className={errors.cnpj ? 'border-red-500' : ''}
                        onChange={(e) => {
                          const formattedValue = formatCNPJ(e.target.value);
                          e.target.value = formattedValue;
                          setValue('cnpj', formattedValue); // Atualizar o valor no formulário
                          
                          // Resetar busca anterior se o campo foi modificado
                          const cleanCNPJ = formattedValue.replace(/[^\d]/g, '');
                          
                          // Se o campo foi limpo ou tem menos de 14 dígitos, resetar
                          if (cleanCNPJ.length < 14) {
                            handleCNPJReset();
                          }
                          
                          // Se o campo foi completamente limpo, limpar campos relacionados
                          if (cleanCNPJ.length === 0) {
                            setValue('name', '');
                            setValue('phone', '');
                          }
                          
                          // Buscar automaticamente quando CNPJ estiver completo
                          if (cleanCNPJ.length === 14) {
                            handleCNPJSearch(cleanCNPJ);
                          }
                        }}
                        disabled={isSearchingCNPJ}
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
                      <Label htmlFor="name">
                        Nome da Empresa * 
                        {isSearchingCNPJ && <span className="text-blue-500 text-xs">(Buscando...)</span>}
                        {companyNameFromCNPJ && <span className="text-green-600 text-xs">(Dados oficiais - CNPJ)</span>}
                      </Label>
                      <Input
                        id="name"
                        placeholder="Empresa Exemplo Ltda"
                        {...register('name')}
                        className={`${errors.name ? 'border-red-500' : ''} ${
                          isSearchingCNPJ ? 'bg-blue-50' : ''
                        } ${
                          companyNameFromCNPJ ? 'bg-green-50 border-green-200' : ''
                        }`}
                        disabled={isSearchingCNPJ || companyNameFromCNPJ}
                        readOnly={companyNameFromCNPJ}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Telefone {isSearchingCNPJ && <span className="text-blue-500 text-xs">(Preenchido automaticamente)</span>}
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        {...register('phone')}
                        className={isSearchingCNPJ ? 'bg-blue-50' : ''}
                        onChange={(e) => {
                          const formattedValue = formatPhone(e.target.value);
                          e.target.value = formattedValue;
                          setValue('phone', formattedValue);
                        }}
                        disabled={isSearchingCNPJ}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Endereço
                  </h3>
                  
                  {/* Primeira linha: CEP, Rua e Número */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">
                        CEP * {isSearchingCEP && <span className="text-blue-500 text-xs">(Buscando...)</span>}
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="12345-678"
                        {...register('zipCode')}
                        className={errors.zipCode ? 'border-red-500' : ''}
                        onChange={(e) => {
                          const formattedValue = formatCEP(e.target.value);
                          e.target.value = formattedValue;
                          setValue('zipCode', formattedValue);
                          
                          // Buscar automaticamente quando CEP estiver completo
                          const cleanCEP = formattedValue.replace(/[^\d]/g, '');
                          if (cleanCEP.length === 8) {
                            handleCEPSearch(formattedValue);
                          }
                        }}
                        disabled={isSearchingCEP}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">
                        Rua * {isSearchingCEP && <span className="text-green-500 text-xs">(Preenchido automaticamente)</span>}
                      </Label>
                      <Input
                        id="address"
                        placeholder="Rua Exemplo"
                        {...register('address')}
                        className={`${errors.address ? 'border-red-500' : ''} ${isSearchingCEP ? 'bg-green-50' : ''}`}
                        disabled={isSearchingCEP}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        placeholder="123"
                        {...register('number')}
                        className={errors.number ? 'border-red-500' : ''}
                        onChange={(e) => {
                          const formattedValue = formatNumber(e.target.value);
                          e.target.value = formattedValue;
                          setValue('number', formattedValue);
                        }}
                      />
                      {errors.number && (
                        <p className="text-sm text-red-500">{errors.number.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Segunda linha: Complemento e Bairro */}
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
                      <Label htmlFor="district">
                        Bairro * {isSearchingCEP && <span className="text-green-500 text-xs">(Preenchido automaticamente)</span>}
                      </Label>
                      <Input
                        id="district"
                        placeholder="Centro"
                        {...register('district')}
                        className={`${errors.district ? 'border-red-500' : ''} ${isSearchingCEP ? 'bg-green-50' : ''}`}
                        onChange={(e) => {
                          const formattedValue = formatLettersOnly(e.target.value);
                          e.target.value = formattedValue;
                          setValue('district', formattedValue);
                        }}
                        disabled={isSearchingCEP}
                      />
                      {errors.district && (
                        <p className="text-sm text-red-500">{errors.district.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Terceira linha: Cidade e Estado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Cidade * {isSearchingCEP && <span className="text-green-500 text-xs">(Preenchido automaticamente)</span>}
                      </Label>
                      <Input
                        id="city"
                        placeholder="Cidade Exemplo"
                        {...register('city')}
                        className={`${errors.city ? 'border-red-500' : ''} ${isSearchingCEP ? 'bg-green-50' : ''}`}
                        onChange={(e) => {
                          const formattedValue = formatLettersOnly(e.target.value);
                          e.target.value = formattedValue;
                          setValue('city', formattedValue);
                        }}
                        disabled={isSearchingCEP}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">
                        Estado * {isSearchingCEP && <span className="text-green-500 text-xs">(Preenchido automaticamente)</span>}
                      </Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        {...register('state')}
                        className={`${errors.state ? 'border-red-500' : ''} ${isSearchingCEP ? 'bg-green-50' : ''}`}
                        maxLength={2}
                        onChange={(e) => {
                          const formattedValue = formatState(e.target.value);
                          e.target.value = formattedValue;
                          setValue('state', formattedValue);
                        }}
                        disabled={isSearchingCEP}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Cadastro */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold transition-colors rounded-lg"
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>

              <div className="text-center pt-4 border-t mt-6">
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
      </div>
    </div>
  );
}
