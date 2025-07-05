
import { MobileOptimizedLayout } from "@/components/mobile/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TransactionManager } from "@/components/TransactionManager";
import { TransactionList } from "@/components/TransactionList";
import { SmartCategorizer } from "@/components/ai/SmartCategorizer";
import { CategoryLearning } from "@/components/ai/CategoryLearning";
import { MobileButton } from "@/components/mobile/MobileFormComponents";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { Plus, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  const handleQuickAdd = () => {
    setShowTransactionModal(true);
  };

  const handleAIAssistant = () => {
    setShowAIAssistant(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTransactionSaved = () => {
    setShowTransactionModal(false);
    handleRefresh();
  };

  const content = (
    <div className="space-y-4 sm:space-y-6">
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

      {/* Mobile-optimized AI features section */}
      {isMobile && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Features</h3>
                <p className="text-sm text-gray-600">Smart tools to enhance your finance management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <MobileButton 
                variant="outline" 
                size="sm" 
                fullWidth
                className="justify-start bg-white/70 border-blue-200 hover:bg-white"
                onClick={handleAIAssistant}
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Flow AI Assistant</div>
                  <div className="text-xs text-gray-500">Get AI-powered financial insights</div>
                </div>
              </MobileButton>
              
              <div className="grid grid-cols-2 gap-2">
                <MobileButton 
                  variant="outline" 
                  size="sm"
                  className="flex-col h-16 bg-white/70 border-purple-200 hover:bg-white"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium mt-1">Smart Categorizer</span>
                </MobileButton>
                
                <MobileButton 
                  variant="outline" 
                  size="sm"
                  className="flex-col h-16 bg-white/70 border-green-200 hover:bg-white"
                >
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium mt-1">AI Learning</span>
                </MobileButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onTransactionAdded={handleTransactionSaved}
        />
      )}

      {showAIAssistant && (
        <AIChatAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );

  // Use mobile layout for mobile devices, desktop layout for desktop
  if (isMobile) {
    return (
      <MobileOptimizedLayout 
        title="Transactions" 
        activeTab="transactions" 
        headerActions={
          <div className="flex items-center gap-2">
            <MobileButton 
              onClick={handleAIAssistant}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <MessageSquare className="w-4 h-4" />
            </MobileButton>
            <MobileButton 
              onClick={handleQuickAdd}
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </MobileButton>
          </div>
        }
      >
        {content}
      </MobileOptimizedLayout>
    );
  }

  // Desktop layout with sidebar
  return (
    <DashboardLayout activeTab="transactions">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <div className="flex items-center space-x-3">
            <MobileButton 
              variant="outline" 
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={handleAIAssistant}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Flow AI
            </MobileButton>
            <MobileButton 
              onClick={handleQuickAdd}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </MobileButton>
          </div>
        </div>
        {content}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
