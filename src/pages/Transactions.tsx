
import { MobileOptimizedLayout } from "@/components/mobile/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TransactionManager } from "@/components/TransactionManager";
import { TransactionList } from "@/components/TransactionList";
import { SmartCategorizer } from "@/components/ai/SmartCategorizer";
import { CategoryLearning } from "@/components/ai/CategoryLearning";
import { MobileButton } from "@/components/mobile/MobileFormComponents";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

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

  const headerActions = (
    <MobileButton 
      onClick={handleQuickAdd}
      variant="primary"
      size={isMobile ? "sm" : "md"}
    >
      <Plus className="w-4 h-4 mr-1" />
      Quick Add
    </MobileButton>
  );

  const content = (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your income and expenses</p>
        </div>
      </div>

      <Tabs defaultValue="manager" className="w-full">
        <TabsList className={cn(
          "grid w-full",
          isMobile ? "grid-cols-2 h-auto" : "grid-cols-4"
        )}>
          <TabsTrigger value="manager" className={isMobile ? "text-xs py-3" : ""}>
            {isMobile ? "Add" : "Add Transaction"}
          </TabsTrigger>
          <TabsTrigger value="list" className={isMobile ? "text-xs py-3" : ""}>
            {isMobile ? "List" : "Transaction List"}
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="categorizer">Smart Categorizer</TabsTrigger>
              <TabsTrigger value="learning">AI Learning</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="manager" className="mt-4 sm:mt-6">
          <TransactionManager onRefresh={handleRefresh} />
        </TabsContent>
        
        <TabsContent value="list" className="mt-4 sm:mt-6">
          <TransactionList 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh}
          />
        </TabsContent>
        
        {!isMobile && (
          <>
            <TabsContent value="categorizer" className="mt-6">
              <SmartCategorizer />
            </TabsContent>
            
            <TabsContent value="learning" className="mt-6">
              <CategoryLearning />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Mobile-only tabs for AI features */}
      {isMobile && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Smart Categorizer</h3>
              <p className="text-sm text-gray-600 mb-3">Let AI categorize your transactions automatically</p>
              <MobileButton variant="outline" size="sm" fullWidth>
                Open Categorizer
              </MobileButton>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">AI Learning</h3>
              <p className="text-sm text-gray-600 mb-3">Train AI to better understand your spending patterns</p>
              <MobileButton variant="outline" size="sm" fullWidth>
                Open AI Learning
              </MobileButton>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onTransactionAdded={handleTransactionSaved}
        />
      )}
    </div>
  );

  // Use mobile layout for mobile devices, desktop layout for desktop
  if (isMobile) {
    return (
      <MobileOptimizedLayout title="Transactions" activeTab="transactions" headerActions={headerActions}>
        {content}
      </MobileOptimizedLayout>
    );
  }

  // Desktop layout with sidebar
  return (
    <DashboardLayout activeTab="transactions">
      <div className="p-6">
        {content}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
