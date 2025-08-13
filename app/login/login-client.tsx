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
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Building2 } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types';

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
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (parseInt(cleanCNPJ[12]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return parseInt(cleanCNPJ[13]) === digit2;
};

// Função para validar email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email ou CNPJ é obrigatório')
    .refine((value) => {
      // Remove espaços e caracteres especiais do CNPJ para validação
      const cleanValue = value.replace(/\D/g, '');
      
      // Se tem 14 dígitos, é CNPJ
      if (cleanValue.length === 14) {
        return isValidCNPJ(value);
      }
      
      // Senão, valida como email
      return isValidEmail(value);
    }, {
      message: 'Email inválido ou CNPJ inválido'
    }),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResult {
  success: boolean;
  user?: User;
  redirectTo?: string;
}

export default function LoginClient() {
  const { login, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'cnpj'>('email');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const identifierValue = watch('identifier', '');

  // Detectar automaticamente se é email ou CNPJ
  const detectLoginType = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length > 0 && /^\d/.test(value)) {
      setLoginType('cnpj');
    } else if (value.includes('@')) {
      setLoginType('email');
    }
  };

  // Formatação de CNPJ
  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 14) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return value;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    detectLoginType(value);
    
    if (loginType === 'cnpj') {
      value = formatCNPJ(value);
    }
    
    setValue('identifier', value);
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const submitData = {
        ...data,
        identifier: identifierValue
      };
      
      const result = await login(submitData) as LoginResult;
      
      // O redirecionamento já é feito automaticamente pelo hook useAuth
      // Não precisa fazer nada aqui se o login for bem-sucedido
    } catch (error) {
      // Erro será tratado pelo hook useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
        style={{
          width: '100%',
          maxWidth: '28rem',
        }}
      >
        <Card 
          className="shadow-2xl border-0"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: 'none',
          }}
        >
          <CardHeader 
            className="space-y-4 pb-8"
            style={{
              paddingBottom: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center"
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div 
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span 
                  className="text-white text-2xl font-bold"
                  style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  S
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
              style={{ textAlign: 'center' }}
            >
              <CardTitle 
                className="text-3xl font-bold text-gray-900 mb-2"
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                Bem-vindo ao Shalvah
              </CardTitle>
              <p 
                className="text-gray-600"
                style={{ color: '#6b7280' }}
              >
                Faça login para acessar sua conta
              </p>
            </motion.div>
          </CardHeader>

          <CardContent 
            className="pb-8"
            style={{ paddingBottom: '2rem' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <Label 
                  htmlFor="identifier"
                  className="text-sm font-medium text-gray-700 flex items-center"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {loginType === 'email' ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      CNPJ
                    </>
                  )}
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={loginType === 'email' ? 'seu@email.com' : '00.000.000/0000-00'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  {...register('identifier')}
                  onChange={handleIdentifierChange}
                  value={identifierValue}
                />
                {errors.identifier && (
                  <p 
                    className="text-red-500 text-sm mt-1"
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.identifier.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  {...register('password')}
                />
                {errors.password && (
                  <p 
                    className="text-red-500 text-sm mt-1"
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-center justify-between"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Link 
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  style={{
                    fontSize: '0.875rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  Esqueceu a senha?
                </Link>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isLoading || loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-center"
                style={{ textAlign: 'center' }}
              >
                <p 
                  className="text-sm text-gray-600"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Não tem uma conta?{' '}
                  <Link 
                    href="/cadastro"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    style={{
                      color: '#2563eb',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    Cadastre-se
                  </Link>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
