
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { AIInsightsWidget } from "@/components/dashboard/AIInsightsWidget";
import { InteractivePieChart } from "@/components/dashboard/InteractivePieChart";
import { DualAxisChart } from "@/components/dashboard/DualAxisChart";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";

const Dashboard = () => {
  const { transactions, loading } = useTransactions();

  const dashboardData = useMemo(() => {
    if (loading || !transactions) {
      return {
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        recentTransactions: [],
        categoryData: [],
        chartData: []
      };
    }

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

    // Create category data for pie chart
    const categoryData = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any[], transaction) => {
        const existing = acc.find(item => item.name === transaction.category);
        if (existing) {
          existing.value += transaction.amount;
        } else {
          acc.push({
            name: transaction.category,
            value: transaction.amount,
            type: 'expense'
          });
        }
        return acc;
      }, []);

    // Create monthly chart data
    const chartData = [
      { monthName: 'Current', income, expenses, net: balance }
    ];

    return {
      balance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      recentTransactions: transactions.slice(0, 5),
      categoryData,
      chartData
    };
  }, [transactions, loading]);

  const handleRefresh = () => {
    // Refresh functionality can be implemented here
    console.log('Refreshing dashboard data...');
  };

  if (loading) {
    return (
      <ResponsiveLayout title="Dashboard" activeTab="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Dashboard" activeTab="dashboard">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Financial Overview */}
        <FinancialOverviewCards 
          balance={dashboardData.balance}
          monthlyIncome={dashboardData.monthlyIncome}
          monthlyExpenses={dashboardData.monthlyExpenses}
          savingsRate={dashboardData.savingsRate}
          onRefresh={handleRefresh}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <InteractivePieChart data={dashboardData.categoryData} />
            <DualAxisChart data={dashboardData.chartData} />
          </div>

          {/* Right Column - Actions and Insights */}
          <div className="space-y-6">
            <QuickActionsPanel onRefresh={handleRefresh} />
            <AIInsightsWidget dashboardData={dashboardData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactionsPanel 
          transactions={dashboardData.recentTransactions}
          onRefresh={handleRefresh}
        />
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;
