'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  client: Client | null;
  isDeleting: boolean;
}

export function DeleteClientModal({
  isOpen,
  onClose,
  onConfirm,
  client,
  isDeleting
}: DeleteClientModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  if (!client) return null;

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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Excluir Cliente</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Tem certeza que deseja excluir o cliente{' '}
                    <span className="font-semibold text-gray-900">{client.name}</span>?
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
                      Todas as informações do cliente serão permanentemente removidas.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 bg-red-600 hover:bg-red-700"
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
                          Excluir
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
