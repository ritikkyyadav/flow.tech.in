
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useBudgets } from '@/contexts/BudgetContext';

const COMMON_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Gas',
  'Home',
  'Personal Care',
  'Insurance',
  'Investments',
  'Business Services',
  'Other'
];

export const BudgetSetupForm = () => {
  const { createBudget, loading } = useBudgets();
  const [budgetItems, setBudgetItems] = useState([
    { category: '', amount: '', period: 'monthly' }
  ]);

  const handleAddBudgetItem = () => {
    setBudgetItems([...budgetItems, { category: '', amount: '', period: 'monthly' }]);
  };

  const handleRemoveBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const handleBudgetItemChange = (index: number, field: string, value: string) => {
    const updated = budgetItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setBudgetItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    for (const item of budgetItems) {
      if (item.category && item.amount) {
        const startDate = new Date().toISOString().split('T')[0];
        await createBudget({
          category: item.category,
          amount: parseFloat(item.amount),
          period: item.period,
          start_date: startDate,
          is_active: true
        });
      }
    }
    
    setBudgetItems([{ category: '', amount: '', period: 'monthly' }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Set Up Budgets</span>
        </CardTitle>
        <CardDescription>
          Create category-wise budget limits to track your spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {budgetItems.map((item, index) => (
            <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`category-${index}`}>Category</Label>
                <Select
                  value={item.category}
                  onValueChange={(value) => handleBudgetItemChange(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor={`amount-${index}`}>Budget Amount (₹)</Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  placeholder="0"
                  value={item.amount}
                  onChange={(e) => handleBudgetItemChange(index, 'amount', e.target.value)}
                />
              </div>
              
              <div className="w-32">
                <Label htmlFor={`period-${index}`}>Period</Label>
                <Select
                  value={item.period}
                  onValueChange={(value) => handleBudgetItemChange(index, 'period', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {budgetItems.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveBudgetItem(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddBudgetItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Budgets'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
