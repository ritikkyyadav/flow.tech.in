
import { useState, useEffect, useCallback } from 'react';

interface TransactionSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  totalTransactions: number;
  recentTransactions: any[];
}

export const useRealTimeData = () => {
  const [data, setData] = useState<TransactionSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyNet: 0,
    totalTransactions: 0,
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateSummary = useCallback(() => {
    try {
      const transactions = JSON.parse(localStorage.getItem('withu_transactions') || '[]');
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Calculate totals
      let totalBalance = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      transactions.forEach((transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;
        
        if (transaction.type === 'income') {
          totalBalance += amount;
          if (transaction.transaction_date?.startsWith(currentMonth)) {
            monthlyIncome += amount;
          }
        } else if (transaction.type === 'expense') {
          totalBalance -= amount;
          if (transaction.transaction_date?.startsWith(currentMonth)) {
            monthlyExpenses += amount;
          }
        }
      });
      
      const monthlyNet = monthlyIncome - monthlyExpenses;
      
      // Get recent transactions (last 10)
      const recentTransactions = transactions
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
  }, []);

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
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('withu-data-refresh', handleDataUpdate);
    };
  }, [calculateSummary]);

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
