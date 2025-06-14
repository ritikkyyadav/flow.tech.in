
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface DualAxisChartProps {
  data: any[];
  className?: string;
}

export const DualAxisChart = ({ data = [], className }: DualAxisChartProps) => {
  const [period, setPeriod] = useState('12months');
  const [chartType, setChartType] = useState('line');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Provide default data if no data is available
  const chartData = data.length > 0 ? data : [
    { monthName: 'Jan', income: 50000, expenses: 30000, net: 20000 },
    { monthName: 'Feb', income: 55000, expenses: 32000, net: 23000 },
    { monthName: 'Mar', income: 48000, expenses: 28000, net: 20000 },
    { monthName: 'Apr', income: 52000, expenses: 31000, net: 21000 },
    { monthName: 'May', income: 58000, expenses: 35000, net: 23000 },
    { monthName: 'Jun', income: 60000, expenses: 38000, net: 22000 }
  ];

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
                  <span className="text-sm text-gray-600 font-medium">{item.name}:</span>
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

  return (
    <Card className={cn("bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Income vs Expense Analysis
              </CardTitle>
              <p className="text-sm text-gray-500">Monthly financial trends</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32 border-gray-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="composed">Combined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 border-gray-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="monthName" 
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
                  strokeWidth={4}
                  name="Income"
                  dot={{ fill: '#10B981', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 3, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={4}
                  name="Expenses"
                  dot={{ fill: '#EF4444', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 3, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  name="Net Savings"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="monthName" 
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
                <Bar dataKey="net" fill="#3B82F6" name="Net Savings" opacity={0.8} radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={4}
                  name="Expenses"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium">Avg Income</div>
                <div className="font-bold text-green-700 text-lg">
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.income, 0) / chartData.length)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-red-600 font-medium">Avg Expenses</div>
                <div className="font-bold text-red-700 text-lg">
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.expenses, 0) / chartData.length)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-blue-600 font-medium">Avg Savings</div>
                <div className="font-bold text-blue-700 text-lg">
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.net, 0) / chartData.length)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Features */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 font-medium">Features:</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Interactive</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Exportable</span>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium">
              Export PNG
            </button>
            <button className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium">
              Export PDF
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
