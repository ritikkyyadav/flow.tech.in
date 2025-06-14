
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface RecentTransactionsProps {
  refreshTrigger: number;
}

export const RecentTransactions = ({ refreshTrigger }: RecentTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      amount: 25000,
      category: 'Freelance',
      description: 'Website development project',
      date: '2024-06-14'
    },
    {
      id: '2',
      type: 'expense',
      amount: 1250,
      category: 'Food',
      description: 'Grocery shopping',
      date: '2024-06-13'
    },
    {
      id: '3',
      type: 'expense',
      amount: 3500,
      category: 'Transportation',
      description: 'Uber rides this week',
      date: '2024-06-12'
    },
    {
      id: '4',
      type: 'income',
      amount: 15000,
      category: 'Salary',
      description: 'Part-time consulting',
      date: '2024-06-11'
    },
    {
      id: '5',
      type: 'expense',
      amount: 850,
      category: 'Utilities',
      description: 'Electricity bill',
      date: '2024-06-10'
    }
  ]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refreshing recent transactions");
      // In a real app, this would fetch from API
    }
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-black">Recent Transactions</CardTitle>
        <Button variant="outline" size="sm" className="border-gray-300">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                transaction.type === 'income' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-black">{transaction.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            </div>
            <div className={`text-lg font-semibold ${
              transaction.type === 'income' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
