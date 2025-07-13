'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';
import { AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToggleClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  client: Client | null;
  isToggling: boolean;
}

export function ToggleClientModal({
  isOpen,
  onClose,
  onConfirm,
  client,
  isToggling,
}: ToggleClientModalProps) {
  if (!client) return null;

  const isActive = client.status === 'ACTIVE';
  const action = isActive ? 'inativar' : 'ativar';
  const actionTitle = isActive ? 'Inativar' : 'Ativar';

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  {isActive ? (
                    <ToggleRight className="h-5 w-5 text-red-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-green-600" />
                  )}
                  {actionTitle} Cliente
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">
                      Confirmar {action}
                    </p>
                    <p>
                      Tem certeza que deseja {action} o cliente <strong>"{client.name}"</strong>?
                    </p>
                    {isActive && (
                      <p className="mt-2 text-xs">
                        O cliente ficará inativo e não aparecerá nas seleções de novos registros.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-gray-600">{client.email}</div>
                    {client.phone && (
                      <div className="text-gray-600">{client.phone}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isToggling}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isToggling}
                    className={`flex-1 ${
                      isActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isToggling ? 'Processando...' : actionTitle}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
