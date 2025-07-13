import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  password: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
}

interface ValidateTokenData {
  token?: string;
  access_token?: string;
  // Adicionar novos campos para parâmetros do Supabase
  type?: string;
  expires_at?: string;
  expires_in?: string;
  token_type?: string;
}

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/forgot-password', {
        email: data.email.toLowerCase().trim()
      });
      
      if (response.data.success) {
        toast.success('Email de redefinição enviado!');
        return { success: true };
      }
      
      return { success: false, message: response.data.message || 'Erro ao enviar email' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar email de redefinição';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const validateResetToken = async (data: ValidateTokenData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Se temos access_token do Supabase e é tipo recovery, consideramos válido
      if (data.access_token && (data.type === 'recovery' || !data.type)) {
        return { valid: true };
      }
      
      // Para tokens customizados, validar via backend se necessário
      if (data.token) {
        const response = await api.post('/auth/validate-reset-token', { 
          token: data.token 
        });
        return { valid: response.data.valid };
      }
      
      return { valid: false };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Token inválido';
      setError(message);
      return { valid: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar dados para o backend
      const resetData = {
        password: data.password,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        // Token personalizado (se houver)
        ...(data.token && { token: data.token })
      };
      
      const response = await api.post('/auth/reset-password', resetData);
      
      if (response.data.success) {
        toast.success('Senha redefinida com sucesso!');
        return { success: true };
      }
      
      return { success: false, message: response.data.message || 'Erro ao redefinir senha' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    forgotPassword,
    validateResetToken,
    resetPassword,
  };
}
