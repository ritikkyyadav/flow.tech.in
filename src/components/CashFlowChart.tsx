
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, ZoomIn, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CashFlowChartProps {
  refreshTrigger: number;
}

interface ChartData {
  month: string;
  monthName: string;
  income: number;
  expense: number;
  netSavings: number;
  cumulativeBalance: number;
}

export const CashFlowChart = ({ refreshTrigger }: CashFlowChartProps) => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly');
  const [timeRange, setTimeRange] = useState('12months');

  useEffect(() => {
    if (user) {
      fetchCashFlowData();
    }
  }, [user, refreshTrigger, viewMode, timeRange]);

  const fetchCashFlowData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case '12months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          break;
        case '24months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 24, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString())
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Group transactions by month
      const monthlyData = transactions?.reduce((acc: any, transaction: any) => {
        const month = new Date(transaction.transaction_date).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          acc[month].income += Number(transaction.amount);
        } else {
          acc[month].expense += Number(transaction.amount);
        }
        
        return acc;
      }, {}) || {};

      // Convert to array and calculate cumulative balance
      let cumulativeBalance = 0;
      const chartData: ChartData[] = Object.values(monthlyData)
        .sort((a: any, b: any) => a.month.localeCompare(b.month))
        .map((item: any) => {
          const netSavings = item.income - item.expense;
          cumulativeBalance += netSavings;
          
          return {
            ...item,
            netSavings,
            cumulativeBalance,
            monthName: new Date(item.month + '-01').toLocaleDateString('en-IN', { 
              month: 'short', 
              year: '2-digit' 
            })
          };
        });

      setData(chartData);
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportChart = () => {
    // Implementation for chart export would go here
    console.log('Exporting chart...');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Cash Flow Analysis</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="monthName" 
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
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ color: '#000000' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
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
              name="Expenses"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cumulativeBalance" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Cumulative Balance"
              dot={{ fill: '#3B82F6', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Income</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.expense, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Savings</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.netSavings, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
