
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TransactionSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  totalTransactions: number;
  recentTransactions: any[];
}

export const useRealTimeData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TransactionSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyNet: 0,
    totalTransactions: 0,
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateSummary = useCallback(async () => {
    try {
      // Prefer Supabase when authenticated; fallback to localStorage demo data
      let transactions: any[] = [];
      if (user?.id) {
        const { data: rows, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false });
        if (error) throw error;
        transactions = rows || [];
      } else {
        transactions = JSON.parse(localStorage.getItem('withu_transactions') || '[]');
      }
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Calculate totals
      let totalBalance = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      transactions.forEach((transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;
        const dateStr = transaction.transaction_date;
        const d = new Date(dateStr);
        const inCurrentMonth = !isNaN(d.getTime()) && d.toISOString().startsWith(currentMonth);
        
        if (transaction.type === 'income') {
          totalBalance += amount;
          if (inCurrentMonth) {
            monthlyIncome += amount;
          }
        } else if (transaction.type === 'expense') {
          totalBalance -= amount;
          if (inCurrentMonth) {
            monthlyExpenses += amount;
          }
        }
      });
      
      const monthlyNet = monthlyIncome - monthlyExpenses;
      
      // Get recent transactions (last 10)
      const recentTransactions = [...transactions]
        .sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .slice(0, 10);
      
      const summary = {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyNet,
        totalTransactions: transactions.length,
        recentTransactions
      };
      
      setData(summary);
      
      // Trigger custom event for other components to listen
      window.dispatchEvent(new CustomEvent('withu-data-updated', { detail: summary }));
      
    } catch (error) {
      console.error('Error calculating summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'withu_transactions') {
        calculateSummary();
      }
    };

    // Listen for custom events from other components
    const handleDataUpdate = () => {
      calculateSummary();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('withu-data-refresh', handleDataUpdate);
    
    // Initial calculation
    calculateSummary();

    // Supabase realtime: listen to inserts/updates/deletes to keep dashboard in sync
    let channel: any;
    if (user?.id) {
      channel = supabase
        .channel('transactions_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          () => calculateSummary()
        )
        .subscribe();
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('withu-data-refresh', handleDataUpdate);
      if (channel) supabase.removeChannel(channel);
    };
  }, [calculateSummary, user?.id]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    calculateSummary();
  }, [calculateSummary]);

  return {
    data,
    isLoading,
    refreshData
  };
};

// Utility function to update data across all components
export const triggerDataRefresh = () => {
  window.dispatchEvent(new CustomEvent('withu-data-refresh'));
};
