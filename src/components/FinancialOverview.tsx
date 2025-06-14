
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CircleDollarSign, Wallet } from "lucide-react";

interface FinancialOverviewProps {
  refreshTrigger: number;
}

export const FinancialOverview = ({ refreshTrigger }: FinancialOverviewProps) => {
  const [financialData, setFinancialData] = useState({
    currentBalance: 145750,
    monthlyIncome: 85000,
    monthlyExpenses: 52500,
    savingsRate: 38.2,
    incomeChange: 12.5,
    expenseChange: -8.3
  });

  // Simulate data refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      // In a real app, this would fetch from API
      console.log("Refreshing financial overview data");
    }
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const overviewCards = [
    {
      title: "Current Balance",
      value: formatCurrency(financialData.currentBalance),
      change: "+5.2%",
      trend: "up",
      icon: CircleDollarSign,
      description: "Total across all accounts"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(financialData.monthlyIncome),
      change: `+${financialData.incomeChange}%`,
      trend: "up",
      icon: TrendingUp,
      description: "This month vs last month"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(financialData.monthlyExpenses),
      change: `${financialData.expenseChange}%`,
      trend: "down",
      icon: TrendingDown,
      description: "This month vs last month"
    },
    {
      title: "Savings Rate",
      value: `${financialData.savingsRate}%`,
      change: "+2.1%",
      trend: "up",
      icon: Wallet,
      description: "Income saved this month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => (
        <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{card.value}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span 
                className={`text-sm font-medium ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.change}
              </span>
              <span className="text-sm text-gray-500">{card.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
