'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction, UpdateTransactionData } from '@/types';
import { RotateCcw, Edit, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useTransactions';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { useAlertModal } from '@/hooks/useAlertModal';
import Link from 'next/link';

interface ListaTransacoesProps {
  transactions?: Transaction[];
  showActions?: boolean;
  showNewTransactionButton?: boolean;
}

export function ListaTransacoes({ 
  transactions: externalTransactions, 
  showActions = true,
  showNewTransactionButton = false 
}: ListaTransacoesProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { transactions: hookTransactions, toggleTransactionStatus, updateTransaction, loading } = useTransactions();
  const { showToggleAlert } = useAlertModal();
  
  // Use external transactions if provided, otherwise use hook transactions
  const transactions = externalTransactions || hookTransactions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleToggleStatus = async (transaction: Transaction) => {
    const isActive = transaction.status === 'ACTIVE';
    const action = isActive ? 'cancelar' : 'ativar';
    
    await showToggleAlert(
      `${action} transação`,
      `Tem certeza que deseja ${action} esta transação?`,
      async () => {
        setTogglingId(transaction.id);
        try {
          const success = await toggleTransactionStatus(transaction.id);
          if (!success) {
            // Error handling is done in the hook
          }
        } catch (error) {
          console.error('Erro ao alterar status da transação:', error);
        } finally {
          setTogglingId(null);
        }
      }
    );
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (data: UpdateTransactionData): Promise<boolean> => {
    if (!selectedTransaction) return false;
    
    setIsUpdating(true);
    try {
      const success = await updateTransaction(selectedTransaction.id, data);
      if (success) {
        setEditModalOpen(false);
        setSelectedTransaction(null);
      }
      return success;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseModals = () => {
    setEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Últimas Transações</CardTitle>
          {showNewTransactionButton && (
            <Link href="/nova-transacao">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions?.length === 0 || !transactions ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'INCOME' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{transaction.category?.name || 'Categoria não encontrada'} • {formatDate(transaction.date)}</span>
                      <Badge variant={transaction.active !== false ? 'default' : 'destructive'}>
                        {transaction.active !== false ? 'Ativa' : 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                </div>                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'INCOME' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.value)}
                  </div>
                  
                  {showActions && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${transaction.active !== false ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                        onClick={() => handleToggleStatus(transaction)}
                        disabled={togglingId === transaction.id}
                        title={transaction.active !== false ? 'Cancelar transação' : 'Ativar transação'}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {/* Modais */}
      <EditTransactionModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveEdit}
        transaction={selectedTransaction}
        isUpdating={isUpdating}
      />
    </Card>
  );
}
