import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCEP } from '@/lib/masks';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface CEPInputProps<T extends FieldValues = any> {
  register: UseFormRegister<T>;
  fieldName?: string;
  isSearchingCEP: boolean;
  onCEPSearch: (cep: string) => void;
  error?: string;
  label?: string;
  className?: string;
}

export function CEPInput<T extends FieldValues = any>({
  register,
  fieldName = 'zipCode',
  isSearchingCEP,
  onCEPSearch,
  error,
  label = 'CEP',
  className = '',
}: CEPInputProps<T>) {
  const { onChange, onBlur, ...registerRest } = register(fieldName as any);

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldName}
          {...registerRest}
          placeholder="00000-000"
          className={error ? 'border-red-500 bg-red-50' : className}
          onChange={(e) => {
            const formatted = formatCEP(e.target.value);
            e.target.value = formatted;
            onChange(e);
          }}
          onBlur={(e) => {
            onBlur(e);
            const cep = e.target.value;
            if (cep) {
              onCEPSearch(cep);
            }
          }}
        />
        {isSearchingCEP && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
