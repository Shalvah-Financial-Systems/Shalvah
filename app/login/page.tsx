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
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Building2 } from 'lucide-react';
import Link from 'next/link';

// Função para validar CNPJ
const isValidCNPJ = (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // CNPJ deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação básica dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const sum1 = cleanCNPJ.slice(0, 12).split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * weights1[index];
  }, 0);
  
  const digit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);
  
  const sum2 = cleanCNPJ.slice(0, 13).split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * weights2[index];
  }, 0);
  
  const digit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);
  
  return digit1 === parseInt(cleanCNPJ[12]) && digit2 === parseInt(cleanCNPJ[13]);
};

// Função para validar email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'E-mail ou CNPJ é obrigatório')
    .refine((value) => {
      const type = detectInputType(value);
      if (type === 'email') {
        return isValidEmail(value);
      } else {
        return isValidCNPJ(value);
      }
    }, {
      message: 'E-mail ou CNPJ inválido'
    }),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Função para aplicar máscara de CNPJ
const applyCNPJMask = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/^(\d{2})(\d)/, '$1.$2') // Adiciona ponto após 2 dígitos
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Adiciona ponto após 3 dígitos
    .replace(/\.(\d{3})(\d)/, '.$1/$2') // Adiciona barra após 3 dígitos
    .replace(/(\d{4})(\d)/, '$1-$2') // Adiciona traço após 4 dígitos
    .substring(0, 18); // Limita a 18 caracteres (XX.XXX.XXX/XXXX-XX)
};

// Função para detectar se é email ou CNPJ
const detectInputType = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  
  // Se contém @ é definitivamente email
  if (value.includes('@')) {
    return 'email';
  }
  
  // Se contém apenas letras (sem números), provavelmente é email
  if (!/\d/.test(value) && value.length > 0) {
    return 'email';
  }
  
  // Se tem 3 ou mais dígitos consecutivos, provavelmente é CNPJ
  if (cleanValue.length >= 3) {
    return 'cnpj';
  }
  
  // Se tem pontos, barras ou traços (formatação de CNPJ), é CNPJ
  if (/[.\-/]/.test(value)) {
    return 'cnpj';
  }
  
  // Padrão: email para valores pequenos, CNPJ para números
  return cleanValue.length >= 2 ? 'cnpj' : 'email';
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [identifierValue, setIdentifierValue] = useState('');
  const [inputType, setInputType] = useState<'email' | 'cnpj'>('email');
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Função para lidar com mudanças no input
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newType = detectInputType(value);
    
    let formattedValue = value;
    
    // Se mudou o tipo de input, permitir a transição
    if (newType !== inputType) {
      // Se mudou de CNPJ para email, remover formatação
      if (inputType === 'cnpj' && newType === 'email') {
        formattedValue = value.replace(/[.\-/]/g, '');
      }
      setInputType(newType);
    }
    
    // Aplicar máscara apenas se for CNPJ
    if (newType === 'cnpj') {
      formattedValue = applyCNPJMask(formattedValue);
    }
    
    setIdentifierValue(formattedValue);
    setValue('identifier', formattedValue);
  };
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Garantir que enviamos o valor atual do input
    const submitData = {
      ...data,
      identifier: identifierValue
    };
    
    const success = await login(submitData);
    if (success) {
      // Pequeno delay para garantir que o cookie seja definido
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    }
    setIsLoading(false);
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
        className="w-full max-w-md"
        style={{
          width: '100%',
          maxWidth: '28rem'
        }}
      >
        <Card 
          className="shadow-xl"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '0'
          }}
        >          <CardHeader 
            className="text-center"
            style={{
              textAlign: 'center',
              padding: '1.5rem'
            }}
          >
            <CardTitle 
              className="text-3xl font-bold text-blue-600"
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#2563eb',
                marginBottom: '0.5rem'
              }}
            >
              Shalvah
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Faça login para acessar sua conta
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  <div className="flex items-center gap-2">
                    {inputType === 'email' ? (
                      <Mail className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Building2 className="h-4 w-4 text-green-500" />
                    )}
                    E-mail ou CNPJ
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inputType === 'email' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {inputType === 'email' ? 'E-mail' : 'CNPJ'}
                    </span>
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={
                      inputType === 'email' 
                        ? "Digite seu e-mail" 
                        : "XX.XXX.XXX/XXXX-XX"
                    }
                    value={identifierValue}
                    onChange={handleIdentifierChange}
                    className="w-full pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {inputType === 'email' ? (
                      <Mail className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Building2 className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {errors.identifier && (
                  <p className="text-sm text-red-600">{errors.identifier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...register('password')}
                  className="w-full"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Esqueceu sua senha?
              </a>
            </div>            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?
                <Link href="/cadastro" className="ml-1 text-blue-600 hover:text-blue-800 hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
