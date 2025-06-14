
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { TransactionManager } from "@/components/TransactionManager";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";

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
          <TransactionManager onRefresh={handleRefresh} />
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
