
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, PiggyBank } from "lucide-react";
import { ChartDataService, ChartMetrics } from '@/services/chartDataService';

interface EnhancedFinancialOverviewCardsProps {
  metrics: ChartMetrics;
  loading?: boolean;
}

export const EnhancedFinancialOverviewCards: React.FC<EnhancedFinancialOverviewCardsProps> = ({ 
  metrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Balance',
      value: ChartDataService.formatIndianCurrency(metrics.totalBalance),
      icon: Wallet,
      color: metrics.totalBalance >= 0 ? 'green' : 'red',
      bgColor: metrics.totalBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
      iconColor: metrics.totalBalance >= 0 ? 'text-green-600' : 'text-red-600',
      textColor: metrics.totalBalance >= 0 ? 'text-green-700' : 'text-red-700',
      description: 'Net worth this period'
    },
    {
      title: 'Monthly Income',
      value: ChartDataService.formatIndianCurrency(metrics.monthlyIncome),
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      change: metrics.incomeChange,
      description: ChartDataService.formatPercentageChange(metrics.incomeChange) + ' from last month'
    },
    {
      title: 'Monthly Expenses',
      value: ChartDataService.formatIndianCurrency(metrics.monthlyExpenses),
      icon: Target,
      color: 'orange',
      bgColor: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
      change: metrics.expenseChange,
      description: ChartDataService.formatPercentageChange(metrics.expenseChange) + ' from last month'
    },
    {
      title: 'Savings Rate',
      value: metrics.savingsRate.toFixed(1) + '%',
      icon: PiggyBank,
      color: metrics.savingsRate >= 20 ? 'green' : metrics.savingsRate >= 10 ? 'yellow' : 'red',
      bgColor: metrics.savingsRate >= 20 ? 'bg-green-50 border-green-200' : 
               metrics.savingsRate >= 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200',
      iconColor: metrics.savingsRate >= 20 ? 'text-green-600' : 
                 metrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600',
      textColor: metrics.savingsRate >= 20 ? 'text-green-700' : 
                 metrics.savingsRate >= 10 ? 'text-yellow-700' : 'text-red-700',
      description: 'Percentage of income saved'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-l-4`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor} mb-2`}>
                  {card.value}
                </p>
                <div className="flex items-center space-x-2">
                  {card.change !== undefined && (
                    <span className={`flex items-center text-xs ${
                      card.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{card.description}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${card.bgColor.replace('50', '100')} rounded-lg flex items-center justify-center ml-4`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
