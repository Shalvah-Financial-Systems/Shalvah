'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePasswordReset } from '@/hooks/usePasswordReset';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, validateResetToken: validateToken, resetPassword } = usePasswordReset();
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Extrair parâmetros tanto da query string quanto do hash
  const [urlParams, setUrlParams] = useState({
    token: null as string | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    type: null as string | null,
    error: null as string | null,
    errorDescription: null as string | null,
    expiresAt: null as string | null,
    expiresIn: null as string | null,
    tokenType: null as string | null,
  });

  // UseEffect para extrair parâmetros da URL (query params e hash)
  useEffect(() => {
    // Parâmetros da query string
    const token = searchParams.get('token');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Parâmetros do hash (Supabase usa hash)
    let hashParams = new URLSearchParams();
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove o #
      hashParams = new URLSearchParams(hash);
    }

    const hashAccessToken = hashParams.get('access_token');
    const hashRefreshToken = hashParams.get('refresh_token');
    const hashType = hashParams.get('type');
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    const hashExpiresAt = hashParams.get('expires_at');
    const hashExpiresIn = hashParams.get('expires_in');
    const hashTokenType = hashParams.get('token_type');

    // Priorizar parâmetros do hash (Supabase) sobre query params
    setUrlParams({
      token: token,
      accessToken: hashAccessToken || accessToken,
      refreshToken: hashRefreshToken || refreshToken,
      type: hashType || type,
      error: hashError || error,
      errorDescription: hashErrorDescription || errorDescription,
      expiresAt: hashExpiresAt,
      expiresIn: hashExpiresIn,
      tokenType: hashTokenType,
    });
  }, [searchParams]);

  // Log para debug - ver todos os parâmetros recebidos
  useEffect(() => {
    validateResetTokenData();
  }, [urlParams.token, urlParams.accessToken, urlParams.type, urlParams.error]);

  const validateResetTokenData = async () => {
    // Verificar se há erro do Supabase
    if (urlParams.error) {
      setTokenValid(false);
      setValidatingToken(false);
      toast.error(urlParams.errorDescription || 'Erro na autenticação');
      return;
    }

    // Verificar se chegamos aqui via fragment/hash (alguns provedores usam #)
    const hash = window.location.hash;
    if (hash) {
      // Tentar extrair parâmetros do hash
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      
      if (hashAccessToken || hashType === 'recovery') {
        setTokenValid(true);
        setValidatingToken(false);
        return;
      }
    }

    // Para o fluxo do Supabase, verificar se é um link de recovery
    if (urlParams.type === 'recovery' || urlParams.accessToken) {
      setTokenValid(true);
      setValidatingToken(false);
      return;
    }

    // Para outros tokens (backend customizado)
    if (urlParams.token) {
      try {
        setValidatingToken(true);
        const result = await validateToken({
          token: urlParams.token
        });
        
        setTokenValid(result.valid);
        
        if (!result.valid) {
          toast.error('Token de redefinição inválido ou expirado');
        }
      } catch (error: any) {
        setTokenValid(false);
        toast.error('Token de redefinição inválido ou expirado');
      } finally {
        setValidatingToken(false);
      }
      return;
    }

    // Nenhum token válido encontrado
    setTokenValid(false);
    setValidatingToken(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password) {
      toast.error('Digite a nova senha');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Preparar dados para envio
    const resetData = {
      password: formData.password,
      ...(urlParams.accessToken && { access_token: urlParams.accessToken }),
      ...(urlParams.refreshToken && { refresh_token: urlParams.refreshToken }),
      ...(urlParams.token && { token: urlParams.token })
    };

    const result = await resetPassword(resetData);

    if (result.success) {
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login?message=Senha redefinida com sucesso. Faça login com sua nova senha.');
      }, 2000);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Validando token de redefinição...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Token Inválido</CardTitle>          <CardDescription>
            O link de redefinição de senha é inválido, expirou ou você acessou esta página diretamente.
            <br />
            <strong>Para redefinir sua senha:</strong>
            <br />
            1. Vá para a página de login
            <br />
            2. Clique em "Esqueci minha senha"
            <br />
            3. Digite seu email e solicite um novo link
            <br />
            4. Verifique sua caixa de entrada e spam
            <br />
            5. Clique no link recebido por email
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/forgot-password')}
                className="w-full"
              >
                Solicitar Novo Link
              </Button>
              <Button 
                onClick={handleBackToLogin}
                className="w-full"
                variant="outline"
              >
                Voltar ao Login
              </Button>
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
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua nova senha"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirme sua nova senha"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Validação visual das senhas */}
            {formData.password && formData.confirmPassword && (
              <div className="flex items-center space-x-2 text-sm">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">As senhas coincidem</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">As senhas não coincidem</span>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.password || !formData.confirmPassword}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBackToLogin}
                disabled={loading}
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
