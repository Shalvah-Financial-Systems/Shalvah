import { useState } from 'react';

interface AlertConfig {
  title: string;
  description: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

export function useAlertModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setIsOpen(true);
  };

  const closeAlert = () => {
    if (!isLoading) {
      setIsOpen(false);
      setConfig(null);
    }
  };

  const confirmAlert = async () => {
    if (!config || isLoading) return;

    setIsLoading(true);
    try {
      await config.onConfirm();
      setIsOpen(false);
      setConfig(null);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de conveniência para diferentes tipos de alerta
  const showDeleteAlert = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showAlert({
      title: 'Confirmar Exclusão',
      description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      type: 'danger',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm,
    });
  };

  const showEditAlert = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showAlert({
      title: 'Confirmar Edição',
      description: `Deseja editar a categoria "${itemName}"?`,
      type: 'info',
      confirmText: 'Editar',
      cancelText: 'Cancelar',
      onConfirm,
    });
  };

  const showWarningAlert = (title: string, description: string, onConfirm: () => void | Promise<void>) => {
    showAlert({
      title,
      description,
      type: 'warning',
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
      onConfirm,
    });
  };

  return {
    isOpen,
    config,
    isLoading,
    showAlert,
    showDeleteAlert,
    showEditAlert,
    showWarningAlert,
    closeAlert,
    confirmAlert,
  };
}
