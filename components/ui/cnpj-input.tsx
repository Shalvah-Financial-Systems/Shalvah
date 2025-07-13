import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCNPJ } from '@/lib/cnpj';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface CNPJInputProps<T extends FieldValues = any> {
  register: UseFormRegister<T>;
  fieldName?: string;
  isSearchingCNPJ: boolean;
  onCNPJSearch: (cnpj: string) => void;
  error?: string;
  label?: string;
}

export function CNPJInput<T extends FieldValues = any>({
  register,
  fieldName = 'cnpj',
  isSearchingCNPJ,
  onCNPJSearch,
  error,
  label = 'CNPJ',
}: CNPJInputProps) {
  const { onChange, onBlur, ...registerRest } = register(fieldName as any);

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldName}
          {...registerRest}
          placeholder="00.000.000/0000-00"
          onChange={(e) => {
            const formatted = formatCNPJ(e.target.value);
            e.target.value = formatted;
            onChange(e);
          }}
          onBlur={(e) => {
            onBlur(e);
            const cnpj = e.target.value;
            if (cnpj) {
              onCNPJSearch(cnpj);
            }
          }}
        />
        {isSearchingCNPJ && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
