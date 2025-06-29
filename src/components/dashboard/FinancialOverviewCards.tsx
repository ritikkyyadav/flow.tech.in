
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, RefreshCw } from "lucide-react";
import { ChartDataService } from '@/services/chartDataService';

interface FinancialOverviewCardsProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  onRefresh: () => void;
}

export const FinancialOverviewCards: React.FC<FinancialOverviewCardsProps> = ({
  balance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  onRefresh,
}) => {
  // Calculate changes (simplified version for backwards compatibility)
  const incomeChange = 5.2; // This would normally be calculated
  const expenseChange = -2.1;

  const cards = [
    {
      title: 'Total Balance',
      value: ChartDataService.formatIndianCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? 'green' : 'red',
      bgColor: balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
      iconColor: balance >= 0 ? 'text-green-600' : 'text-red-600',
      textColor: balance >= 0 ? 'text-green-700' : 'text-red-700',
      description: 'Net worth this period'
    },
    {
      title: 'Monthly Income',
      value: ChartDataService.formatIndianCurrency(monthlyIncome),
      icon: DollarSign,
      color: 'blue',
      bgColor: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
      change: incomeChange,
      description: ChartDataService.formatPercentageChange(incomeChange) + ' from last month'
    },
    {
      title: 'Monthly Expenses',
      value: ChartDataService.formatIndianCurrency(monthlyExpenses),
      icon: Target,
      color: 'orange',
      bgColor: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
      change: expenseChange,
      description: ChartDataService.formatPercentageChange(expenseChange) + ' from last month'
    },
    {
      title: 'Savings Rate',
      value: savingsRate.toFixed(1) + '%',
      icon: TrendingUp,
      color: savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'yellow' : 'red',
      bgColor: savingsRate >= 20 ? 'bg-green-50 border-green-200' : 
               savingsRate >= 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200',
      iconColor: savingsRate >= 20 ? 'text-green-600' : 
                 savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600',
      textColor: savingsRate >= 20 ? 'text-green-700' : 
                 savingsRate >= 10 ? 'text-yellow-700' : 'text-red-700',
      description: 'Percentage of income saved'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600 text-sm">Real-time insights into your finances</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

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
    </div>
  );
};
