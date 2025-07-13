'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePasswordReset } from '@/hooks/usePasswordReset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { loading, forgotPassword } = usePasswordReset();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Digite um email válido');
      return;
    }

    const result = await forgotPassword({ email });
    if (result.success) {
      setEmailSent(true);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Digite seu email novamente');
      return;
    }

    const result = await forgotPassword({ email });
    if (result.success) {
      // Email já foi enviado, apenas mostrar feedback
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Enviado!</CardTitle>
            <CardDescription>
              Enviamos um link de redefinição de senha para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <p>O link expira em 1 hora por motivos de segurança.</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Reenviando...
                  </>
                ) : (
                  'Reenviar Email'
                )}
              </Button>

              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email e enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Redefinição'
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Lembrou da senha? <Link href="/login" className="text-blue-600 hover:underline">Fazer login</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
