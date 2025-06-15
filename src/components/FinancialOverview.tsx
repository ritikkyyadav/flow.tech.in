
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target, PiggyBank, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatIndianCurrency } from "@/utils/indianUtils";

interface FinancialOverviewProps {
  refreshTrigger: number;
}

interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  dailyAverage: number;
  incomeChange: number;
  expenseChange: number;
}

export const FinancialOverview = ({ refreshTrigger }: FinancialOverviewProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    dailyAverage: 0,
    incomeChange: 0,
    expenseChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFinancialStats();
    }
  }, [user, refreshTrigger]);

  const fetchFinancialStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get all transactions
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id);

      if (allError) throw allError;

      // Get current month transactions
      const { data: currentMonthTransactions, error: currentError } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfMonth.toISOString());

      if (currentError) throw currentError;

      // Get last month transactions
      const { data: lastMonthTransactions, error: lastError } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfLastMonth.toISOString())
        .lt('transaction_date', startOfMonth.toISOString());

      if (lastError) throw lastError;

      // Calculate stats
      const totalIncome = allTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = allTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const monthlyIncome = currentMonthTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const monthlyExpenses = currentMonthTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const lastMonthIncome = lastMonthTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const lastMonthExpenses = lastMonthTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const daysInMonth = now.getDate();
      const dailyAverage = monthlyExpenses / daysInMonth;

      const incomeChange = lastMonthIncome > 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
      const expenseChange = lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

      setStats({
        totalIncome,
        totalExpenses,
        currentBalance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        dailyAverage,
        incomeChange,
        expenseChange,
      });
    } catch (error) {
      console.error('Error fetching financial stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Balance */}
      <Card className={`border-l-4 ${stats.currentBalance >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
          <Wallet className={`h-5 w-5 ${stats.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatIndianCurrency(stats.currentBalance)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Total income minus expenses
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Monthly Income</CardTitle>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatIndianCurrency(stats.monthlyIncome)}
          </div>
          <div className="flex items-center space-x-2 text-xs mt-1">
            <span className={`flex items-center ${stats.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.incomeChange >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {formatChange(stats.incomeChange)}
            </span>
            <span className="text-gray-500">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Monthly Expenses</CardTitle>
          <CreditCard className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatIndianCurrency(stats.monthlyExpenses)}
          </div>
          <div className="flex items-center space-x-2 text-xs mt-1">
            <span className={`flex items-center ${stats.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.expenseChange <= 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {formatChange(Math.abs(stats.expenseChange))}
            </span>
            <span className="text-gray-500">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Average */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Daily Average</CardTitle>
          <Target className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatIndianCurrency(stats.dailyAverage)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Average daily spending this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
