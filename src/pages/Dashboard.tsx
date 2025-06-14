
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { DualAxisChart } from "@/components/dashboard/DualAxisChart";
import { WaterfallChart } from "@/components/dashboard/WaterfallChart";
import { InteractivePieChart } from "@/components/dashboard/InteractivePieChart";
import { BudgetDashboard } from "@/components/dashboard/BudgetDashboard";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { AIInsightsWidget } from "@/components/dashboard/AIInsightsWidget";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { AdvancedFiltering } from "@/components/dashboard/AdvancedFiltering";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  transactions: any[];
  categoryData: any[];
  monthlyTrends: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    transactions: [],
    categoryData: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'last30days',
    categories: [],
    transactionType: 'all'
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, filterOptions]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Fetch transactions for current month
      const { data: currentMonthTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfMonth.toISOString())
        .order('transaction_date', { ascending: false });

      // Fetch last 6 months data for trends
      const { data: historicalTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', last6Months.toISOString())
        .order('transaction_date', { ascending: false });

      // Calculate current month totals
      const income = currentMonthTransactions?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const expenses = currentMonthTransactions?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Calculate balance (simplified - in real app, would be running total)
      const balance = income - expenses;

      // Calculate savings rate
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // Process category data
      const categoryTotals = currentMonthTransactions?.reduce((acc: any, transaction: any) => {
        const key = transaction.category;
        if (!acc[key]) {
          acc[key] = { name: key, value: 0, type: transaction.type };
        }
        acc[key].value += Number(transaction.amount);
        return acc;
      }, {}) || {};

      // Process monthly trends
      const monthlyData = historicalTransactions?.reduce((acc: any, transaction: any) => {
        const month = new Date(transaction.transaction_date).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, income: 0, expenses: 0 };
        }
        acc[month][transaction.type] += Number(transaction.amount);
        return acc;
      }, {}) || {};

      const monthlyTrends = Object.values(monthlyData).map((item: any) => ({
        ...item,
        net: item.income - item.expenses,
        monthName: new Date(item.month + '-01').toLocaleDateString('en-IN', { 
          month: 'short', 
          year: '2-digit' 
        })
      }));

      setDashboardData({
        balance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        savingsRate,
        transactions: currentMonthTransactions || [],
        categoryData: Object.values(categoryTotals),
        monthlyTrends
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilterOptions(newFilters);
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="min-h-screen bg-gray-50">
        {/* Advanced Filtering */}
        <div className="bg-white border-b border-gray-200 p-4">
          <AdvancedFiltering onFilterChange={handleFilterChange} />
        </div>

        <div className="p-6 space-y-8">
          {/* Financial Overview Cards */}
          <FinancialOverviewCards 
            balance={dashboardData.balance}
            monthlyIncome={dashboardData.monthlyIncome}
            monthlyExpenses={dashboardData.monthlyExpenses}
            savingsRate={dashboardData.savingsRate}
            onRefresh={fetchDashboardData}
          />

          {/* Primary Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <DualAxisChart 
              data={dashboardData.monthlyTrends}
              className="bg-gray-50 rounded-lg border border-gray-200"
            />
            <WaterfallChart 
              data={dashboardData}
              className="bg-gray-50 rounded-lg border border-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <InteractivePieChart 
              data={dashboardData.categoryData}
              className="bg-white rounded-lg border border-gray-200"
            />
            <BudgetDashboard 
              categoryData={dashboardData.categoryData}
              className="bg-gray-50 rounded-lg border border-gray-200"
            />
          </div>

          {/* Secondary Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <RecentTransactionsPanel 
                transactions={dashboardData.transactions}
                onRefresh={fetchDashboardData}
              />
            </div>
            <div className="space-y-6">
              <AIInsightsWidget 
                dashboardData={dashboardData}
                className="bg-gray-800 text-white rounded-lg border border-gray-200"
              />
              <QuickActionsPanel 
                onRefresh={fetchDashboardData}
                className="bg-gray-900 text-white rounded-lg border border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
