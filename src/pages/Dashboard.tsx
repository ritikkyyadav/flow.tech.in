
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertCircle } from "lucide-react";

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
        categoryData: []
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
            value: transaction.amount
          });
        }
        return acc;
      }, []);

    return {
      balance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      recentTransactions: transactions.slice(0, 5),
      categoryData
    };
  }, [transactions, loading]);

  const handleRefresh = () => {
    console.log('Refreshing dashboard data...');
  };

  // Modern color palette
  const COLORS = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = dashboardData.categoryData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-bold text-gray-900">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
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

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Modern Pie Chart */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-100 rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {dashboardData.categoryData.length > 0 ? (
                  <div className="bg-white">
                    {/* Main Chart Container */}
                    <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12">
                      {/* Pie Chart */}
                      <div className="relative">
                        <div className="w-80 h-80 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={dashboardData.categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1000}
                                strokeWidth={3}
                                stroke="#ffffff"
                              >
                                {dashboardData.categoryData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]}
                                    className="hover:opacity-80 transition-opacity duration-300 drop-shadow-sm"
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Center Label - Largest Category */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              {dashboardData.categoryData.length > 0 && (
                                <>
                                  <div className="text-xl font-bold text-gray-900 mb-1">
                                    {dashboardData.categoryData.sort((a, b) => b.value - a.value)[0]?.name}
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {formatCurrency(dashboardData.categoryData.sort((a, b) => b.value - a.value)[0]?.value)}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    ({((dashboardData.categoryData.sort((a, b) => b.value - a.value)[0]?.value / dashboardData.monthlyExpenses) * 100).toFixed(1)}%)
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Amount Display */}
                        <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(dashboardData.monthlyExpenses)}
                            </div>
                            <div className="text-xs text-gray-500">Total Expenses</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div className="mt-12">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {dashboardData.categoryData
                          .sort((a, b) => b.value - a.value)
                          .map((category, index) => {
                            const percentage = dashboardData.monthlyExpenses > 0 ? 
                              ((category.value / dashboardData.monthlyExpenses) * 100).toFixed(1) : '0';
                            
                            return (
                              <div 
                                key={category.name}
                                className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-sm truncate">
                                    {category.name}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500 font-medium">
                                      {percentage}%
                                    </span>
                                    <span className="text-xs font-bold text-gray-700">
                                      {formatCurrency(category.value)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No expense data available</p>
                    <p className="text-sm">Add some transactions to see your expense breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
    </ResponsiveLayout>
  );
};

export default Dashboard;
