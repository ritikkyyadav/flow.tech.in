
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { TransactionManager } from "@/components/TransactionManager";
import { TransactionList } from "@/components/TransactionList";
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
    <>
      <ResponsiveLayout 
        title="Transactions" 
        activeTab="transactions"
        headerActions={
          <Button 
            size="sm" 
            onClick={handleQuickAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Quick Add
          </Button>
        }
      >
        <div className="p-4 lg:p-6 space-y-6">
          <Tabs defaultValue="manager" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manager">Add Transaction</TabsTrigger>
              <TabsTrigger value="list">Transaction List</TabsTrigger>
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
          </Tabs>
        </div>
      </ResponsiveLayout>

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          type="expense"
          onTransactionAdded={handleTransactionSaved}
        />
      )}
    </>
  );
};

export default Transactions;
