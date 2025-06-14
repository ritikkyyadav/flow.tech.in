import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
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

const Index = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Financial Overview Cards */}
        <FinancialOverview refreshTrigger={refreshTrigger} />
        
        {/* Quick Actions */}
        <QuickActions onAction={handleQuickAction} />
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* AI-Powered Transaction Categorizer */}
            <TransactionCategorizer />

            {/* Primary Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Analysis */}
              <div className="lg:col-span-2">
                <CashFlowChart refreshTrigger={refreshTrigger} />
              </div>
              
              {/* Charts and Analytics */}
              <FinancialCharts refreshTrigger={refreshTrigger} />
            </div>

            {/* Secondary Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budget Performance */}
              <BudgetPerformance refreshTrigger={refreshTrigger} />
              
              {/* AI Insights */}
              <FinancialInsights refreshTrigger={refreshTrigger} />
              
              {/* Recent Transactions */}
              <RecentTransactions refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <TransactionAnalytics refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <RecentTransactions refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <FinancialIntelligence />
          </TabsContent>

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
        </Tabs>
      </div>

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
    </DashboardLayout>
  );
};

export default Index;
