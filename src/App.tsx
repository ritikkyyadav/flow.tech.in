

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { AIProvider } from "@/contexts/AIContext";
import { Index } from "@/pages";
import Dashboard from "@/pages/Dashboard";
import DashboardV2 from "@/pages/DashboardV2";
import Transactions from "@/pages/Transactions";
import Budget from "@/pages/Budget";
import Invoices from "@/pages/Invoices";
import Accounting from "@/pages/Accounting";
import Reports from "@/pages/Reports";
import DataManagement from "@/pages/DataManagement";
import IndianFeatures from "@/pages/IndianFeatures";
import Subscription from "@/pages/Subscription";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AIChatProvider } from "@/hooks/useAIChat";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
        <Toaster />
        <AuthProvider>
          <SubscriptionProvider>
            <TransactionProvider>
              <BudgetProvider>
                <AIProvider>
                  <AIChatProvider>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      {/* New default dashboard points to V2 */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <DashboardV2 />
                        </ProtectedRoute>
                      } />
                      {/* Classic dashboard preserved at /dashboard-classic */}
                      <Route path="/dashboard-classic" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/transactions" element={
                        <ProtectedRoute>
                          <Transactions />
                        </ProtectedRoute>
                      } />
                      <Route path="/budget" element={
                        <ProtectedRoute>
                          <Budget />
                        </ProtectedRoute>
                      } />
                      <Route path="/invoices" element={
                        <ProtectedRoute>
                          <Invoices />
                        </ProtectedRoute>
                      } />
                      <Route path="/accounting" element={
                        <ProtectedRoute>
                          <Accounting />
                        </ProtectedRoute>
                      } />
                      <Route path="/reports" element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      } />
                      <Route path="/data-management" element={
                        <ProtectedRoute>
                          <DataManagement />
                        </ProtectedRoute>
                      } />
                      <Route path="/indian-features" element={
                        <ProtectedRoute>
                          <IndianFeatures />
                        </ProtectedRoute>
                      } />
                      <Route path="/subscription" element={
                        <ProtectedRoute>
                          <Subscription />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/notifications" element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AIChatProvider>
                </AIProvider>
              </BudgetProvider>
            </TransactionProvider>
          </SubscriptionProvider>
        </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
