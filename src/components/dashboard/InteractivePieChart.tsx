
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PieChart as PieChartIcon, Target, TrendingUp } from "lucide-react";

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

  // Enhanced color palette with gradients
  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055', '#00B894'
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
    <Card className={cn("bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Category Spending Breakdown
              </CardTitle>
              <p className="text-sm text-gray-500">Expense distribution analysis</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSubcategories(!showSubcategories)}
              className={cn(
                "px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200",
                showSubcategories 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Subcategories
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Enhanced Pie Chart */}
          <div className="w-full lg:w-1/2 relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={activeIndex === index ? '#000' : 'none'}
                      strokeWidth={activeIndex === index ? 3 : 0}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="text-sm text-gray-500 font-medium">Total Expenses</div>
              </div>
            </div>
          </div>

          {/* Enhanced Category Legend */}
          <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-8">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {chartData
                .sort((a, b) => b.value - a.value)
                .map((category, index) => (
                <div 
                  key={category.name}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    activeIndex === index 
                      ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-md transform scale-[1.02]" 
                      : "border-gray-200 hover:bg-gray-50 hover:shadow-sm"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {category.percentage}% of total spending
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {formatCurrency(category.value)}
                    </div>
                    {index < 3 && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-orange-600" />
                        <div className="text-xs text-orange-600 font-medium">
                          Top {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-purple-600 font-medium">Total Categories</div>
                <div className="font-bold text-purple-700 text-lg">{chartData.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-orange-600 font-medium">Largest Category</div>
                <div className="font-bold text-orange-700 text-sm">
                  {chartData.length > 0 ? chartData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium">Total Expenses</div>
                <div className="font-bold text-green-700 text-lg">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
