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

const loginSchema = z.object({
  identifier: z.string().min(1, 'E-mail ou CNPJ é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const success = await login(data);
    if (success) {
      router.push('/dashboard');
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
                <Label htmlFor="identifier">E-mail ou CNPJ</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Digite seu e-mail ou CNPJ"
                  {...register('identifier')}
                  className="w-full"
                />
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
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?
                <a href="#" className="ml-1 text-blue-600 hover:text-blue-800 hover:underline">
                  Cadastre-se
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
