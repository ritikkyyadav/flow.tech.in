
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnhancedFinancialOverviewCards } from "@/components/dashboard/EnhancedFinancialOverviewCards";
import { FixedIncomeExpenseChart } from "@/components/dashboard/FixedIncomeExpenseChart";
import { FixedCategoryChart } from "@/components/dashboard/FixedCategoryChart";
import { RecentTransactionsPanel } from "@/components/dashboard/RecentTransactionsPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { data, isLoading } = useRealTimeData();
  const { subscription, limits, upgradeRequired } = useSubscription();
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action);
    
    switch (action) {
      case 'add-expense':
      case 'add-income':
        navigate('/transactions');
        break;
      case 'create-invoice':
        navigate('/invoices');
        break;
      case 'ai-assistant':
        // This would open the AI assistant
        console.log('Opening AI assistant...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="p-4 lg:p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-200 h-80 rounded-lg"></div>
              <div className="bg-gray-200 h-80 rounded-lg"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Subscription Status Banner */}
        {subscription?.plan === 'starter' && (
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">You're on the Starter Plan</h3>
                    <p className="text-sm text-gray-600">
                      Unlock unlimited transactions, AI insights, and advanced features
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={() => navigate('/subscription')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Overview Cards */}
        <EnhancedFinancialOverviewCards />

        {/* Quick Actions */}
        <QuickActionsPanel onAction={handleQuickAction} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FixedIncomeExpenseChart />
          <FixedCategoryChart />
        </div>

        {/* Recent Transactions */}
        <RecentTransactionsPanel />

        {/* Usage Statistics for Starter Plan */}
        {subscription?.plan === 'starter' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Plan Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transactions this month</span>
                    <span>{data.totalTransactions}/50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((data.totalTransactions / 50) * 100, 100)}%` }}
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
              {data.totalTransactions >= 45 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    You're approaching your monthly transaction limit. 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-yellow-800 underline ml-1"
                      onClick={() => navigate('/subscription')}
                    >
                      Upgrade to Pro
                    </Button> 
                    for unlimited transactions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
