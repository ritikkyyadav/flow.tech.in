
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, TrendingUp, TrendingDown, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BudgetPerformanceProps {
  refreshTrigger: number;
}

interface BudgetItem {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'approaching' | 'over';
  daysLeft: number;
}

export const BudgetPerformance = ({ refreshTrigger }: BudgetPerformanceProps) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBudgetData();
    }
  }, [user, refreshTrigger]);

  const fetchBudgetData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysLeft = Math.max(0, endOfMonth.getDate() - now.getDate());

      // Get categories with spending limits
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('name, spending_limit')
        .eq('type', 'expense')
        .not('spending_limit', 'is', null)
        .gt('spending_limit', 0);

      if (categoriesError) throw categoriesError;

      // Get current month expenses by category
      const { data: expenses, error: expensesError } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('transaction_date', startOfMonth.toISOString())
        .lte('transaction_date', endOfMonth.toISOString());

      if (expensesError) throw expensesError;

      // Calculate spending by category
      const categorySpending = expenses?.reduce((acc: any, expense: any) => {
        acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
        return acc;
      }, {}) || {};

      // Create budget items
      const budgetItems: BudgetItem[] = categories?.map(category => {
        const spent = categorySpending[category.name] || 0;
        const budgeted = Number(category.spending_limit);
        const remaining = Math.max(0, budgeted - spent);
        const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        let status: 'under' | 'approaching' | 'over';
        if (percentage <= 70) status = 'under';
        else if (percentage <= 100) status = 'approaching';
        else status = 'over';

        return {
          category: category.name,
          budgeted,
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
          status,
          daysLeft
        };
      }) || [];

      // Sort by percentage (highest first)
      budgetItems.sort((a, b) => b.percentage - a.percentage);

      setBudgets(budgetItems);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'under': return 'bg-green-500';
      case 'approaching': return 'bg-yellow-500';
      case 'over': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string, percentage: number) => {
    switch (status) {
      case 'under':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">On Track</Badge>;
      case 'approaching':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          {percentage.toFixed(0)}% Used
        </Badge>;
      case 'over':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Over Budget</Badge>;
      default:
        return null;
    }
  };

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'under': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'over': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Budget Performance</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {budgets.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Categories</p>
              <p className="font-semibold">{budgets.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">On Track</p>
              <p className="font-semibold text-green-600">
                {budgets.filter(b => b.status === 'under').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Over Budget</p>
              <p className="font-semibold text-red-600">
                {budgets.filter(b => b.status === 'over').length}
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No budgets set yet</p>
            <p className="text-sm mb-4">Create budgets to track your spending</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => (
              <div key={budget.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(budget.status)}
                    <span className="font-medium">{budget.category}</span>
                    {getStatusBadge(budget.status, budget.percentage)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)}
                    </span>
                    <span className="text-gray-500">
                      {budget.remaining > 0 
                        ? `${formatCurrency(budget.remaining)} remaining`
                        : `${formatCurrency(Math.abs(budget.remaining))} over`
                      }
                    </span>
                  </div>

                  <div className="relative">
                    <Progress 
                      value={budget.percentage} 
                      className="h-3"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(budget.status)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{budget.percentage.toFixed(1)}% used</span>
                    <span>{budget.daysLeft} days left in month</span>
                  </div>
                </div>

                {budget.status === 'over' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      You've exceeded your budget by {formatCurrency(budget.spent - budget.budgeted)}.
                      Consider reviewing your spending in this category.
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Budget Category
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
