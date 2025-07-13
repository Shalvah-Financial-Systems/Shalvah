'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductsServices } from '@/types';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteProductServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productService: ProductsServices | null;
  isDeleting: boolean;
}

export function DeleteProductServiceModal({
  isOpen,
  onClose,
  onConfirm,
  productService,
  isDeleting
}: DeleteProductServiceModalProps) {
  if (!productService) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">Confirmar Exclusão</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                    disabled={isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Tem certeza que deseja excluir este {productService.type === 'PRODUCT' ? 'produto' : 'serviço'}? Esta ação não pode ser desfeita.
                </p>
                
                {/* Detalhes do produto/serviço */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nome:</span>
                    <span className="text-sm font-medium">{productService.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <span className="text-sm font-medium">
                      {productService.type === 'PRODUCT' ? 'Produto' : 'Serviço'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Preço:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(productService.price)}
                    </span>
                  </div>
                  
                  {productService.description && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Descrição:</span>
                      <span className="text-sm font-medium text-right max-w-[60%] truncate">
                        {productService.description}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Excluindo...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Excluir {productService.type === 'PRODUCT' ? 'Produto' : 'Serviço'}
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
