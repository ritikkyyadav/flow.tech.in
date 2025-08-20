
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
        {/* Minimal Transaction Entry */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="w-5 h-5" />
              Transaction Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle for Transaction Type */}
            <div className="flex flex-col items-center space-y-4">
              <ToggleGroup 
                type="single" 
                value={transactionType} 
                onValueChange={(value) => value && setTransactionType(value as 'income' | 'expense')}
                className="bg-gray-100 rounded-lg p-1"
              >
                <ToggleGroupItem 
                  value="income" 
                  className="data-[state=on]:bg-green-500 data-[state=on]:text-white px-8 py-2 rounded-md transition-all"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Income
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="expense" 
                  className="data-[state=on]:bg-red-500 data-[state=on]:text-white px-8 py-2 rounded-md transition-all"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Expense
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Single Action Button */}
              <Button
                onClick={() => handleAddTransaction(transactionType)}
                className="w-full max-w-md h-14 bg-black text-white hover:bg-gray-800 font-medium text-base"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add {transactionType === 'income' ? 'Income' : 'Expense'}
              </Button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTransaction('income')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Quick Income
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTransaction('expense')}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Quick Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-0 shadow-sm">
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
          onTransactionAdded={handleTransactionSaved}
          // Ensure the modal opens with the correct type pre-selected
          initialData={{ type: transactionType }}
        />
      )}
    </>
  );
};
