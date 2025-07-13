// Função para formatar telefone
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length <= 2) return cleanPhone;
  if (cleanPhone.length <= 6) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  if (cleanPhone.length <= 10) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  
  return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`;
}

// Função para formatar CPF
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
  if (cleanCPF.length <= 9) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
  
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
}

// Função para validar CPF
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(.)\1*$/.test(cleanCPF)) return false; // Todos os dígitos iguais
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
}

// Função para permitir apenas números
export function formatNumber(value: string): string {
  return value.replace(/[^\d]/g, '');
}

// Função para permitir apenas letras e espaços
export function formatLettersOnly(value: string): string {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
}

// Função para formatar estado (apenas 2 letras maiúsculas)
export function formatState(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
}

// Função para validar email básico
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para formatar CEP
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  
  if (cleanCEP.length <= 5) return cleanCEP;
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`;
}

// Função para formatar CPF/CNPJ automaticamente
export function formatCPFCNPJ(value: string): string {
  const cleanValue = value.replace(/[^\d]/g, '');
  
  if (cleanValue.length <= 11) {
    return formatCPF(cleanValue);
  } else {
    // Usar formatCNPJ da lib/cnpj.ts
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
    if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
    if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
    
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
  }
}

// Função para validar CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(.)\1*$/.test(cleanCNPJ)) return false; // Todos os dígitos iguais
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  // Calcular segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit1 === parseInt(cleanCNPJ.charAt(12)) && digit2 === parseInt(cleanCNPJ.charAt(13));
}

// Função para validar CPF/CNPJ
export function validateCPFCNPJ(value: string): { isValid: boolean; message: string } {
  if (!value) return { isValid: true, message: '' };
  
  const cleanValue = value.replace(/[^\d]/g, '');
  
  if (cleanValue.length === 11) {
    if (isValidCPF(value)) {
      return { isValid: true, message: '' };
    } else {
      return { isValid: false, message: 'CPF inválido' };
    }
  } else if (cleanValue.length === 14) {
    if (isValidCNPJ(value)) {
      return { isValid: true, message: '' };
    } else {
      return { isValid: false, message: 'CNPJ inválido' };
    }
  } else if (cleanValue.length > 0) {
    return { isValid: false, message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' };
  }
  
  return { isValid: true, message: '' };
}
