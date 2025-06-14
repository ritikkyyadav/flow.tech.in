
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Wallet, RefreshCw } from "lucide-react";
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
      color: isPositive ? 'text-emerald-600' : 'text-rose-600',
      bgColor: isPositive ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-rose-50 to-rose-100',
      borderColor: isPositive ? 'border-emerald-200' : 'border-rose-200',
      glowColor: isPositive ? 'shadow-emerald-100' : 'shadow-rose-100'
    };
  };

  const balanceTrend = getBalanceTrend();

  const cards = [
    {
      title: "Current Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      trend: balance > 0 ? "+12.5%" : "-5.2%",
      trendIcon: balanceTrend.icon,
      trendColor: balanceTrend.color,
      bgGradient: balanceTrend.bgColor,
      borderColor: balanceTrend.borderColor,
      shadowColor: balanceTrend.glowColor,
      description: "Total available funds",
      iconBg: balance > 0 ? "bg-emerald-500" : "bg-rose-500"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      icon: DollarSign,
      trend: "+15.3%",
      trendIcon: TrendingUp,
      trendColor: "text-emerald-600",
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-100",
      description: "This month's earnings",
      iconBg: "bg-blue-500"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses),
      icon: Target,
      trend: "+8.1%",
      trendIcon: TrendingUp,
      trendColor: "text-orange-600",
      bgGradient: "bg-gradient-to-br from-orange-50 to-amber-100",
      borderColor: "border-orange-200",
      shadowColor: "shadow-orange-100",
      description: "This month's spending",
      iconBg: "bg-orange-500"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      trend: savingsRate > 20 ? "Excellent" : savingsRate > 10 ? "Good" : "Improve",
      trendIcon: savingsRate > 20 ? TrendingUp : TrendingDown,
      trendColor: savingsRate > 20 ? "text-emerald-600" : savingsRate > 10 ? "text-amber-600" : "text-rose-600",
      bgGradient: savingsRate > 20 ? "bg-gradient-to-br from-purple-50 to-violet-100" : "bg-gradient-to-br from-purple-50 to-pink-100",
      borderColor: "border-purple-200",
      shadowColor: "shadow-purple-100",
      description: "Money saved this month",
      iconBg: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600 text-sm">Track your financial performance at a glance</p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Modern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          const TrendIconComponent = card.trendIcon;
          
          return (
            <Card 
              key={card.title} 
              className={cn(
                "relative overflow-hidden border-0 transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer",
                card.bgGradient,
                card.shadowColor,
                "shadow-lg"
              )}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {card.title}
                </CardTitle>
                <div className={cn("p-3 rounded-xl shadow-sm", card.iconBg)}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                  {card.value}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("flex items-center space-x-1 px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm")}>
                      <TrendIconComponent className={cn("h-3 w-3", card.trendColor)} />
                      <span className={cn("text-xs font-semibold", card.trendColor)}>
                        {card.trend}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 bg-white/40 px-2 py-1 rounded-full backdrop-blur-sm">vs last month</span>
                </div>
                
                <p className="text-xs text-gray-600 font-medium bg-white/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                  {card.description}
                </p>
              </CardContent>
              
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
