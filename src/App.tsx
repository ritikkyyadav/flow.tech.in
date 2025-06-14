import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sonner } from 'sonner'
import {
  Index,
  Dashboard,
  Transactions,
  Invoices,
  Reports,
  Profile,
  Settings,
  NotFound,
} from "@/pages";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { TransactionProvider } from "@/contexts/TransactionContext";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClient client={queryClient}>
      <TransactionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </QueryClient>
  );
}

export default App;
