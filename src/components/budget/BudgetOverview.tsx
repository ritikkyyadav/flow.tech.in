
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/contexts/TransactionContext';

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

interface BudgetOverviewProps {
  budgets: Budget[];
  loading: boolean;
}

export const BudgetOverview = ({ budgets, loading }: BudgetOverviewProps) => {
  const { transactions, loading: transactionLoading } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetData = useMemo(() => {
    if (!budgets || !transactions) return [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return budgets.map(budget => {
      // Calculate actual spending for this category in current period
      const categoryTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                              transactionDate.getFullYear() === currentYear;
        
        return t.category === budget.category && 
               t.type === 'expense' && 
               isCurrentMonth;
      });

      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;
      
      // Calculate days left in month
      const daysLeftInMonth = new Date(currentYear, currentMonth + 1, 0).getDate() - new Date().getDate();
      const dailyBudget = remaining > 0 ? remaining / Math.max(daysLeftInMonth, 1) : 0;

      // Determine status
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percentage > 100) status = 'danger';
      else if (percentage > 80) status = 'warning';

      return {
        ...budget,
        spent,
        percentage,
        remaining,
        dailyBudget,
        status,
        daysLeftInMonth
      };
    });
  }, [budgets, transactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger': return { icon: AlertCircle, color: 'text-red-500' };
      case 'warning': return { icon: TrendingUp, color: 'text-orange-500' };
      default: return { icon: Target, color: 'text-green-500' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  if (loading || transactionLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading budgets...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Budget Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No budgets set up yet</p>
            <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Budget Performance
                </CardTitle>
                <p className="text-sm text-gray-500">Monthly spending overview</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {budgetData.map((budget) => {
              const status = getStatusIcon(budget.status);
              const StatusIcon = status.icon;

              return (
                <div key={budget.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        budget.status === 'danger' ? "bg-red-100" : 
                        budget.status === 'warning' ? "bg-orange-100" : "bg-green-100"
                      )}>
                        <StatusIcon className={cn("w-5 h-5", status.color)} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 text-lg">{budget.category}</span>
                          <Badge variant={budget.status === 'danger' ? 'destructive' : 
                                        budget.status === 'warning' ? 'default' : 'secondary'}>
                            {budget.percentage.toFixed(1)}% used
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {budget.daysLeftInMonth} days left
                          </span>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-500">
                            {budget.period}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(budget.spent)}
                      </div>
                      <div className="text-sm text-gray-500">
                        of {formatCurrency(budget.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-4 bg-gray-100"
                    />
                    <div 
                      className={cn("absolute inset-0 h-4 rounded-full", getStatusColor(budget.status))}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                    {budget.percentage > 100 && (
                      <div className="absolute inset-0 bg-red-500 h-4 rounded-full opacity-20 animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className={cn(
                        "font-medium",
                        budget.remaining > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {budget.remaining > 0 
                          ? `${formatCurrency(budget.remaining)} remaining` 
                          : `${formatCurrency(Math.abs(budget.remaining))} over budget`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-medium">
                        {budget.remaining > 0 
                          ? `${formatCurrency(budget.dailyBudget)}/day available` 
                          : 'Budget exceeded'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-green-600 font-medium">Categories On Track</div>
                  <div className="text-2xl font-bold text-green-700">
                    {budgetData.filter(b => b.status === 'safe').length}/{budgetData.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-medium">Total Remaining</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(budgetData.reduce((sum, b) => sum + Math.max(0, b.remaining), 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
