
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
            value: transaction.amount,
            color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][acc.length % 5]
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            {/* Expense Categories Pie Chart */}
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {dashboardData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
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
