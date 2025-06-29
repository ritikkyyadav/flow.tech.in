
import { DashboardLayout } from "@/components/DashboardLayout";
import { TransactionManager } from "@/components/TransactionManager";
import { TransactionList } from "@/components/TransactionList";
import { SmartCategorizer } from "@/components/ai/SmartCategorizer";
import { CategoryLearning } from "@/components/ai/CategoryLearning";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Transactions = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleQuickAdd = () => {
    setShowTransactionModal(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTransactionSaved = () => {
    setShowTransactionModal(false);
    handleRefresh();
  };

  return (
    <DashboardLayout activeTab="transactions">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <Button 
            onClick={handleQuickAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Quick Add
          </Button>
        </div>

        <Tabs defaultValue="manager" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manager">Add Transaction</TabsTrigger>
            <TabsTrigger value="list">Transaction List</TabsTrigger>
            <TabsTrigger value="categorizer">Smart Categorizer</TabsTrigger>
            <TabsTrigger value="learning">AI Learning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manager" className="mt-6">
            <TransactionManager onRefresh={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <TransactionList 
              refreshTrigger={refreshTrigger} 
              onRefresh={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="categorizer" className="mt-6">
            <SmartCategorizer />
          </TabsContent>
          
          <TabsContent value="learning" className="mt-6">
            <CategoryLearning />
          </TabsContent>
        </Tabs>
      </div>

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onTransactionAdded={handleTransactionSaved}
        />
      )}
    </DashboardLayout>
  );
};

export default Transactions;
