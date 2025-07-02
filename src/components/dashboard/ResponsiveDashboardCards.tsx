
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: 'green' | 'red' | 'blue' | 'orange' | 'yellow';
  className?: string;
}

const colorVariants = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-700',
    accent: 'bg-green-100'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-700',
    accent: 'bg-red-100'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-700',
    accent: 'bg-blue-100'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    text: 'text-orange-700',
    accent: 'bg-orange-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-700',
    accent: 'bg-yellow-100'
  }
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  className
}) => {
  const colors = colorVariants[color];
  
  return (
    <Card className={cn(
      "card-responsive border-l-4 transition-all duration-200 hover:mobile-shadow-lg",
      colors.bg,
      colors.border,
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 truncate">
            {title}
          </CardTitle>
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            colors.accent
          )}>
            <Icon className={cn("w-4 h-4", colors.icon)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className={cn("text-xl sm:text-2xl font-bold", colors.text)}>
            {value}
          </p>
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center space-x-1">
              {change !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ResponsiveDashboardCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  incomeChange?: number;
  expenseChange?: number;
  loading?: boolean;
}

export const ResponsiveDashboardCards: React.FC<ResponsiveDashboardCardsProps> = ({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  incomeChange = 0,
  expenseChange = 0,
  loading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid-responsive-cards">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-responsive">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 loading-skeleton"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 loading-skeleton"></div>
                <div className="h-4 bg-gray-200 rounded w-full loading-skeleton"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: totalBalance >= 0 ? 'green' as const : 'red' as const,
      changeLabel: 'Net worth this period'
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyIncome),
      icon: DollarSign,
      color: 'blue' as const,
      change: incomeChange,
      changeLabel: 'from last month'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      icon: Target,
      color: 'orange' as const,
      change: expenseChange,
      changeLabel: 'from last month'
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: savingsRate >= 20 ? 'green' as const : 
             savingsRate >= 10 ? 'yellow' as const : 'red' as const,
      changeLabel: 'of total income'
    }
  ];

  return (
    <div className="grid-responsive-cards">
      {cards.map((card, index) => (
        <DashboardCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          changeLabel={card.changeLabel}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
};
