import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Replaced Select with preset buttons + custom slider
import { Slider } from '@/components/ui/slider';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
interface ChartData {
  key: string; // grouping key (YYYY-MM-DD | YYYY-Www | YYYY-MM)
  label: string; // X-axis label
  income: number;
  expense: number;
  netSavings: number;
  cumulativeBalance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  user_id: string;
}

// Error Boundary Component
class ChartErrorBoundary extends React.Component<
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
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p>Unable to load cash flow chart.</p>
              <p className="text-sm mt-1">Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Data validation functions
const validateChartData = (data: any[]): ChartData[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    return item && 
           typeof item === 'object' && 
           !isNaN(parseFloat(item.income || 0)) &&
           !isNaN(parseFloat(item.expense || 0)) &&
           item.month &&
           item.monthName;
  });
};

const sanitizeNumericValue = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const validateTransactions = (transactions: any[]): Transaction[] => {
  if (!Array.isArray(transactions)) return [];
  
  return transactions.filter(transaction => {
    return transaction &&
           typeof transaction === 'object' &&
           transaction.id &&
           !isNaN(parseFloat(transaction.amount)) &&
           ['income', 'expense'].includes(transaction.type) &&
           transaction.transaction_date &&
           transaction.user_id;
  });
};

export const CashFlowChart: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // timeRange: 1d, 7d, 1m, 6m, 12m, 1y, custom
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '1m' | '6m' | '12m' | '1y' | 'custom'>('6m');
  const [customDays, setCustomDays] = useState<number>(30);

  // Custom tooltip component
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
                  <span className="text-sm text-gray-600 font-medium capitalize">
                    {item.dataKey === 'netSavings' ? 'Net Savings' : 
                     item.dataKey === 'cumulativeBalance' ? 'Cumulative Balance' : 
                     item.dataKey}:
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Fetch cash flow data with proper error handling
  const fetchCashFlowData = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
  // Calculate date range based on selection
  const endDate = new Date();
  const startDate = new Date();
  if (timeRange === '1d') startDate.setDate(endDate.getDate() - 1);
  else if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
  else if (timeRange === '1m') startDate.setMonth(endDate.getMonth() - 1);
  else if (timeRange === '6m') startDate.setMonth(endDate.getMonth() - 6);
  else if (timeRange === '12m' || timeRange === '1y') startDate.setMonth(endDate.getMonth() - 12);
  else if (timeRange === 'custom') startDate.setDate(endDate.getDate() - Math.max(1, Math.min(365, customDays)));

  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Decide grouping granularity
  const groupMode: 'day' | 'week' | 'month' = dayDiff <= 31 ? 'day' : (dayDiff <= 180 ? 'week' : 'month');

      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching cash flow data:', fetchError);
        throw new Error(`Failed to fetch cash flow data: ${fetchError.message}`);
      }

      // Validate and process transactions
      const validTransactions = validateTransactions(transactions || []);

      if (validTransactions.length === 0) {
        setData([]);
        return;
      }

      // Group transactions by selected granularity
      const grouped: Record<string, { date: Date; income: number; expense: number; label: string }> = validTransactions.reduce((acc, transaction: Transaction) => {
        try {
          const date = new Date(transaction.transaction_date);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date:', transaction.transaction_date);
            return acc;
          }

          let key = '';
          let label = '';
          const amount = sanitizeNumericValue(transaction.amount);

          if (groupMode === 'day') {
            key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          } else if (groupMode === 'week') {
            // ISO week number
            const tmp = new Date(date);
            const dayNum = (tmp.getUTCDay() + 6) % 7; // 0=Mon
            tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
            const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
            const week = 1 + Math.round(((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
            key = `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
            label = `W${String(week).padStart(2, '0')} ${String(tmp.getUTCFullYear()).slice(2)}`;
          } else {
            key = date.toISOString().slice(0, 7); // YYYY-MM
            label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          }

          if (!acc[key]) {
            acc[key] = { date, income: 0, expense: 0, label };
          }
          if (transaction.type === 'income') acc[key].income += amount;
          else if (transaction.type === 'expense') acc[key].expense += amount;
          return acc;
        } catch (error) {
          console.warn('Error processing transaction:', transaction, error);
          return acc;
        }
      }, {} as Record<string, { date: Date; income: number; expense: number; label: string }>);

      // Convert to array and calculate cumulative balance
      let cumulativeBalance = 0;
      const chartData: ChartData[] = Object.entries(grouped)
        .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
        .map(([key, item]) => {
          const income = sanitizeNumericValue(item.income);
          const expense = sanitizeNumericValue(item.expense);
          const netSavings = income - expense;
          cumulativeBalance += netSavings;
          return { key, label: item.label, income, expense, netSavings, cumulativeBalance };
        });

      // Validate final data
      const validChartData = validateChartData(chartData);
      setData(validChartData);

    } catch (error: any) {
      console.error('Error in fetchCashFlowData:', error);
      setError(error.message || 'Failed to fetch cash flow data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect with proper cleanup
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchCashFlowData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, timeRange, customDays]); // Dependencies for re-fetching

  // Format currency function
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Export chart function
  const exportChart = () => {
    try {
      const csvContent = [
        'Month,Income,Expense,Net Savings,Cumulative Balance',
        ...data.map(item => 
          `${item.label},${item.income},${item.expense},${item.netSavings},${item.cumulativeBalance}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash-flow-${timeRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        avgMonthlyIncome: 0,
        avgMonthlyExpense: 0
      };
    }

    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
    const netSavings = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      avgMonthlyIncome: totalIncome / data.length,
      avgMonthlyExpense: totalExpense / data.length
    };
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading cash flow data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-red-500">
              <TrendingDown className="w-8 h-8 mx-auto mb-2" />
              <p>Error loading cash flow data</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={fetchCashFlowData}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>No transaction data available</p>
              <p className="text-sm mt-1">Add some transactions to see your cash flow</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Income vs Expenses Trend</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {/* Preset range buttons */}
              <div className="hidden md:flex items-center gap-1">
                {[
                  { id: '1d', label: '1D' },
                  { id: '7d', label: '1W' },
                  { id: '1m', label: '1M' },
                  { id: '6m', label: '6M' },
                  { id: '12m', label: '12M' },
                  { id: '1y', label: '1Y' },
                  { id: 'custom', label: 'Custom' },
                ].map(p => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant={timeRange === (p.id as any) ? 'default' : 'outline'}
                    onClick={() => setTimeRange(p.id as any)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={exportChart}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Custom slider visible when custom selected */}
          {timeRange === 'custom' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Range</span>
                <span className="font-medium">{customDays} day{customDays > 1 ? 's' : ''}</span>
              </div>
              <div className="px-1">
                <Slider
                  value={[customDays]}
                  min={1}
                  max={365}
                  step={1}
                  onValueChange={(v) => setCustomDays(v[0])}
                />
              </div>
              <div className="text-xs text-muted-foreground">Drag to adjust 1–365 days</div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-green-600 font-medium">Total Income</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(summaryStats.totalIncome)}
              </p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-red-600 font-medium">Total Expense</p>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(summaryStats.totalExpense)}
              </p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-blue-600 font-medium">Net Savings</p>
              <p className={`text-lg font-bold ${summaryStats.netSavings >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatCurrency(summaryStats.netSavings)}
              </p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-purple-600 font-medium">Final Balance</p>
              <p className="text-lg font-bold text-purple-700">
                {formatCurrency(data[data.length - 1]?.cumulativeBalance || 0)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
      <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
        dataKey="label" 
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Income and Expense Bars */}
              <Bar 
                yAxisId="left"
                dataKey="income" 
                fill="#10B981" 
                name="Income"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                yAxisId="left"
                dataKey="expense" 
                fill="#EF4444" 
                name="Expense"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Cumulative Balance Line */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cumulativeBalance" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                name="Cumulative Balance"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
};
