
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface IncomeExpenseChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  className?: string;
  loading?: boolean;
}

export const IncomeExpenseChart = ({ data = [], className, loading = false }: IncomeExpenseChartProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate sample data if no data provided
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', income: 50000, expenses: 35000 },
    { month: 'Feb', income: 55000, expenses: 38000 },
    { month: 'Mar', income: 52000, expenses: 42000 },
    { month: 'Apr', income: 58000, expenses: 39000 },
    { month: 'May', income: 60000, expenses: 45000 },
    { month: 'Jun', income: 62000, expenses: 41000 },
  ];

  // Calculate totals and trends
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const avgIncome = totalIncome / chartData.length;
  const avgExpenses = totalExpenses / chartData.length;

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
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            {payload.length === 2 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between space-x-4">
                  <span className="text-sm text-gray-600 font-medium">Net:</span>
                  <span className={`text-sm font-bold ${
                    payload[0].value - payload[1].value >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(payload[0].value - payload[1].value)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Income vs Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Income vs Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <TrendingUp className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No financial data available</p>
            <p className="text-sm">Add some transactions to see your income vs expense trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Income vs Expenses</span>
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last 6 months</p>
            <p className={`text-sm font-semibold ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net: {formatCurrency(netSavings)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Chart */}
        <div className={`h-80 mb-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                fontWeight={500}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Income"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                animationDuration={1500}
                animationBegin={300}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Expenses"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#EF4444', strokeWidth: 2, fill: '#fff' }}
                animationDuration={1500}
                animationBegin={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 transition-all duration-500 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Avg Income</div>
                <div className="font-bold text-green-700 text-lg">
                  {formatCurrency(avgIncome)}
                </div>
              </div>
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-red-600 font-medium uppercase tracking-wide">Avg Expenses</div>
                <div className="font-bold text-red-700 text-lg">
                  {formatCurrency(avgExpenses)}
                </div>
              </div>
            </div>
          </div>
          
          <div className={`bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${netSavings >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                {netSavings >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className={`text-xs font-medium uppercase tracking-wide ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net Savings
                </div>
                <div className={`font-bold text-lg ${netSavings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(netSavings)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
