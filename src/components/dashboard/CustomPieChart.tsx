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

  // Calculate percentages and create chart data
  const chartData = sortedData.map((item, index) => {
    const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
    return {
      ...item,
      percentage: percentage.toFixed(1),
      color: getColorForIndex(index)
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
              <div className="pie-chart">
                {chartData.map((slice, index) => {
                  const rotation = chartData
                    .slice(0, index)
                    .reduce((sum, item) => sum + (parseFloat(item.percentage) * 3.6), 0);
                  
                  return (
                    <div
                      key={slice.name}
                      className={`slice slice${index + 1}`}
                      style={{
                        '--rotation': `${rotation}deg`,
                        '--percentage': `${parseFloat(slice.percentage) * 3.6}deg`,
                        '--color': slice.color,
                        animationDelay: `${index * 0.2}s`
                      } as React.CSSProperties}
                    >
                      <div className="slice-inner"></div>
                    </div>
                  );
                })}
                <div className="chart-center">
                  {largestCategory?.name}
                </div>
              </div>
              
              {/* Amount Display */}
              <div className="amount-display">
                <p className="amount">{formatCurrency(totalExpenses)}</p>
                <p className="percentage">({largestCategory?.percentage}%)</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="legend">
            {chartData.map((category, index) => (
              <div 
                key={category.name}
                className={`legend-item ${
                  isVisible ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${2 + index * 0.2}s` }}
              >
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: category.color }}
                />
                <div className="legend-content">
                  <div className="legend-text">{category.name}</div>
                  <div className="legend-amount">{formatCurrency(category.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <style>{`
        .pie-chart {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .slice {
          position: absolute;
          width: 100%;
          height: 100%;
          clip: rect(0px, 150px, 300px, 0px);
          animation: slideIn 1.5s ease-out forwards;
          transform-origin: center;
          opacity: 0;
          transform: rotate(var(--rotation)) scale(0);
          transition: transform 0.3s ease;
          cursor: pointer;
        }

        .slice:hover {
          transform: rotate(var(--rotation)) scale(1.05);
          z-index: 5;
        }

        .slice-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          clip: rect(0px, 150px, 300px, 0px);
          transform-origin: center;
          background: var(--color);
          transform: rotate(var(--percentage));
        }

        .chart-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #666;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
          opacity: 0;
          animation: fadeIn 1s ease-out 1.5s forwards;
        }

        .amount-display {
          position: absolute;
          top: -60px;
          right: -80px;
          background: white;
          padding: 10px 15px;
          border-radius: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          opacity: 0;
          animation: slideInRight 1s ease-out 2s forwards;
        }

        .amount {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .percentage {
          font-size: 14px;
          color: #FF6B9D;
          margin: 0;
        }

        .legend {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 600px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          opacity: 0;
        }

        .legend-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .legend-item:hover .legend-color {
          transform: scale(1.2);
        }

        .legend-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .legend-text {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .legend-amount {
          font-size: 12px;
          color: #999;
          font-weight: 400;
        }

        @keyframes slideIn {
          from {
            transform: rotate(var(--rotation)) scale(0);
            opacity: 0;
          }
          to {
            transform: rotate(var(--rotation)) scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @media (max-width: 600px) {
          .pie-chart {
            width: 250px;
            height: 250px;
          }
          
          .legend {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .amount-display {
            top: -50px;
            right: -60px;
            padding: 8px 12px;
          }
          
          .amount {
            font-size: 16px;
          }
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
