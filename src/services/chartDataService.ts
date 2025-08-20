
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

export interface ChartData {
  monthlyData: IncomeExpenseData[];
  categoryData: CategoryData[];
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

  static prepareChartData(data: any): ChartData {
    // Handle the case where data might have different structure
    const transactions = data?.recentTransactions || data?.transactions || [];
    
    return {
      monthlyData: this.prepareIncomeExpenseData(transactions),
      categoryData: this.prepareCategoryData(transactions)
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

  // New: flexible series builder for 1D/1W/1M/6M/12M/1Y/custom day ranges
  static buildTimeSeries(
    transactions: Transaction[],
    range: '1d' | '7d' | '1m' | '6m' | '12m' | '1y' | 'custom',
    customDays = 30
  ): IncomeExpenseData[] {
    const valid = validateTransactions(transactions);
    const endDate = new Date();
    const startDate = new Date();
    if (range === '1d') startDate.setDate(endDate.getDate() - 1);
    else if (range === '7d') startDate.setDate(endDate.getDate() - 7);
    else if (range === '1m') startDate.setMonth(endDate.getMonth() - 1);
    else if (range === '6m') startDate.setMonth(endDate.getMonth() - 6);
    else if (range === '12m' || range === '1y') startDate.setMonth(endDate.getMonth() - 12);
    else if (range === 'custom') startDate.setDate(endDate.getDate() - Math.max(1, Math.min(365, customDays)));

    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    const groupMode: 'day' | 'week' | 'month' = dayDiff <= 31 ? 'day' : (dayDiff <= 180 ? 'week' : 'month');

    const grouped = new Map<string, { date: Date; income: number; expenses: number; label: string }>();

    valid.forEach(t => {
      const d = new Date(t.transaction_date);
      if (isNaN(d.getTime()) || d < startDate || d > endDate) return;

      let key = '';
      let label = '';
      if (groupMode === 'day') {
        key = d.toISOString().slice(0, 10);
        label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } else if (groupMode === 'week') {
        const temp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const dayNum = (temp.getUTCDay() + 6) % 7;
        temp.setUTCDate(temp.getUTCDate() - dayNum + 3);
        const firstThursday = new Date(Date.UTC(temp.getUTCFullYear(), 0, 4));
        const week = 1 + Math.round(((temp.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
        key = `${temp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
        label = `W${String(week).padStart(2, '0')} ${String(temp.getUTCFullYear()).slice(2)}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }

      if (!grouped.has(key)) grouped.set(key, { date: d, income: 0, expenses: 0, label });
      const g = grouped.get(key)!;
      const amt = sanitizeNumericValue(t.amount);
      if (t.type === 'income') g.income += amt; else g.expenses += amt;
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([, v]) => ({ month: v.label, income: v.income, expenses: v.expenses, net: v.income - v.expenses }));
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
