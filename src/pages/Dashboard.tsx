// ========== COPY THIS ENTIRE IMPORTS SECTION ==========
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { EnhancedCategoryChart } from "@/components/dashboard/EnhancedCategoryChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";

// ADD THESE NEW IMPORTS:
import { CashFlowChart } from "@/components/CashFlowChart";
import { TransactionAnalytics } from "@/components/TransactionAnalytics";
import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";
import { 
  validateTransactions, 
  formatCurrency, 
  calculateSummaryStats 
} from "@/utils/chartDataUtils";

// ========== THEN USE THE COMPONENTS IN YOUR JSX ==========
const Dashboard = () => {
  const { transactions, loading } = useTransactions();

  // Your existing dashboardData logic can now use the utility functions:
  const dashboardData = useMemo(() => {
    if (loading || !transactions) {
      return {
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        recentTransactions: [],
        categoryData: [],
        incomeExpenseData: []
      };
    }

    // NOW YOU CAN USE THE UTILITY FUNCTIONS:
    const validTransactions = validateTransactions(transactions);
    const summaryStats = calculateSummaryStats(validTransactions);

    const income = validTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = validTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

    // Create category data for pie chart
    const categoryData = validTransactions
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

    // Create monthly income/expense data for line chart with proper typing
    const monthlyData = validTransactions.reduce((acc: Record<string, { month: string; income: number; expenses: number }>, transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += transaction.amount;
      } else {
        acc[monthKey].expenses += transaction.amount;
      }
      
      return acc;
    }, {});

    const incomeExpenseData = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    return {
      balance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      recentTransactions: validTransactions.slice(0, 5),
      categoryData,
      incomeExpenseData,
      summaryStats // Add this for use in other components
    };
  }, [transactions, loading]);

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...');
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
        {/* Modern Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <FinancialOverviewCards 
            balance={dashboardData.balance}
            monthlyIncome={dashboardData.monthlyIncome}
            monthlyExpenses={dashboardData.monthlyExpenses}
            savingsRate={dashboardData.savingsRate}
            onRefresh={handleRefresh}
          />
        </div>

        {/* ADD THE NEW CHART COMPONENTS WITH ERROR BOUNDARIES */}
        
        {/* Cash Flow Chart */}
        <ChartErrorBoundary fallbackTitle="Cash Flow Chart Error">
          <CashFlowChart />
        </ChartErrorBoundary>

        {/* Transaction Analytics */}
        <ChartErrorBoundary fallbackTitle="Transaction Analytics Error">
          <TransactionAnalytics />
        </ChartErrorBoundary>

        {/* Income vs Expense Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <ChartErrorBoundary fallbackTitle="Income vs Expense Chart Error">
            <IncomeExpenseChart 
              data={dashboardData.incomeExpenseData}
              loading={loading}
              className="border-0 shadow-none"
            />
          </ChartErrorBoundary>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enhanced Category Chart */}
          <div className="lg:col-span-2">
            <ChartErrorBoundary fallbackTitle="Category Chart Error">
              <EnhancedCategoryChart 
                data={transactions}
                className="shadow-sm border-gray-100 rounded-2xl bg-white overflow-hidden"
              />
            </ChartErrorBoundary>
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
