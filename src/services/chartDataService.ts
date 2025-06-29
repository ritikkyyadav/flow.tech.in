
import { Transaction } from '@/contexts/TransactionContext';
import { validateTransactions, formatCurrency, sanitizeNumericValue } from '@/utils/chartDataUtils';

export interface ChartMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeChange: number;
  expenseChange: number;
  savingsRate: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export class ChartDataService {
  private static colors = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];

  static calculateMetrics(transactions: Transaction[]): ChartMetrics {
    const validTransactions = validateTransactions(transactions);
    
    // Current month calculations
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthTransactions = validTransactions.filter(t => 
      new Date(t.transaction_date) >= currentMonthStart
    );

    const lastMonthTransactions = validTransactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    // Calculate totals
    const totalIncome = validTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    const totalExpenses = validTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);

    // Calculate changes
    const incomeChange = lastMonthIncome > 0 
      ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0;

    const expenseChange = lastMonthExpenses > 0 
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      incomeChange,
      expenseChange,
      savingsRate
    };
  }

  static prepareCategoryData(transactions: Transaction[]): CategoryData[] {
    const validTransactions = validateTransactions(transactions);
    const expenseTransactions = validTransactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, number>();
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      const amount = sanitizeNumericValue(transaction.amount);
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: this.colors[index % this.colors.length],
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  static prepareIncomeExpenseData(transactions: Transaction[]): IncomeExpenseData[] {
    const validTransactions = validateTransactions(transactions);
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    validTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      const amount = sanitizeNumericValue(transaction.amount);

      if (transaction.type === 'income') {
        data.income += amount;
      } else {
        data.expenses += amount;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses
        };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  }

  static formatIndianCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static formatPercentageChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }
}
