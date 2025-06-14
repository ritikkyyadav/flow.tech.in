
import { useState, useEffect } from "react";
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { MobileCard, MobileGrid } from "@/components/mobile/MobileCard";
import { TouchButton, FloatingActionButton } from "@/components/mobile/TouchButton";
import { FinancialOverview } from "@/components/FinancialOverview";
import { RecentTransactions } from "@/components/RecentTransactions";
import { QuickActions } from "@/components/QuickActions";
import { FinancialCharts } from "@/components/FinancialCharts";
import { AIInsights } from "@/components/AIInsights";
import { TransactionModal } from "@/components/TransactionModal";
import { TransactionAnalytics } from "@/components/TransactionAnalytics";
import { InvoiceModal } from "@/components/InvoiceModal";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { FinancialInsights } from "@/components/FinancialInsights";
import { CashFlowChart } from "@/components/CashFlowChart";
import { BudgetPerformance } from "@/components/BudgetPerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionCategorizer } from "@/components/ai/TransactionCategorizer";
import { FinancialIntelligence } from "@/components/ai/FinancialIntelligence";
import { ConversationalAssistant } from "@/components/ai/ConversationalAssistant";
import { Plus, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-expense':
        setTransactionType('expense');
        setShowTransactionModal(true);
        break;
      case 'add-income':
        setTransactionType('income');
        setShowTransactionModal(true);
        break;
      case 'create-invoice':
        setShowInvoiceModal(true);
        break;
      case 'ai-assistant':
        setShowAIChat(true);
        break;
    }
  };

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowTransactionModal(false);
  };

  const headerActions = (
    <TouchButton
      variant="outline"
      size="sm"
      onClick={() => setShowAIChat(true)}
      className="lg:hidden"
    >
      <MessageSquare className="w-4 h-4" />
    </TouchButton>
  );

  return (
    <ResponsiveLayout
      title="Dashboard"
      showSearch={true}
      showNotifications={true}
      headerActions={headerActions}
    >
      <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Financial Overview Cards */}
        <FinancialOverview refreshTrigger={refreshTrigger} />
        
        {/* Quick Actions - Mobile optimized */}
        {isMobile ? (
          <MobileCard title="Quick Actions">
            <MobileGrid cols={2} gap="sm">
              <TouchButton 
                fullWidth 
                onClick={() => handleQuickAction('add-expense')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Add Expense
              </TouchButton>
              <TouchButton 
                fullWidth 
                onClick={() => handleQuickAction('add-income')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Add Income
              </TouchButton>
            </MobileGrid>
          </MobileCard>
        ) : (
          <QuickActions onAction={handleQuickAction} />
        )}
        
        {/* Main Content - Mobile optimized tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {!isMobile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            {!isMobile && <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* AI-Powered Transaction Categorizer */}
            <TransactionCategorizer />

            {/* Primary Analytics Section - Mobile optimized */}
            <MobileGrid cols={isMobile ? 1 : 2}>
              {/* Cash Flow Analysis */}
              <div className={isMobile ? '' : 'lg:col-span-2'}>
                <CashFlowChart refreshTrigger={refreshTrigger} />
              </div>
              
              {/* Charts and Analytics */}
              <FinancialCharts refreshTrigger={refreshTrigger} />
            </MobileGrid>

            {/* Secondary Analytics Section - Mobile optimized */}
            <MobileGrid cols={isMobile ? 1 : 2}>
              {/* Budget Performance */}
              <BudgetPerformance refreshTrigger={refreshTrigger} />
              
              {/* AI Insights */}
              <FinancialInsights refreshTrigger={refreshTrigger} />
              
              {/* Recent Transactions */}
              <RecentTransactions refreshTrigger={refreshTrigger} />
            </MobileGrid>
          </TabsContent>

          {!isMobile && (
            <TabsContent value="analytics" className="space-y-6">
              <TransactionAnalytics refreshTrigger={refreshTrigger} />
            </TabsContent>
          )}

          <TabsContent value="transactions" className="space-y-4">
            <RecentTransactions refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <FinancialIntelligence />
          </TabsContent>

          {!isMobile && (
            <TabsContent value="ai-assistant" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ConversationalAssistant />
                </div>
                <div className="space-y-4">
                  <TransactionCategorizer />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <FloatingActionButton
          onClick={() => {
            setTransactionType('expense');
            setShowTransactionModal(true);
          }}
          icon={<Plus className="w-6 h-6" />}
        />
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        type={transactionType}
        onTransactionAdded={handleTransactionAdded}
      />
      
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
      
      <AIChatAssistant
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </ResponsiveLayout>
  );
};

export default Index;
