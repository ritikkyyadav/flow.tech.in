
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, DollarSign, Target, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialOverviewCardsProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  onRefresh: () => void;
}

export const FinancialOverviewCards = ({
  balance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  onRefresh
}: FinancialOverviewCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceTrend = () => {
    const isPositive = balance > 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-500' : 'text-red-500',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      trend: isPositive ? '↑' : '↓'
    };
  };

  const balanceTrend = getBalanceTrend();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Balance Card */}
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Current Balance</CardTitle>
          <div className={cn("p-2 rounded-full", balanceTrend.bgColor)}>
            <balanceTrend.icon className={cn("h-4 w-4", balanceTrend.color)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black mb-1">
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("text-sm font-medium", balanceTrend.color)}>
              {balanceTrend.trend} {Math.abs(((balance / (monthlyIncome || 1)) * 100)).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs target</span>
          </div>
          <div className="group-hover:text-blue-600 text-xs text-gray-400 mt-2 flex items-center">
            View history <ArrowRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income Card */}
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Monthly Income</CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black mb-1">
            {formatCurrency(monthlyIncome)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-green-600">
              ↑ 12.5%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
          {/* Progress bar for month completion */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Month Progress</span>
              <span>{Math.round((new Date().getDate() / 30) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(new Date().getDate() / 30) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses Card */}
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Monthly Expenses</CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black mb-1">
            {formatCurrency(monthlyExpenses)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-red-600">
              ↑ 8.3%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
          {/* Budget remaining indicator */}
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              Budget Remaining: {formatCurrency(Math.max(0, monthlyIncome * 0.8 - monthlyExpenses))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate Card */}
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Savings Rate</CardTitle>
          <div className="p-2 rounded-full bg-purple-50">
            <PiggyBank className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black mb-1">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              "text-sm font-medium",
              savingsRate > 20 ? "text-green-600" : savingsRate > 10 ? "text-orange-600" : "text-red-600"
            )}>
              {savingsRate > 20 ? "↑ Excellent" : savingsRate > 10 ? "→ Good" : "↓ Needs Improvement"}
            </span>
          </div>
          {/* Circular progress for savings rate */}
          <div className="mt-3 flex items-center justify-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${Math.min(savingsRate * 1.67, 100)}, 100`}
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">{savingsRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
