
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { InteractivePieChart } from "@/components/dashboard/InteractivePieChart";
import { WaterfallChart } from "@/components/dashboard/WaterfallChart";
import { BudgetDashboard } from "@/components/dashboard/BudgetDashboard";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { RecentTransactions } from "@/components/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw, TrendingUp, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    balance: 45000,
    monthlyIncome: 75000,
    monthlyExpenses: 30000,
    savingsRate: 60,
    categoryData: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch transactions for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', `${currentMonth}-01`)
        .lt('transaction_date', `${currentMonth}-32`);

      if (transactions) {
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        // Group expenses by category
        const categoryData = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            const category = acc.find(c => c.name === t.category);
            if (category) {
              category.value += t.amount;
            } else {
              acc.push({ name: t.category, value: t.amount, type: 'expense' });
            }
            return acc;
          }, [] as any[]);

        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        setDashboardData({
          balance: dashboardData.balance + income - expenses,
          monthlyIncome: income,
          monthlyExpenses: expenses,
          savingsRate: Math.max(0, savingsRate),
          categoryData
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Track your finances and make informed decisions</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* Financial Overview Cards */}
          <FinancialOverviewCards
            balance={dashboardData.balance}
            monthlyIncome={dashboardData.monthlyIncome}
            monthlyExpenses={dashboardData.monthlyExpenses}
            savingsRate={dashboardData.savingsRate}
            onRefresh={handleRefresh}
          />

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="xl:col-span-2 space-y-6">
              {/* Cash Flow Analysis */}
              <WaterfallChart data={dashboardData} />
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
                <QuickActionsPanel onRefresh={handleRefresh} />
              </div>
            </div>
          </div>

          {/* Second Row Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Spending Breakdown */}
            <InteractivePieChart data={dashboardData.categoryData} />
            
            {/* Budget Performance */}
            <BudgetDashboard categoryData={dashboardData.categoryData} />
          </div>

          {/* Recent Activity */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Recent Transactions
                    </CardTitle>
                    <p className="text-sm text-gray-500">Your latest financial activity</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <RecentTransactions refreshTrigger={refreshTrigger} limit={10} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
