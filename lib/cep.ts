interface CEPResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

interface AddressData {
  address: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export async function fetchAddressByCEP(cep: string): Promise<AddressData | null> {
  try {
    // Remove formatação do CEP
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Validar CEP
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
    
    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }

    const data: CEPResponse = await response.json();

    return {
      address: data.street || '',
      district: data.neighborhood || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: formatCEP(cleanCEP),
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length === 8) {
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
  }
  return cleanCEP;
}

export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}
