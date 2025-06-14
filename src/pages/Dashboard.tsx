
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { useTransactions } from "@/contexts/TransactionContext";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";

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
        chartData: [],
        monthlyTrend: []
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

    // Create monthly trend data
    const monthlyTrend = [
      { month: 'Jan', income: income * 0.8, expenses: expenses * 0.9, savings: (income * 0.8) - (expenses * 0.9) },
      { month: 'Feb', income: income * 0.9, expenses: expenses * 0.8, savings: (income * 0.9) - (expenses * 0.8) },
      { month: 'Mar', income: income, expenses: expenses, savings: balance },
    ];

    // Create chart data
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
      chartData,
      monthlyTrend
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
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Monthly Trend Chart */}
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Financial Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#00C49F" 
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#FF8042" 
                      fillOpacity={1} 
                      fill="url(#colorExpenses)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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

          {/* Right Column - Actions and Insights */}
          <div className="space-y-6">
            <QuickActionsPanel onRefresh={handleRefresh} />
            
            {/* Enhanced AI Insights Widget */}
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    {dashboardData.savingsRate > 20 ? (
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Savings Performance</h4>
                      <p className="text-sm text-blue-800">
                        Your savings rate is {dashboardData.savingsRate.toFixed(1)}%
                        {dashboardData.savingsRate > 20 ? ' - Excellent job!' : 
                         dashboardData.savingsRate > 10 ? ' - Good progress!' : 
                         ' - Consider reducing expenses'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Monthly Summary</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>Income: ₹{dashboardData.monthlyIncome.toLocaleString()}</p>
                    <p>Expenses: ₹{dashboardData.monthlyExpenses.toLocaleString()}</p>
                    <p className="font-medium">Net: ₹{dashboardData.balance.toLocaleString()}</p>
                  </div>
                </div>

                {dashboardData.categoryData.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Top Expense Category</h4>
                    <p className="text-sm text-purple-800">
                      {dashboardData.categoryData[0]?.name}: ₹{dashboardData.categoryData[0]?.value.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Health Score */}
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    dashboardData.savingsRate > 20 ? 'text-green-600' : 
                    dashboardData.savingsRate > 10 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {dashboardData.savingsRate > 20 ? 'A+' : 
                     dashboardData.savingsRate > 10 ? 'B' : 'C'}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {dashboardData.savingsRate > 20 ? 'Excellent financial health' : 
                     dashboardData.savingsRate > 10 ? 'Good financial progress' : 'Room for improvement'}
                  </p>
                </div>
              </CardContent>
            </Card>
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
