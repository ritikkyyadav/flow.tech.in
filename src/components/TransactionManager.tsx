
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { TransactionModal } from "./TransactionModal";
import { RecentTransactions } from "./RecentTransactions";

interface TransactionManagerProps {
  onRefresh?: () => void;
}

export const TransactionManager = ({ onRefresh }: TransactionManagerProps) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const handleTransactionSaved = () => {
    setShowTransactionModal(false);
    setRefreshTrigger(prev => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Quick Add Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Transaction Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => handleAddTransaction('income')}
                className="h-20 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white"
              >
                <TrendingUp className="w-8 h-8 mb-2" />
                <span className="text-lg font-semibold">Add Income</span>
                <span className="text-sm opacity-90">Record money received</span>
              </Button>
              
              <Button
                onClick={() => handleAddTransaction('expense')}
                className="h-20 flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white"
              >
                <TrendingDown className="w-8 h-8 mb-2" />
                <span className="text-lg font-semibold">Add Expense</span>
                <span className="text-sm opacity-90">Record money spent</span>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTransaction('income')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Quick Income
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTransaction('expense')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Quick Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <RecentTransactions refreshTrigger={refreshTrigger} />
              </TabsContent>
              
              <TabsContent value="income" className="mt-4">
                <RecentTransactions refreshTrigger={refreshTrigger} filterType="income" />
              </TabsContent>
              
              <TabsContent value="expense" className="mt-4">
                <RecentTransactions refreshTrigger={refreshTrigger} filterType="expense" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          type={transactionType}
          onTransactionAdded={handleTransactionSaved}
        />
      )}
    </>
  );
};
