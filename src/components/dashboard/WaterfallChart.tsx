
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from "react";
import { cn } from "@/lib/utils";

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
        color: '#6B7280'
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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(Math.abs(data.value))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cumulative:</span>
              <span className="text-sm font-medium text-gray-900">
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
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">
            Cash Flow Analysis
          </CardTitle>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('monthly')}
              className={cn(
                "px-3 py-1 text-xs rounded",
                viewType === 'monthly' 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewType('daily')}
              className={cn(
                "px-3 py-1 text-xs rounded",
                viewType === 'daily' 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Daily
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={waterfallData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Cash Flow Summary */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Starting</div>
            <div className="font-semibold text-gray-700">
              {formatCurrency(waterfallData[0].value)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600 mb-1">Income</div>
            <div className="font-semibold text-green-700">
              {formatCurrency(waterfallData[1].value)}
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-red-600 mb-1">Expenses</div>
            <div className="font-semibold text-red-700">
              {formatCurrency(Math.abs(waterfallData[2].value))}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Net Change</div>
            <div className="font-semibold text-blue-700">
              {formatCurrency(waterfallData[3].value)}
            </div>
          </div>
        </div>

        {/* Interactive Features */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Features:</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Drill-down</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Future projection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
