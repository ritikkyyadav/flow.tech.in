import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  DollarSign, 
  Calendar, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  description?: string;
  user_id: string;
}

interface AnalyticsData {
  patterns: {
    avgDailySpending: number;
    highestSpendingDay: string;
    mostFrequentCategory: string;
    largestTransaction: number;
    totalTransactions: number;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
    net: number;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
    dayOfWeek: string;
  }>;
}

// Error Boundary
class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p>Unable to load transaction analytics.</p>
              <p className="text-sm mt-1">Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Color scheme for charts
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

// Data validation functions
const validateTransactions = (transactions: any[]): Transaction[] => {
  if (!Array.isArray(transactions)) return [];
  
  return transactions.filter(transaction => {
    return transaction &&
           typeof transaction === 'object' &&
           transaction.id &&
           !isNaN(parseFloat(transaction.amount)) &&
           ['income', 'expense'].includes(transaction.type) &&
           transaction.transaction_date &&
           transaction.category &&
           transaction.user_id;
  });
};

const sanitizeNumericValue = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export const TransactionAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    patterns: {
      avgDailySpending: 0,
      highestSpendingDay: '',
      mostFrequentCategory: '',
      largestTransaction: 0,
      totalTransactions: 0,
      savingsRate: 0
    },
    categoryBreakdown: [],
    monthlyTrends: [],
    dailySpending: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 mb-3">{label}</p>
          <div className="space-y-2">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 font-medium capitalize">{item.dataKey}:</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 mb-3">{data.name}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-bold text-gray-900">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Fetch and analyze transaction data
  const fetchAnalyticsData = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '12months':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        case 'thisyear':
          startDate.setMonth(0);
          startDate.setDate(1);
          break;
        case 'lastyear':
          startDate.setFullYear(endDate.getFullYear() - 1);
          startDate.setMonth(0);
          startDate.setDate(1);
          endDate.setFullYear(endDate.getFullYear() - 1);
          endDate.setMonth(11);
          endDate.setDate(31);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch transactions: ${fetchError.message}`);
      }

      const validTransactions = validateTransactions(transactions || []);

      if (validTransactions.length === 0) {
        setData({
          patterns: {
            avgDailySpending: 0,
            highestSpendingDay: '',
            mostFrequentCategory: '',
            largestTransaction: 0,
            totalTransactions: 0,
            savingsRate: 0
          },
          categoryBreakdown: [],
          monthlyTrends: [],
          dailySpending: []
        });
        return;
      }

      // Analyze patterns
      const expenses = validTransactions.filter(t => t.type === 'expense');
      const income = validTransactions.filter(t => t.type === 'income');
      
      const totalExpenses = expenses.reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);
      const totalIncome = income.reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);
      
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const avgDailySpending = daysDiff > 0 ? totalExpenses / daysDiff : 0;
      
      // Find highest spending day with proper typing
      const dailySpendingMap: Record<string, { date: string; amount: number; dayOfWeek: string }> = {};
      
      expenses.forEach(transaction => {
        const date = transaction.transaction_date;
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        
        if (!dailySpendingMap[date]) {
          dailySpendingMap[date] = { date, amount: 0, dayOfWeek };
        }
        dailySpendingMap[date].amount += sanitizeNumericValue(transaction.amount);
      });

      const dailySpendingArray = Object.values(dailySpendingMap);
      const highestSpendingDay = dailySpendingArray.reduce((max, day) => 
        day.amount > max.amount ? day : max, 
        { amount: 0, dayOfWeek: 'N/A' }
      );

      // Category breakdown
      const categoryData: Record<string, number> = {};
      expenses.forEach(transaction => {
        const category = transaction.category || 'Other';
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += sanitizeNumericValue(transaction.amount);
      });

      const categoryBreakdown = Object.entries(categoryData)
        .map(([name, value], index) => ({
          name,
          value: sanitizeNumericValue(value),
          percentage: totalExpenses > 0 ? (sanitizeNumericValue(value) / totalExpenses) * 100 : 0,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);

      // Most frequent category
      const categoryFrequency: Record<string, number> = {};
      expenses.forEach(transaction => {
        const category = transaction.category || 'Other';
        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
      });

      const mostFrequentCategory = Object.entries(categoryFrequency).reduce(
        (max, [category, count]) => 
          count > max.count ? { category, count } : max,
        { category: 'N/A', count: 0 }
      ).category;

      // Largest transaction
      const largestTransaction = validTransactions.reduce(
        (max, transaction) => Math.max(max, sanitizeNumericValue(transaction.amount)), 
        0
      );

      // Monthly trends with proper typing
      const monthlyDataMap: Record<string, { month: string; income: number; expense: number; net: number }> = {};
      
      validTransactions.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyDataMap[monthKey]) {
          monthlyDataMap[monthKey] = { month: monthName, income: 0, expense: 0, net: 0 };
        }
        
        const amount = sanitizeNumericValue(transaction.amount);
        if (transaction.type === 'income') {
          monthlyDataMap[monthKey].income += amount;
        } else {
          monthlyDataMap[monthKey].expense += amount;
        }
        monthlyDataMap[monthKey].net = monthlyDataMap[monthKey].income - monthlyDataMap[monthKey].expense;
      });

      const monthlyTrends = Object.values(monthlyDataMap).sort((a, b) => 
        a.month.localeCompare(b.month)
      );

      // Savings rate
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      setData({
        patterns: {
          avgDailySpending,
          highestSpendingDay: highestSpendingDay.dayOfWeek,
          mostFrequentCategory,
          largestTransaction,
          totalTransactions: validTransactions.length,
          savingsRate
        },
        categoryBreakdown,
        monthlyTrends,
        dailySpending: dailySpendingArray
      });

    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      setError(error.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Effect with cleanup
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchAnalyticsData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, timeRange, refreshTrigger]);

  // Export data function
  const exportData = () => {
    try {
      const csvContent = [
        'Category,Amount,Percentage',
        ...data.categoryBreakdown.map(item => 
          `${item.name},${item.value},${item.percentage.toFixed(2)}%`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-analytics-${timeRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Transaction Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading analytics data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Transaction Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-red-500">
              <TrendingDown className="w-8 h-8 mx-auto mb-2" />
              <p>Error loading analytics data</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={refreshData}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Transaction Analytics</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                    <SelectItem value="thisyear">This Year</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-sm text-gray-600">Savings Rate</p>
                  <p className={`text-lg font-semibold ${
                    data.patterns.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.patterns.savingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
            <TabsTrigger value="patterns">Spending Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {data.monthlyTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stackId="1" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                        name="Income"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stackId="2" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                        name="Expense"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                      <p>No trend data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percentage }) => 
                            percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ''
                          }
                          labelLine={false}
                        >
                          {data.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Target className="w-8 h-8 mx-auto mb-2" />
                        <p>No category data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.categoryBreakdown.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6B7280"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]}
                        >
                          {data.categoryBreakdown.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Target className="w-8 h-8 mx-auto mb-2" />
                        <p>No category data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                {data.dailySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.dailySpending.slice(-30)}> {/* Show last 30 days */}
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => new Date(value).getDate().toString()}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Daily Spending"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2" />
                      <p>No daily spending data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnalyticsErrorBoundary>
  );
};
