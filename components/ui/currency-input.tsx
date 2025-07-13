'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

// Função para aplicar máscara de moeda brasileira
const applyCurrencyMask = (value: string) => {
  // Remove tudo que não é dígito
  let numbers = value.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Converte para centavos (adiciona zeros à esquerda se necessário)
  numbers = numbers.padStart(3, '0');
  
  // Separa centavos
  const centavos = numbers.slice(-2);
  const reais = numbers.slice(0, -2);
  
  // Aplica pontos de milhares
  const reaisFormatted = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${reaisFormatted},${centavos}`;
};

// Função para converter valor mascarado para número
const parseCurrencyValue = (value: string): number => {
  if (!value) return 0;
  
  // Remove pontos de milhares e substitui vírgula por ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const number = parseFloat(cleanValue);
  
  return isNaN(number) ? 0 : number;
};

// Função para formatar número para moeda brasileira
const formatCurrency = (value: number): string => {
  if (isNaN(value) || value === 0) return '';
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
  showCurrencySymbol?: boolean;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = 0, onChange, showCurrencySymbol = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value > 0) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyCurrencyMask(inputValue);
      const numericValue = parseCurrencyValue(maskedValue);
      
      setDisplayValue(maskedValue);
      onChange?.(numericValue);
    };

    return (
      <div className="relative">
        {showCurrencySymbol && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            R$
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            showCurrencySymbol ? 'pl-10' : '',
            className
          )}
          placeholder="0,00"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput, applyCurrencyMask, parseCurrencyValue, formatCurrency };
