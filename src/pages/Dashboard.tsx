
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
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        recentTransactions: []
      };
    }

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      recentTransactions: transactions.slice(0, 5)
    };
  }, [transactions, loading]);

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
          totalIncome={dashboardData.totalIncome}
          totalExpenses={dashboardData.totalExpenses}
          netBalance={dashboardData.netBalance}
          transactionCount={transactions?.length || 0}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <InteractivePieChart transactions={transactions || []} />
            <DualAxisChart transactions={transactions || []} />
          </div>

          {/* Right Column - Actions and Insights */}
          <div className="space-y-6">
            <QuickActionsPanel />
            <AIInsightsWidget transactions={transactions || []} />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactionsPanel 
          transactions={dashboardData.recentTransactions}
        />
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;
