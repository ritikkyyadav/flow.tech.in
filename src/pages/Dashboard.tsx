
import { MobileOptimizedLayout } from "@/components/mobile/MobileOptimizedLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnhancedFinancialOverviewCards } from "@/components/dashboard/EnhancedFinancialOverviewCards";
import AnimatedBackground from "@/components/dashboard/AnimatedBackground";
import DashboardHero from "@/components/dashboard/DashboardHero";
import { ModernIncomeExpenseChart } from "@/components/dashboard/ModernIncomeExpenseChart";
import { FixedCategoryChart } from "@/components/dashboard/FixedCategoryChart";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import PremiumAIChat from "@/components/PremiumAIChat";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useSubscription } from "@/hooks/useSubscription";
import { ChartDataService } from "@/services/chartDataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileButton } from "@/components/mobile/MobileFormComponents";
import { Crown, Zap, Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TransactionModal } from "@/components/TransactionModal";
import { MobileDashboardScreen } from "@/components/mobile/MobileDashboardScreen";

const Dashboard = () => {
  const { data, isLoading, refreshData } = useRealTimeData();
  const { subscription, limits, upgradeRequired } = useSubscription();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  // Optional: allow default type routing in the future
  const [defaultTxType, setDefaultTxType] = useState<'income' | 'expense'>('expense');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Calculate metrics for the enhanced cards
  const metrics = useMemo(() => {
    const transactions = data?.recentTransactions || [];
    return ChartDataService.calculateMetrics(transactions);
  }, [data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return ChartDataService.prepareChartData(data || {});
  }, [data]);

  const handleQuickAdd = (type: 'income' | 'expense' = 'expense') => {
    setDefaultTxType(type);
    setShowTransactionModal(true);
  };

  const handleAIAssistant = () => {
    setShowAIAssistant(true);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleTransactionSaved = () => {
    setShowTransactionModal(false);
    handleRefresh();
  };

  const content = (
    <div className="relative space-y-4 sm:space-y-6">
      <AnimatedBackground />
      <div className="flex justify-end -mb-2">
        <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')} className="rounded-full">Try New Dashboard</Button>
      </div>
      {/* Hero */}
      <DashboardHero
        title="Dashboard"
        subtitle="Track your finances with AI-powered insights"
        stats={[
          { label: 'Total Balance', value: ChartDataService.formatIndianCurrency(metrics.totalBalance) },
          { label: 'Income (M)', value: ChartDataService.formatIndianCurrency(metrics.monthlyIncome), hint: ChartDataService.formatPercentageChange(metrics.incomeChange) },
          { label: 'Expenses (M)', value: ChartDataService.formatIndianCurrency(metrics.monthlyExpenses), hint: ChartDataService.formatPercentageChange(metrics.expenseChange) },
          { label: 'Savings Rate', value: metrics.savingsRate.toFixed(1) + '%' },
        ]}
      />
      {/* Subscription Status Banner */}
      {subscription?.plan === 'starter' && (
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">You're on the Starter Plan</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Unlock unlimited transactions, AI insights, and advanced features
                  </p>
                </div>
              </div>
              <MobileButton
                variant="primary"
                size={isMobile ? "sm" : "md"}
                onClick={() => navigate('/subscription')}
                className="w-full sm:w-auto"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </MobileButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Overview Cards */}
  <EnhancedFinancialOverviewCards metrics={metrics} loading={isLoading} />

      {/* Quick Actions */}
      <QuickActionsPanel onRefresh={handleRefresh} />

      {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  <ModernIncomeExpenseChart data={chartData.monthlyData} transactions={data?.recentTransactions || []} />
        <FixedCategoryChart data={chartData.categoryData} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsPanel transactions={data?.recentTransactions || []} onRefresh={handleRefresh} />

      {/* Usage Statistics for Starter Plan */}
      {subscription?.plan === 'starter' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Plan Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transactions this month</span>
                  <span>{data?.totalTransactions || 0}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(((data?.totalTransactions || 0) / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data History</span>
                  <span>3 months</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
            {(data?.totalTransactions || 0) >= 45 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  You're approaching your monthly transaction limit. 
                  <MobileButton 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto text-yellow-800 underline ml-1"
                    onClick={() => navigate('/subscription')}
                  >
                    Upgrade to Pro
                  </MobileButton> 
                  for unlimited transactions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onTransactionAdded={handleTransactionSaved}
          initialData={{ type: defaultTxType }}
        />
      )}

      {showAIAssistant && (
        <PremiumAIChat
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );

  if (isLoading) {
    const loadingContent = (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
          <div className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <MobileOptimizedLayout 
          title="Dashboard" 
          activeTab="dashboard"
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
          {loadingContent}
        </MobileOptimizedLayout>
      );
    }

    return (
      <DashboardLayout activeTab="dashboard">
        <div className="p-6">
          {loadingContent}
        </div>
      </DashboardLayout>
    );
  }

  // Use mobile layout for mobile devices, desktop layout for desktop
  if (isMobile) {
    return (
      <MobileOptimizedLayout 
        title="Dashboard" 
        activeTab="dashboard"
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
        <MobileDashboardScreen 
          balance={metrics.totalBalance}
          chartData={chartData.monthlyData}
          bills={[
            { id: '1', name: 'Electricity', amount: 1200, dueDate: '18th Aug', iconUrl: '/lovable-uploads/0a001be8-de4d-4b8a-8807-fb97bd857f40.png' },
            { id: '2', name: 'Internet', amount: 999, dueDate: '20th Aug', iconUrl: '/lovable-uploads/12a1c034-ad16-4af1-b7a1-6c49b595421b.png' },
            { id: '3', name: 'Water', amount: 450, dueDate: '22nd Aug', iconUrl: '/lovable-uploads/4d4cf201-07fa-4897-98db-09112d4084e5.png' },
          ]}
          onSend={handleQuickAdd}
        />
      </MobileOptimizedLayout>
    );
  }

  // Desktop layout with sidebar
  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6">
        {content}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
