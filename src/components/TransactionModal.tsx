
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSubscription } from '@/hooks/useSubscription';
import { triggerDataRefresh } from '@/hooks/useRealTimeData';
import { Calendar, DollarSign, FileText, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
  user_id?: string; // Make user_id optional to handle different Transaction interfaces
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  transaction?: Transaction | null;
  mode?: 'add' | 'edit';
  editTransaction?: Transaction | null;
}

const categories = {
  income: [
    'Salary', 'Freelancing', 'Business Revenue', 'Investment Returns', 
    'Rental Income', 'Commission', 'Bonus', 'Gift', 'Other Income'
  ],
  expense: [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 
    'Business Expenses', 'Rent', 'Insurance', 'Other Expenses'
  ]
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionAdded,
  transaction,
  mode = 'add',
  editTransaction
}) => {
  const { getRemainingTransactions, subscription } = useSubscription();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use editTransaction if provided, otherwise use transaction
  const transactionToEdit = editTransaction || transaction;

  useEffect(() => {
    if (transactionToEdit && mode === 'edit') {
      setFormData({
        amount: transactionToEdit.amount.toString(),
        type: transactionToEdit.type,
        category: transactionToEdit.category,
        description: transactionToEdit.description,
        transaction_date: transactionToEdit.transaction_date
      });
    } else {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [transactionToEdit, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check transaction limits for starter plan
      if (subscription?.plan === 'starter' && mode === 'add') {
        const remaining = getRemainingTransactions();
        if (remaining === 0) {
          toast.error('Monthly transaction limit reached. Upgrade to Pro for unlimited transactions.');
          return;
        }
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (!formData.category) {
        toast.error('Please select a category');
        return;
      }

      // Get existing transactions
      const existingTransactions = JSON.parse(localStorage.getItem('withu_transactions') || '[]');

      if (mode === 'edit' && transactionToEdit) {
        // Update existing transaction
        const updatedTransactions = existingTransactions.map((t: Transaction) =>
          t.id === transactionToEdit.id
            ? {
                ...t,
                amount,
                type: formData.type,
                category: formData.category,
                description: formData.description,
                transaction_date: formData.transaction_date
              }
            : t
        );
        localStorage.setItem('withu_transactions', JSON.stringify(updatedTransactions));
        toast.success('Transaction updated successfully');
      } else {
        // Add new transaction
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          amount,
          type: formData.type,
          category: formData.category,
          description: formData.description,
          transaction_date: formData.transaction_date,
          user_id: 'current_user'
        };

        const updatedTransactions = [...existingTransactions, newTransaction];
        localStorage.setItem('withu_transactions', JSON.stringify(updatedTransactions));
        toast.success('Transaction added successfully');
      }

      // Trigger real-time data refresh
      triggerDataRefresh();
      
      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset category when type changes
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  const remainingTransactions = getRemainingTransactions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>{mode === 'edit' ? 'Edit Transaction' : 'Add New Transaction'}</span>
          </DialogTitle>
          {subscription?.plan === 'starter' && mode === 'add' && (
            <p className="text-sm text-gray-600">
              {remainingTransactions === -1 
                ? 'Unlimited transactions available'
                : `${remainingTransactions} transactions remaining this month`
              }
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income" className="text-green-600">
                  ↗️ Income
                </SelectItem>
                <SelectItem value="expense" className="text-red-600">
                  ↙️ Expense
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <span>{category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => handleInputChange('transaction_date', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (subscription?.plan === 'starter' && remainingTransactions === 0 && mode === 'add')}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
