
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryData, ChartDataService } from '@/services/chartDataService';
import { PieChart as PieChartIcon } from 'lucide-react';

interface FixedCategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
  className?: string;
}

export const FixedCategoryChart: React.FC<FixedCategoryChartProps> = ({ 
  data, 
  loading = false, 
  className = "" 
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const total = React.useMemo(() => data.reduce((sum, d) => sum + (d.value || 0), 0), [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      const percent = total ? ((p.value as number) / total) * 100 : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <p className="font-medium text-gray-900">{p.name}</p>
          </div>
          <p className="text-sm text-gray-700 mt-1">{ChartDataService.formatIndianCurrency(p.value as number)}</p>
          <p className="text-xs text-gray-500">{percent.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <span>Expense Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading category data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <span>Expense Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <PieChartIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No expense data available</p>
              <p className="text-gray-400 text-sm">Add some expense transactions to see category breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="w-5 h-5 text-purple-600" />
          <span>Expense Categories</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Breakdown by spending category</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={index === activeIndex ? '#111827' : '#fff'}
                      strokeWidth={index === activeIndex ? 2 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-6">
            <div className="space-y-3">
              {data.map((category, index) => (
                <button
                  type="button"
                  key={index}
                  className={`flex items-center justify-between w-full px-2 py-2 rounded-md border ${index === activeIndex ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {ChartDataService.formatIndianCurrency(category.value)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
