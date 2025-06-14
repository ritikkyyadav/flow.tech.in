
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as SonnerToaster } from "sonner";
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
    <QueryClientProvider client={queryClient}>
      <TransactionProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </QueryClientProvider>
  );
}

export default App;
