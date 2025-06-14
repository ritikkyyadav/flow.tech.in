
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet } from "lucide-react";
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
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      borderColor: isPositive ? 'border-green-200' : 'border-red-200',
      percentage: Math.abs(((balance / (monthlyIncome || 1)) * 100)).toFixed(1)
    };
  };

  const balanceTrend = getBalanceTrend();

  const cards = [
    {
      title: "Current Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      trend: balanceTrend.percentage,
      trendIcon: balanceTrend.icon,
      trendColor: balanceTrend.color,
      bgColor: balanceTrend.bgColor,
      borderColor: balanceTrend.borderColor,
      description: "Total available funds"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      icon: DollarSign,
      trend: "12.5",
      trendIcon: TrendingUp,
      trendColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "This month's earnings"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses),
      icon: Target,
      trend: "8.3",
      trendIcon: TrendingUp,
      trendColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "This month's spending"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      trend: savingsRate > 20 ? "Excellent" : savingsRate > 10 ? "Good" : "Improve",
      trendIcon: savingsRate > 20 ? TrendingUp : TrendingDown,
      trendColor: savingsRate > 20 ? "text-green-600" : savingsRate > 10 ? "text-orange-600" : "text-red-600",
      bgColor: savingsRate > 20 ? "bg-green-50" : savingsRate > 10 ? "bg-orange-50" : "bg-red-50",
      borderColor: savingsRate > 20 ? "border-green-200" : savingsRate > 10 ? "border-orange-200" : "border-red-200",
      description: "Money saved this month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const TrendIconComponent = card.trendIcon;
        
        return (
          <Card 
            key={card.title} 
            className={cn(
              "bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
              card.borderColor ? `border-l-4 ${card.borderColor}` : ""
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <IconComponent className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {card.value}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <TrendIconComponent className={cn("h-3 w-3", card.trendColor)} />
                  <span className={cn("text-xs font-medium", card.trendColor)}>
                    {card.trend}{card.title === "Savings Rate" ? "" : "%"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
              
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
