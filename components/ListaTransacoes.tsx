'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, UpdateTransactionData } from '@/types';
import { Trash2, Edit, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions } from '@/hooks/useTransactions';
import { DeleteTransactionModal } from '@/components/DeleteTransactionModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { transactions: hookTransactions, deleteTransaction, updateTransaction, loading } = useTransactions();
  
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
  const handleDelete = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;
    
    setDeletingId(selectedTransaction.id);
    try {
      const success = await deleteTransaction(selectedTransaction.id);
      if (success) {
        setDeleteModalOpen(false);
        setSelectedTransaction(null);
      }
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    } finally {
      setDeletingId(null);
    }
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
    setDeleteModalOpen(false);
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
                    transaction.type === 'entrada' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {transaction.category?.name || 'Categoria não encontrada'} • {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'entrada' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.value)}
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
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(transaction)}
                        disabled={deletingId === transaction.id}
                      >
                        <Trash2 className="h-4 w-4" />
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
      <DeleteTransactionModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        transaction={selectedTransaction}
        isDeleting={!!deletingId}
      />
      
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
