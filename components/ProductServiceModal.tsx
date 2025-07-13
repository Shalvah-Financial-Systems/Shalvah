'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductsServices, CreateProductsServicesData } from '@/types';

interface ProductServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductsServicesData) => Promise<boolean>;
  productService?: ProductsServices | null;
  title?: string;
}

export function ProductServiceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  productService = null,
  title 
}: ProductServiceModalProps) {
  const [formData, setFormData] = useState<CreateProductsServicesData>({
    name: '',
    description: '',
    price: 0,
    type: 'PRODUCT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar form data quando o produto/serviço mudar
  useEffect(() => {
    if (productService) {
      setFormData({
        name: productService.name,
        description: productService.description || '',
        price: productService.price,
        type: productService.type
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        type: 'PRODUCT'
      });
    }
  }, [productService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0) {
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(formData);
    
    if (success) {
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalTitle = title || (productService ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalTitle}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productservice-name">Nome *</Label>
                <Input
                  id="productservice-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto/serviço"
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="productservice-type">Tipo *</Label>
                <Select
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as 'PRODUCT' | 'SERVICE' })}
                  value={formData.type}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">Produto</SelectItem>
                    <SelectItem value="SERVICE">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="productservice-price">Preço *</Label>
                <CurrencyInput
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
                  disabled={isSubmitting}
                  className="mt-1"
                  showCurrencySymbol={true}
                />
              </div>

              <div>
                <Label htmlFor="productservice-description">Descrição</Label>
                <Input
                  id="productservice-description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto/serviço"
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || formData.price <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Salvando...' : productService ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
