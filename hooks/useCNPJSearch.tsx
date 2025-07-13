import { useState, useCallback, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { fetchCompanyByCNPJ, isValidCNPJ } from '@/lib/cnpj';
import { toast } from 'sonner';

interface UseCNPJSearchProps {
  setValue: UseFormSetValue<any>;
}

export function useCNPJSearch({ setValue }: UseCNPJSearchProps) {
  const [isSearchingCNPJ, setIsSearchingCNPJ] = useState(false);
  const lastSearchedCNPJ = useRef<string>('');

  // Buscar dados da empresa por CNPJ
  const handleCNPJSearch = useCallback(async (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    if (!isValidCNPJ(cleanCNPJ)) return;
    
    // Se é o mesmo CNPJ e já estamos buscando, não buscar novamente
    if (lastSearchedCNPJ.current === cleanCNPJ && isSearchingCNPJ) return;

    setIsSearchingCNPJ(true);
    lastSearchedCNPJ.current = cleanCNPJ;
    
    try {
      const companyData = await fetchCompanyByCNPJ(cleanCNPJ);
      if (companyData) {
        // Preencher apenas os campos que não estão vazios
        if (companyData.name) setValue('name', companyData.name);
        if (companyData.email) setValue('email', companyData.email);
        if (companyData.phone) setValue('phone', companyData.phone);
        if (companyData.address) setValue('address', companyData.address);
        if (companyData.number) setValue('number', companyData.number);
        if (companyData.complement) setValue('complement', companyData.complement);
        if (companyData.district) setValue('district', companyData.district);
        if (companyData.city) setValue('city', companyData.city);
        if (companyData.state) setValue('state', companyData.state);
        if (companyData.zipCode) setValue('zipCode', companyData.zipCode);
        
        // Para formulários de fornecedor, preencher nome fantasia se disponível
        if (companyData.fantasyName) {
          setValue('fantasyName', companyData.fantasyName);
        }
        
        toast.success('Dados da empresa encontrados e preenchidos!');
      } else {
        toast.error('CNPJ não encontrado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar CNPJ');
    } finally {
      setIsSearchingCNPJ(false);
    }
  }, [setValue]);

  const resetSearch = useCallback(() => {
    lastSearchedCNPJ.current = '';
  }, []);

  return {
    isSearchingCNPJ,
    handleCNPJSearch,
    resetSearch,
  };
}
