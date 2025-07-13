import { useState, useCallback, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { fetchAddressByCEP, isValidCEP } from '@/lib/cep';
import { toast } from 'sonner';

interface UseCEPSearchProps {
  setValue: UseFormSetValue<any>;
}

export function useCEPSearch({ setValue }: UseCEPSearchProps) {
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  const lastSearchedCEP = useRef<string>('');

  // Buscar endereço por CEP
  const handleCEPSearch = useCallback(async (cep: string) => {
    if (!isValidCEP(cep) || lastSearchedCEP.current === cep) return;

    setIsSearchingCEP(true);
    lastSearchedCEP.current = cep;
    
    try {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        setValue('address', addressData.address);
        setValue('district', addressData.district);
        setValue('city', addressData.city);
        setValue('state', addressData.state);
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsSearchingCEP(false);
    }
  }, [setValue]);

  const resetSearch = useCallback(() => {
    lastSearchedCEP.current = '';
  }, []);

  return {
    isSearchingCEP,
    handleCEPSearch,
    resetSearch,
  };
}
