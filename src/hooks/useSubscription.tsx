
import { useState, useEffect, createContext, useContext } from 'react';

interface SubscriptionData {
  plan: 'starter' | 'pro';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  startDate?: string;
  nextBilling?: string;
  trialEndsAt?: string;
}

interface SubscriptionLimits {
  maxTransactions: number;
  maxInvoices: number;
  hasAdvancedCharts: boolean;
  hasAIFeatures: boolean;
  hasInventoryManagement: boolean;
  hasCustomBranding: boolean;
  hasAPIAccess: boolean;
  maxUsers: number;
  dataHistoryMonths: number;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  limits: SubscriptionLimits;
  isLoading: boolean;
  checkLimit: (feature: keyof SubscriptionLimits) => boolean;
  getRemainingTransactions: () => number;
  getRemainingInvoices: () => number;
  upgradeRequired: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const getSubscriptionLimits = (plan: string): SubscriptionLimits => {
  if (plan === 'pro') {
    return {
      maxTransactions: -1, // Unlimited
      maxInvoices: -1, // Unlimited
      hasAdvancedCharts: true,
      hasAIFeatures: true,
      hasInventoryManagement: true,
      hasCustomBranding: true,
      hasAPIAccess: true,
      maxUsers: 5,
      dataHistoryMonths: -1 // Unlimited
    };
  }
  
  // Starter plan limits
  return {
    maxTransactions: 50,
    maxInvoices: 5,
    hasAdvancedCharts: false,
    hasAIFeatures: false,
    hasInventoryManagement: false,
    hasCustomBranding: false,
    hasAPIAccess: false,
    maxUsers: 1,
    dataHistoryMonths: 3
  };
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState(0);
  const [currentMonthInvoices, setCurrentMonthInvoices] = useState(0);

  const limits = subscription ? getSubscriptionLimits(subscription.plan) : getSubscriptionLimits('starter');

  useEffect(() => {
    // Load subscription data from localStorage
    const loadSubscription = () => {
      try {
        const stored = localStorage.getItem('withu_subscription');
        if (stored) {
          const data = JSON.parse(stored);
          setSubscription(data);
        } else {
          // Default to starter plan
          const defaultSubscription = {
            plan: 'starter' as const,
            status: 'active' as const
          };
          setSubscription(defaultSubscription);
          localStorage.setItem('withu_subscription', JSON.stringify(defaultSubscription));
        }

        // Load current usage
        const transactions = JSON.parse(localStorage.getItem('withu_transactions') || '[]');
        const invoices = JSON.parse(localStorage.getItem('withu_invoices') || '[]');
        
        // Count current month transactions and invoices
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthTransactions = transactions.filter((t: any) => 
          t.transaction_date?.startsWith(currentMonth)
        ).length;
        const monthInvoices = invoices.filter((i: any) => 
          i.created_at?.startsWith(currentMonth)
        ).length;
        
        setCurrentMonthTransactions(monthTransactions);
        setCurrentMonthInvoices(monthInvoices);
      } catch (error) {
        console.error('Error loading subscription:', error);
        setSubscription({
          plan: 'starter',
          status: 'active'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const checkLimit = (feature: keyof SubscriptionLimits): boolean => {
    return Boolean(limits[feature]);
  };

  const getRemainingTransactions = (): number => {
    if (limits.maxTransactions === -1) return -1; // Unlimited
    return Math.max(0, limits.maxTransactions - currentMonthTransactions);
  };

  const getRemainingInvoices = (): number => {
    if (limits.maxInvoices === -1) return -1; // Unlimited
    return Math.max(0, limits.maxInvoices - currentMonthInvoices);
  };

  const upgradeRequired = (feature: string): boolean => {
    if (subscription?.plan === 'pro') return false;
    
    const featureRequirements: Record<string, boolean> = {
      'ai_insights': !limits.hasAIFeatures,
      'advanced_charts': !limits.hasAdvancedCharts,
      'inventory': !limits.hasInventoryManagement,
      'custom_branding': !limits.hasCustomBranding,
      'api_access': !limits.hasAPIAccess,
      'unlimited_transactions': limits.maxTransactions !== -1,
      'unlimited_invoices': limits.maxInvoices !== -1
    };
    
    return featureRequirements[feature] || false;
  };

  const value: SubscriptionContextType = {
    subscription,
    limits,
    isLoading,
    checkLimit,
    getRemainingTransactions,
    getRemainingInvoices,
    upgradeRequired
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
