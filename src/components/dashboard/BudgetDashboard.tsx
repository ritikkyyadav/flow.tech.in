
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, AlertCircle } from "lucide-react";
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
    return { icon: TrendingUp, color: 'text-green-500' };
  };

  const daysLeftInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">
            Budget Performance
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Adjust Budgets</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetData.map((budget, index) => {
            const percentage = (budget.spent / budget.budgeted) * 100;
            const remaining = budget.budgeted - budget.spent;
            const dailyBudget = remaining / Math.max(daysLeftInMonth, 1);
            const status = getStatusIcon(budget.spent, budget.budgeted);
            const StatusIcon = status.icon;

            return (
              <div key={budget.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                    <span className="font-medium text-gray-900">{budget.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                    </div>
                    <div className={cn(
                      "text-xs",
                      percentage > 100 ? "text-red-600" : percentage > 80 ? "text-orange-600" : "text-green-600"
                    )}>
                      {percentage.toFixed(1)}% used
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-3"
                  />
                  {percentage > 100 && (
                    <div className="absolute inset-0 bg-red-500 h-3 rounded-full opacity-20"></div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {remaining > 0 ? `₹${formatCurrency(remaining)} remaining` : `₹${formatCurrency(Math.abs(remaining))} over budget`}
                  </span>
                  <span>
                    {remaining > 0 ? `₹${formatCurrency(dailyBudget)}/day left` : `${daysLeftInMonth} days left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {budgetData.filter(b => b.spent <= b.budgeted).length}/{budgetData.length}
              </div>
              <div className="text-xs text-gray-500">On Track</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(budgetData.reduce((sum, b) => sum + Math.max(0, b.budgeted - b.spent), 0))}
              </div>
              <div className="text-xs text-gray-500">Total Remaining</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
