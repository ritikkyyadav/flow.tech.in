
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialOverview } from "@/components/FinancialOverview";
import { RecentTransactions } from "@/components/RecentTransactions";
import { QuickActions } from "@/components/QuickActions";
import { FinancialCharts } from "@/components/FinancialCharts";
import { AIInsights } from "@/components/AIInsights";
import { TransactionModal } from "@/components/TransactionModal";
import { InvoiceModal } from "@/components/InvoiceModal";
import { AIChatAssistant } from "@/components/AIChatAssistant";

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
        
        {/* Charts and Analytics */}
        <FinancialCharts refreshTrigger={refreshTrigger} />
        
        {/* AI Insights */}
        <AIInsights />
        
        {/* Recent Transactions */}
        <RecentTransactions refreshTrigger={refreshTrigger} />
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
