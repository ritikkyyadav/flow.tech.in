
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface FinancialChartsProps {
  refreshTrigger: number;
}

export const FinancialCharts = ({ refreshTrigger }: FinancialChartsProps) => {
  const cashFlowData = [
    { month: 'Jan', income: 75000, expenses: 45000 },
    { month: 'Feb', income: 82000, expenses: 48000 },
    { month: 'Mar', income: 78000, expenses: 52000 },
    { month: 'Apr', income: 85000, expenses: 49000 },
    { month: 'May', income: 88000, expenses: 51000 },
    { month: 'Jun', income: 85000, expenses: 52500 }
  ];

  const expenseCategories = [
    { name: 'Food & Dining', value: 15000, color: '#2D2D2D' },
    { name: 'Transportation', value: 8500, color: '#4B5563' },
    { name: 'Utilities', value: 6000, color: '#6B7280' },
    { name: 'Entertainment', value: 4500, color: '#9CA3AF' },
    { name: 'Healthcare', value: 3200, color: '#D1D5DB' },
    { name: 'Others', value: 15300, color: '#F3F4F6' }
  ];

  const monthlyComparison = [
    { category: 'Income', thisMonth: 85000, lastMonth: 78000 },
    { category: 'Expenses', thisMonth: 52500, lastMonth: 51000 },
    { category: 'Savings', thisMonth: 32500, lastMonth: 27000 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cash Flow Trend */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                labelStyle={{ color: '#000000' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#059669" 
                strokeWidth={3}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#DC2626" 
                strokeWidth={3}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card className="border border-gray-200 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">This Month vs Last Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Bar dataKey="lastMonth" fill="#D1D5DB" name="Last Month" />
              <Bar dataKey="thisMonth" fill="#2D2D2D" name="This Month" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
