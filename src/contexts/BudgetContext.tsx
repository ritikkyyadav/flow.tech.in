
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BudgetAlert {
  id: string;
  user_id: string;
  budget_id: string;
  alert_type: string;
  threshold_percentage: number;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

interface BudgetContextType {
  budgets: Budget[];
  alerts: BudgetAlert[];
  loading: boolean;
  createBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (budgetError) throw budgetError;

      // Fetch alerts
      const { data: alertData, error: alertError } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (alertError) throw alertError;

      setBudgets(budgetData || []);
      setAlerts(alertData || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .insert([{ ...budgetData, user_id: user.id }]);

      if (error) throw error;

      toast.success('Budget created successfully');
      await refreshBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Budget updated successfully');
      await refreshBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Budget deleted successfully');
      await refreshBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  useEffect(() => {
    if (user) {
      refreshBudgets();
    }
  }, [user]);

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        alerts,
        loading,
        createBudget,
        updateBudget,
        deleteBudget,
        refreshBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
