
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface CustomPieChartProps {
  data: Array<{
    name: string;
    value: number;
    type?: string;
  }>;
  className?: string;
}

export const CustomPieChart = ({ data = [], className }: CustomPieChartProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter expense data and calculate totals
  const expenseData = data.filter(item => item.type === 'expense' || !item.type);
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  
  if (expenseData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No expense data available</p>
            <p className="text-sm">Add some transactions to see your expense breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by value and get top 6 categories
  const sortedData = expenseData
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Calculate percentages and angles
  const chartData = sortedData.map((item, index) => {
    const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
    const angle = (percentage / 100) * 360;
    return {
      ...item,
      percentage: percentage.toFixed(1),
      angle,
      color: getColorForIndex(index)
    };
  });

  // Calculate cumulative angles for positioning
  let cumulativeAngle = 0;
  const slices = chartData.map((item, index) => {
    const startAngle = cumulativeAngle;
    cumulativeAngle += item.angle;
    return {
      ...item,
      startAngle,
      rotation: startAngle
    };
  });

  const largestCategory = chartData[0];

  return (
    <Card className={className}>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800 text-center">
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center">
          {/* Pie Chart Container */}
          <div className="relative mb-8">
            <div className="pie-chart-container relative">
              <svg width="300" height="300" className="transform -rotate-90">
                {slices.map((slice, index) => {
                  const radius = 120;
                  const centerX = 150;
                  const centerY = 150;
                  const startAngleRad = (slice.startAngle * Math.PI) / 180;
                  const endAngleRad = ((slice.startAngle + slice.angle) * Math.PI) / 180;
                  
                  const x1 = centerX + radius * Math.cos(startAngleRad);
                  const y1 = centerY + radius * Math.sin(startAngleRad);
                  const x2 = centerX + radius * Math.cos(endAngleRad);
                  const y2 = centerY + radius * Math.sin(endAngleRad);
                  
                  const largeArcFlag = slice.angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');

                  return (
                    <path
                      key={slice.name}
                      d={pathData}
                      fill={slice.color}
                      className={`transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isVisible ? 'animate-fade-in' : 'opacity-0'
                      }`}
                      style={{
                        animationDelay: `${index * 0.2}s`,
                        transformOrigin: '150px 150px'
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-700 truncate px-2">
                    {largestCategory?.name}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amount Display */}
            <div className="absolute -top-8 -right-8 bg-white rounded-full px-4 py-3 shadow-lg border">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 mb-0">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-xs text-pink-500 mb-0">
                  ({largestCategory?.percentage}%)
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
            {chartData.map((category, index) => (
              <div 
                key={category.name}
                className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 ${
                  isVisible ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${2 + index * 0.2}s` }}
              >
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0 transition-transform duration-300 hover:scale-110" 
                  style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {formatCurrency(category.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </Card>
  );
};

function getColorForIndex(index: number): string {
  const colors = [
    '#FF6B9D', // Pink
    '#4ECDC4', // Teal
    '#FFB347', // Orange
    '#45B7D1', // Blue
    '#9B59B6', // Purple
    '#E74C3C'  // Red
  ];
  return colors[index % colors.length];
}
