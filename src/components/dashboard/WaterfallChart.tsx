
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface WaterfallChartProps {
  data: any;
  className?: string;
}

export const WaterfallChart = ({ data = {}, className }: WaterfallChartProps) => {
  const [viewType, setViewType] = useState('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Create waterfall data structure with defaults
  const createWaterfallData = () => {
    const startingBalance = data.balance || 25000;
    const income = data.monthlyIncome || 50000;
    const expenses = data.monthlyExpenses || 35000;
    const endingBalance = startingBalance + income - expenses;

    return [
      {
        name: 'Starting Balance',
        value: startingBalance,
        cumulative: startingBalance,
        type: 'start',
        color: '#64748B'
      },
      {
        name: 'Income',
        value: income,
        cumulative: startingBalance + income,
        type: 'positive',
        color: '#10B981'
      },
      {
        name: 'Expenses',
        value: -expenses,
        cumulative: startingBalance + income - expenses,
        type: 'negative',
        color: '#EF4444'
      },
      {
        name: 'Ending Balance',
        value: endingBalance,
        cumulative: endingBalance,
        type: 'end',
        color: endingBalance > 0 ? '#3B82F6' : '#EF4444'
      }
    ];
  };

  const waterfallData = createWaterfallData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(Math.abs(data.value))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cumulative:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(data.cumulative)}
              </span>
            </div>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Cash Flow Analysis
              </CardTitle>
              <p className="text-sm text-gray-500">Monthly financial overview</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('monthly')}
              className={cn(
                "px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200",
                viewType === 'monthly' 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewType('daily')}
              className={cn(
                "px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200",
                viewType === 'daily' 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Daily
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={waterfallData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                angle={-35}
                textAnchor="end"
                height={80}
                fontWeight={500}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                fontWeight={500}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Cash Flow Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Starting</div>
                <div className="font-bold text-gray-700 text-lg">
                  {formatCurrency(waterfallData[0].value)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium">Income</div>
                <div className="font-bold text-green-700 text-lg">
                  {formatCurrency(waterfallData[1].value)}
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
                <div className="text-xs text-red-600 font-medium">Expenses</div>
                <div className="font-bold text-red-700 text-lg">
                  {formatCurrency(Math.abs(waterfallData[2].value))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-blue-600 font-medium">Net Change</div>
                <div className="font-bold text-blue-700 text-lg">
                  {formatCurrency(waterfallData[3].value)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 font-medium">Features:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Interactive</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Real-time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
