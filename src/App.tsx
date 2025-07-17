
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/useAuth";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { AIProvider } from "@/contexts/AIContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budget from "@/pages/Budget";
import Invoices from "@/pages/Invoices";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <AuthProvider>
          <TransactionProvider>
            <BudgetProvider>
              <AIProvider>
                <AIChatProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={
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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
