
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string | null;
  description: string | null;
  transaction_date: string;
  source_client?: string | null;
  vendor_merchant?: string | null;
  location?: string | null;
  payment_method?: string | null;
  reference_number?: string | null;
  is_business_related: boolean | null;
  is_reimbursable: boolean | null;
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  transaction_date?: string;
  source_client?: string;
  vendor_merchant?: string;
  location?: string;
  payment_method?: string;
  reference_number?: string;
  is_business_related?: boolean;
  is_reimbursable?: boolean;
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: TransactionInput) => Promise<Transaction>;
  editTransaction: (id: string, transaction: Partial<TransactionInput>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactions: (filters?: TransactionFilters) => Transaction[];
  refreshTransactions: () => void;
}

interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const STORAGE_KEY = 'withu_transactions';

// Sample data for initialization
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 50000,
    category: 'Salary',
    description: 'Monthly salary',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    is_business_related: null,
    is_reimbursable: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'expense',
    amount: 1500,
    category: 'Food',
    description: 'Grocery shopping',
    transaction_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    vendor_merchant: 'Local Supermarket',
    payment_method: 'Credit Card',
    is_business_related: null,
    is_reimbursable: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    amount: 3000,
    category: 'Transportation',
    description: 'Fuel expenses',
    transaction_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    vendor_merchant: 'Gas Station',
    payment_method: 'Debit Card',
    is_business_related: null,
    is_reimbursable: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'income',
    amount: 15000,
    category: 'Freelance',
    description: 'Project consultation',
    transaction_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    source_client: 'Tech Company',
    payment_method: 'Bank Transfer',
    is_business_related: null,
    is_reimbursable: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Validation function
const validateTransaction = (transaction: TransactionInput): string[] => {
  const errors: string[] = [];
  
  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!transaction.category || transaction.category.trim() === '') {
    errors.push('Category is required');
  }
  
  if (!['income', 'expense'].includes(transaction.type)) {
    errors.push('Transaction type must be income or expense');
  }
  
  return errors;
};

// localStorage utilities with error handling
const loadFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : SAMPLE_TRANSACTIONS;
    }
    return SAMPLE_TRANSACTIONS;
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    toast({
      title: 'Storage Error',
      description: 'Failed to load saved transactions. Starting with sample data.',
      variant: 'destructive',
    });
    return SAMPLE_TRANSACTIONS;
  }
};

const saveToStorage = (transactions: Transaction[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
    toast({
      title: 'Storage Error',
      description: 'Failed to save transactions. Changes may be lost.',
      variant: 'destructive',
    });
    return false;
  }
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    const loadedTransactions = loadFromStorage();
    setTransactions(loadedTransactions);
    setLoading(false);
  }, []);

  // Auto-save whenever transactions change
  useEffect(() => {
    if (!loading && transactions.length > 0) {
      saveToStorage(transactions);
    }
  }, [transactions, loading]);

  const addTransaction = async (transactionInput: TransactionInput): Promise<Transaction> => {
    // Validate input
    const errors = validateTransaction(transactionInput);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...transactionInput,
      transaction_date: transactionInput.transaction_date || new Date().toISOString().split('T')[0],
      description: transactionInput.description || null,
      subcategory: transactionInput.subcategory || null,
      source_client: transactionInput.source_client || null,
      vendor_merchant: transactionInput.vendor_merchant || null,
      location: transactionInput.location || null,
      payment_method: transactionInput.payment_method || null,
      reference_number: transactionInput.reference_number || null,
      is_business_related: transactionInput.is_business_related || null,
      is_reimbursable: transactionInput.is_reimbursable || null,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: 'Success',
      description: `${transactionInput.type === 'income' ? 'Income' : 'Expense'} added successfully`,
    });

    return newTransaction;
  };

  const editTransaction = async (id: string, updates: Partial<TransactionInput>): Promise<Transaction> => {
    const existingTransaction = transactions.find(t => t.id === id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = {
      ...existingTransaction,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Validate updated transaction
    const errors = validateTransaction(updatedTransaction);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    setTransactions(prev => 
      prev.map(t => t.id === id ? updatedTransaction : t)
    );

    toast({
      title: 'Success',
      description: 'Transaction updated successfully',
    });

    return updatedTransaction;
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    setTransactions(prev => prev.filter(t => t.id !== id));

    toast({
      title: 'Success',
      description: 'Transaction deleted successfully',
    });
  };

  const getTransactions = (filters?: TransactionFilters): Transaction[] => {
    let filtered = [...transactions];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(t => t.type === filters.type);
      }

      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.description?.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower) ||
          t.vendor_merchant?.toLowerCase().includes(searchLower) ||
          t.source_client?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateRange) {
        filtered = filtered.filter(t => 
          t.transaction_date >= filters.dateRange!.start &&
          t.transaction_date <= filters.dateRange!.end
        );
      }
    }

    return filtered.sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
  };

  const refreshTransactions = () => {
    const loadedTransactions = loadFromStorage();
    setTransactions(loadedTransactions);
  };

  const value: TransactionContextType = {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    getTransactions,
    refreshTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
