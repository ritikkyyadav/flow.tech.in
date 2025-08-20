
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target, PiggyBank } from "lucide-react";
import { motion } from 'framer-motion';
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
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`relative overflow-hidden ${card.bgColor} border-0 shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-extrabold tracking-tight ${card.textColor}`}>
                      {card.value}
                    </p>
                    {typeof card.change === 'number' && (
                      <span className={`inline-flex items-center text-xs font-semibold ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {card.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(card.change).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor.replace('50', '100')} rounded-xl flex items-center justify-center ml-4 shadow-inner`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
