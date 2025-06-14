
import { useState } from 'react';
import { useTransactions, TransactionInput } from '@/contexts/TransactionContext';
import { toast } from '@/hooks/use-toast';

export const useTransactionOperations = () => {
  const { addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);

  const handleAddTransaction = async (transaction: TransactionInput) => {
    setLoading(true);
    try {
      const result = await addTransaction(transaction);
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add transaction',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = async (id: string, updates: Partial<TransactionInput>) => {
    setLoading(true);
    try {
      const result = await editTransaction(id, updates);
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update transaction',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      await deleteTransaction(id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete transaction',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    loading,
  };
};
