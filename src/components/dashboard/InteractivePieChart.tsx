
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InteractivePieChartProps {
  data: any[];
  className?: string;
}

export const InteractivePieChart = ({ data = [], className }: InteractivePieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Vibrant color spectrum for categories
  const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', 
    '#22C55E', '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];

  // Provide default data if no data available
  const defaultData = [
    { name: 'Food & Dining', value: 15000, type: 'expense' },
    { name: 'Transportation', value: 8000, type: 'expense' },
    { name: 'Utilities', value: 5000, type: 'expense' },
    { name: 'Entertainment', value: 3000, type: 'expense' },
    { name: 'Healthcare', value: 2000, type: 'expense' },
    { name: 'Shopping', value: 4000, type: 'expense' }
  ];

  // Process expense data only
  const expenseData = data.length > 0 ? data.filter(item => item.type === 'expense') : defaultData;
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

  // Add percentage and color to data
  const chartData = expenseData.map((item, index) => ({
    ...item,
    percentage: totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : '0',
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">
            Category Spending Breakdown
          </CardTitle>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSubcategories(!showSubcategories)}
              className={cn(
                "px-3 py-1 text-xs rounded",
                showSubcategories 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Subcategories
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center">
          {/* Pie Chart */}
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={activeIndex === index ? '#000' : 'none'}
                      strokeWidth={activeIndex === index ? 2 : 0}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend */}
          <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-6">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {chartData
                .sort((a, b) => b.value - a.value)
                .map((category, index) => (
                <div 
                  key={category.name}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                    activeIndex === index 
                      ? "bg-gray-50 border-gray-300 shadow-sm" 
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.percentage}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(category.value)}
                    </div>
                    {index < 3 && (
                      <div className="text-xs text-orange-600 font-medium">
                        Top {index + 1}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Total Categories</div>
            <div className="font-semibold text-gray-700">{chartData.length}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Largest Category</div>
            <div className="font-semibold text-gray-700">
              {chartData.length > 0 ? chartData[0].name : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Total Expenses</div>
            <div className="font-semibold text-gray-700">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
