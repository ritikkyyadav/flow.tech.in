
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnhancedFinancialOverviewCards } from "@/components/dashboard/EnhancedFinancialOverviewCards";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { FixedCategoryChart } from "@/components/dashboard/FixedCategoryChart";
import { FixedIncomeExpenseChart } from "@/components/dashboard/FixedIncomeExpenseChart";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";
import { ChartDataService } from "@/services/chartDataService";

const Dashboard = () => {
  const { transactions, loading } = useTransactions();

  const dashboardData = useMemo(() => {
    if (loading || !transactions) {
      return {
        metrics: {
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          incomeChange: 0,
          expenseChange: 0,
          savingsRate: 0
        },
        recentTransactions: [],
        categoryData: [],
        incomeExpenseData: []
      };
    }

    const metrics = ChartDataService.calculateMetrics(transactions);
    const categoryData = ChartDataService.prepareCategoryData(transactions);
    const incomeExpenseData = ChartDataService.prepareIncomeExpenseData(transactions);

    return {
      metrics,
      recentTransactions: transactions.slice(0, 5),
      categoryData,
      incomeExpenseData
    };
  }, [transactions, loading]);

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...');
    // Force re-render by updating the component state
    window.location.reload();
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Enhanced Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <EnhancedFinancialOverviewCards 
            metrics={dashboardData.metrics}
            loading={loading}
          />
        </div>

        {/* Income vs Expense Chart */}
        <FixedIncomeExpenseChart 
          data={dashboardData.incomeExpenseData}
          loading={loading}
          className="shadow-sm border-gray-100 rounded-2xl bg-white overflow-hidden"
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enhanced Category Chart */}
          <div className="lg:col-span-2">
            <FixedCategoryChart 
              data={dashboardData.categoryData}
              loading={loading}
              className="shadow-sm border-gray-100 rounded-2xl bg-white overflow-hidden"
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <QuickActionsPanel onRefresh={handleRefresh} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <RecentTransactionsPanel 
            transactions={dashboardData.recentTransactions}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
