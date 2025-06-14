
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, AlertCircle, Target, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetDashboardProps {
  categoryData: any[];
  className?: string;
}

export const BudgetDashboard = ({ categoryData, className }: BudgetDashboardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock budget data - in real app, this would come from user settings
  const budgetData = [
    { category: 'Food & Dining', budgeted: 15000, spent: 12500, color: 'green' },
    { category: 'Transportation', budgeted: 8000, spent: 9200, color: 'red' },
    { category: 'Utilities', budgeted: 6000, spent: 5800, color: 'green' },
    { category: 'Entertainment', budgeted: 5000, spent: 6500, color: 'red' },
    { category: 'Healthcare', budgeted: 3000, spent: 2100, color: 'green' },
    { category: 'Shopping', budgeted: 10000, spent: 8900, color: 'yellow' }
  ];

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage > 100) return { icon: AlertCircle, color: 'text-red-500' };
    if (percentage > 80) return { icon: TrendingUp, color: 'text-orange-500' };
    return { icon: Target, color: 'text-green-500' };
  };

  const daysLeftInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  return (
    <Card className={cn("bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Budget Performance
              </CardTitle>
              <p className="text-sm text-gray-500">Monthly spending overview</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-200 hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            <span>Adjust Budgets</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {budgetData.map((budget, index) => {
            const percentage = (budget.spent / budget.budgeted) * 100;
            const remaining = budget.budgeted - budget.spent;
            const dailyBudget = remaining / Math.max(daysLeftInMonth, 1);
            const status = getStatusIcon(budget.spent, budget.budgeted);
            const StatusIcon = status.icon;

            return (
              <div key={budget.category} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      percentage > 100 ? "bg-red-100" : percentage > 80 ? "bg-orange-100" : "bg-green-100"
                    )}>
                      <StatusIcon className={cn("w-5 h-5", status.color)} />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-lg">{budget.category}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {daysLeftInMonth} days left
                        </span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span className={cn(
                          "text-sm font-medium",
                          percentage > 100 ? "text-red-600" : percentage > 80 ? "text-orange-600" : "text-green-600"
                        )}>
                          {percentage.toFixed(1)}% used
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(budget.spent)}
                    </div>
                    <div className="text-sm text-gray-500">
                      of {formatCurrency(budget.budgeted)}
                    </div>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-4 bg-gray-100"
                  />
                  {percentage > 100 && (
                    <div className="absolute inset-0 bg-red-500 h-4 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className={cn(
                      "font-medium",
                      remaining > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {remaining > 0 
                        ? `${formatCurrency(remaining)} remaining` 
                        : `${formatCurrency(Math.abs(remaining))} over budget`
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 font-medium">
                      {remaining > 0 
                        ? `${formatCurrency(dailyBudget)}/day available` 
                        : 'Budget exceeded'
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Categories On Track</div>
                <div className="text-2xl font-bold text-green-700">
                  {budgetData.filter(b => b.spent <= b.budgeted).length}/{budgetData.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Remaining</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(budgetData.reduce((sum, b) => sum + Math.max(0, b.budgeted - b.spent), 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
