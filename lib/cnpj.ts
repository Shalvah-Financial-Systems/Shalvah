export interface CNPJData {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: string | null;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  ddd_fax: string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  descricao_porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string | null;
  data_exclusao_do_simples: string | null;
  opcao_pelo_mei: boolean;
  situacao_especial: string | null;
  data_situacao_especial: string | null;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal: string | null;
    nome_representante_legal: string | null;
    codigo_qualificacao_representante_legal: number | null;
  }>;
}

export interface FormattedCNPJData {
  name: string;
  fantasyName: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

// Função para validar CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.length === 14;
}

// Função para formatar CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length <= 2) return cleanCNPJ;
  if (cleanCNPJ.length <= 5) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2)}`;
  if (cleanCNPJ.length <= 8) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5)}`;
  if (cleanCNPJ.length <= 12) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5, 8)}/${cleanCNPJ.slice(8)}`;
  
  return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5, 8)}/${cleanCNPJ.slice(8, 12)}-${cleanCNPJ.slice(12, 14)}`;
}

// Função para buscar dados do CNPJ na BrasilAPI
export async function fetchCompanyByCNPJ(cnpj: string): Promise<FormattedCNPJData | null> {
  try {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    if (!isValidCNPJ(cleanCNPJ)) {
      throw new Error('CNPJ inválido');
    }

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado');
      }
      throw new Error('Erro ao buscar CNPJ');
    }

    const data: CNPJData = await response.json();

    // Formatar dados para o formato esperado pelos formulários
    const formattedData: FormattedCNPJData = {
      name: data.razao_social || '',
      fantasyName: data.nome_fantasia || '',
      email: '', // API não retorna email
      phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}` : '',
      address: `${data.descricao_tipo_logradouro || ''} ${data.logradouro || ''}`.trim(),
      number: data.numero || '',
      complement: data.complemento || '',
      district: data.bairro || '',
      city: data.municipio || '',
      state: data.uf || '',
      zipCode: data.cep ? data.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : '',
    };

    return formattedData;
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    throw error;
  }
}
