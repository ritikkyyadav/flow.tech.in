
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TransactionAnalyticsProps {
  refreshTrigger: number;
}

interface CategoryData {
  name: string;
  value: number;
  type: string;
  color: string;
}

interface MonthlyTrend {
  month: string;
  monthName: string;
  income: number;
  expense: number;
  net: number;
}

interface SpendingPatterns {
  avgDailySpending: number;
  highestSpendingDay: string;
  mostFrequentCategory: string;
  largestTransaction: number;
}

interface AnalyticsData {
  categoryData: {
    expense: CategoryData[];
    income: CategoryData[];
  };
  monthlyTrends: MonthlyTrend[];
  incomeVsExpense: MonthlyTrend[];
  topExpenses: CategoryData[];
  patterns: SpendingPatterns;
}

export const TransactionAnalytics = ({ refreshTrigger }: TransactionAnalyticsProps) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('last6months');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    categoryData: {
      expense: [],
      income: []
    },
    monthlyTrends: [],
    incomeVsExpense: [],
    topExpenses: [],
    patterns: {
      avgDailySpending: 0,
      highestSpendingDay: '',
      mostFrequentCategory: '',
      largestTransaction: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeframe, refreshTrigger]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'last30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'last6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'lastyear':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Process category data for pie charts
      const categoryTotals = transactions.reduce((acc: any, transaction: any) => {
        const key = `${transaction.type}_${transaction.category}`;
        if (!acc[key]) {
          acc[key] = {
            name: transaction.category,
            value: 0,
            type: transaction.type,
            color: transaction.type === 'income' ? '#10B981' : '#EF4444'
          };
        }
        acc[key].value += Number(transaction.amount);
        return acc;
      }, {});

      const expenseCategories = Object.values(categoryTotals)
        .filter((item: any) => item.type === 'expense')
        .sort((a: any, b: any) => b.value - a.value) as CategoryData[];

      const incomeCategories = Object.values(categoryTotals)
        .filter((item: any) => item.type === 'income')
        .sort((a: any, b: any) => b.value - a.value) as CategoryData[];

      // Process monthly trends
      const monthlyData = transactions.reduce((acc: any, transaction: any) => {
        const month = new Date(transaction.transaction_date).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, income: 0, expense: 0 };
        }
        acc[month][transaction.type] += Number(transaction.amount);
        return acc;
      }, {});

      const monthlyTrends = Object.values(monthlyData).map((item: any) => ({
        ...item,
        net: item.income - item.expense,
        monthName: new Date(item.month + '-01').toLocaleDateString('en-IN', { 
          month: 'short', 
          year: '2-digit' 
        })
      })) as MonthlyTrend[];

      // Process spending patterns
      const patterns: SpendingPatterns = {
        avgDailySpending: 0,
        highestSpendingDay: '',
        mostFrequentCategory: '',
        largestTransaction: 0
      };

      if (transactions.length > 0) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const days = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
        patterns.avgDailySpending = totalExpenses / days;

        // Find highest spending day
        const dailySpending = expenses.reduce((acc: any, transaction: any) => {
          const day = transaction.transaction_date.slice(0, 10);
          acc[day] = (acc[day] || 0) + Number(transaction.amount);
          return acc;
        }, {});

        const highestDay = Object.entries(dailySpending)
          .sort(([,a]: any, [,b]: any) => b - a)[0];
        
        if (highestDay) {
          patterns.highestSpendingDay = new Date(highestDay[0]).toLocaleDateString('en-IN');
        }

        // Most frequent category
        const categoryFreq = expenses.reduce((acc: any, t: any) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {});

        patterns.mostFrequentCategory = Object.entries(categoryFreq)
          .sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || '';

        patterns.largestTransaction = Math.max(...transactions.map(t => Number(t.amount)));
      }

      setData({
        categoryData: { expense: expenseCategories, income: incomeCategories },
        monthlyTrends,
        incomeVsExpense: monthlyTrends,
        topExpenses: expenseCategories.slice(0, 5),
        patterns
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Transaction Analytics</h2>
          <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Transaction Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="last3months">Last 3 Months</SelectItem>
            <SelectItem value="last6months">Last 6 Months</SelectItem>
            <SelectItem value="lastyear">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Daily Spending</p>
                <p className="text-lg font-semibold">{formatCurrency(data.patterns.avgDailySpending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Highest Spending Day</p>
                <p className="text-lg font-semibold">{data.patterns.highestSpendingDay || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-lg font-semibold">{data.patterns.mostFrequentCategory || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Largest Transaction</p>
                <p className="text-lg font-semibold">{formatCurrency(data.patterns.largestTransaction)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Income vs Expense</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income & Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} />
                  <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryData.expense}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categoryData.expense.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryData.income}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categoryData.income.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.incomeVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" />
                  <Bar dataKey="expense" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
