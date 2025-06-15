
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BudgetSetupForm } from '@/components/budget/BudgetSetupForm';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Plus, BarChart3 } from 'lucide-react';
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

const Budget = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const fetchBudgets = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Budget fetch error:', error);
        toast.error('Failed to load budgets');
        setBudgets([]);
      } else {
        setBudgets(data || []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Please log in to create budgets');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('budgets')
        .insert([{ ...budgetData, user_id: user.id }]);

      if (error) {
        throw error;
      }

      toast.success('Budget created successfully');
      await fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchBudgets();
    }
  }, [user?.id, authLoading]);

  return (
    <DashboardLayout activeTab="budget">
      <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
              <p className="text-gray-600">Set limits, track spending, and stay on budget</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Setup Budgets</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <BudgetOverview budgets={budgets} loading={loading} />
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <BudgetSetupForm onCreateBudget={createBudget} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Budget;
