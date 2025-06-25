// Chart Data Utilities for Validation and Processing

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  description?: string;
  user_id: string;
}

export interface ChartDataPoint {
  [key: string]: any;
  value?: number;
  amount?: number;
}

// ============ VALIDATION FUNCTIONS ============

/**
 * Validates and sanitizes a numeric value
 * @param value - The value to sanitize
 * @returns A valid number or 0 if invalid
 */
export const sanitizeNumericValue = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Validates if a date string is valid
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString !== 'Invalid Date';
};

/**
 * Validates an array of transactions
 * @param transactions - Array of transaction objects
 * @returns Array of valid transactions
 */
export const validateTransactions = (transactions: any[]): Transaction[] => {
  if (!Array.isArray(transactions)) {
    console.warn('Expected array of transactions, got:', typeof transactions);
    return [];
  }
  
  return transactions.filter((transaction, index) => {
    try {
      // Check if transaction is an object
      if (!transaction || typeof transaction !== 'object') {
        console.warn(`Transaction at index ${index} is not an object:`, transaction);
        return false;
      }
      
      // Check required fields
      const requiredFields = ['id', 'amount', 'type', 'transaction_date', 'user_id'];
      for (const field of requiredFields) {
        if (!transaction[field]) {
          console.warn(`Transaction at index ${index} missing required field '${field}':`, transaction);
          return false;
        }
      }
      
      // Validate amount
      if (isNaN(parseFloat(transaction.amount))) {
        console.warn(`Transaction at index ${index} has invalid amount:`, transaction.amount);
        return false;
      }
      
      // Validate type
      if (!['income', 'expense'].includes(transaction.type)) {
        console.warn(`Transaction at index ${index} has invalid type:`, transaction.type);
        return false;
      }
      
      // Validate date
      if (!isValidDate(transaction.transaction_date)) {
        console.warn(`Transaction at index ${index} has invalid date:`, transaction.transaction_date);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn(`Error validating transaction at index ${index}:`, error);
      return false;
    }
  });
};

/**
 * Validates chart data points
 * @param data - Array of chart data points
 * @param requiredFields - Array of required field names
 * @returns Array of valid data points
 */
export const validateChartData = (data: any[], requiredFields: string[] = ['value']): ChartDataPoint[] => {
  if (!Array.isArray(data)) {
    console.warn('Expected array of chart data, got:', typeof data);
    return [];
  }
  
  return data.filter((item, index) => {
    try {
      if (!item || typeof item !== 'object') {
        console.warn(`Chart data at index ${index} is not an object:`, item);
        return false;
      }
      
      // Check for at least one numeric value field
      const hasValidNumericField = requiredFields.some(field => {
        const value = item[field];
        return value !== undefined && value !== null && !isNaN(parseFloat(value));
      });
      
      if (!hasValidNumericField) {
        console.warn(`Chart data at index ${index} has no valid numeric fields:`, item);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn(`Error validating chart data at index ${index}:`, error);
      return false;
    }
  });
};

// ============ DATA PROCESSING FUNCTIONS ============

/**
 * Safely formats currency values
 * @param value - The numeric value to format
 * @param currency - Currency code (default: INR)
 * @param locale - Locale string (default: en-IN)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'INR', 
  locale: string = 'en-IN'
): string => {
  try {
    const sanitizedValue = sanitizeNumericValue(value);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(sanitizedValue);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `${currency} ${sanitizeNumericValue(value).toFixed(0)}`;
  }
};

/**
 * Safely formats percentage values
 * @param value - The numeric value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  try {
    const sanitizedValue = sanitizeNumericValue(value);
    return `${sanitizedValue.toFixed(decimals)}%`;
  } catch (error) {
    console.warn('Error formatting percentage:', error);
    return '0.0%';
  }
};

/**
 * Safely formats large numbers with K, M, B suffixes
 * @param value - The numeric value to format
 * @returns Formatted number string
 */
export const formatLargeNumber = (value: number): string => {
  try {
    const sanitizedValue = sanitizeNumericValue(value);
    
    if (sanitizedValue >= 1e9) {
      return `₹${(sanitizedValue / 1e9).toFixed(1)}B`;
    } else if (sanitizedValue >= 1e6) {
      return `₹${(sanitizedValue / 1e6).toFixed(1)}M`;
    } else if (sanitizedValue >= 1e3) {
      return `₹${(sanitizedValue / 1e3).toFixed(1)}K`;
    } else {
      return `₹${sanitizedValue.toFixed(0)}`;
    }
  } catch (error) {
    console.warn('Error formatting large number:', error);
    return '₹0';
  }
};

/**
 * Groups transactions by month
 * @param transactions - Array of validated transactions
 * @returns Object with monthly grouped data
 */
export const groupTransactionsByMonth = (transactions: Transaction[]): Record<string, {
  month: string;
  monthName: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}> => {
  try {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          monthName,
          income: 0,
          expense: 0,
          net: 0,
          count: 0
        };
      }
      
      const amount = sanitizeNumericValue(transaction.amount);
      
      if (transaction.type === 'income') {
        acc[monthKey].income += amount;
      } else if (transaction.type === 'expense') {
        acc[monthKey].expense += amount;
      }
      
      acc[monthKey].net = acc[monthKey].income - acc[monthKey].expense;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error('Error grouping transactions by month:', error);
    return {};
  }
};

/**
 * Groups transactions by category
 * @param transactions - Array of validated transactions
 * @param type - Filter by transaction type (optional)
 * @returns Array of category data
 */
export const groupTransactionsByCategory = (
  transactions: Transaction[], 
  type?: 'income' | 'expense'
): Array<{
  name: string;
  value: number;
  count: number;
  percentage: number;
}> => {
  try {
    const filteredTransactions = type 
      ? transactions.filter(t => t.type === type)
      : transactions;
    
    const categoryData = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          count: 0
        };
      }
      
      acc[category].value += sanitizeNumericValue(transaction.amount);
      acc[category].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    const total = Object.values(categoryData).reduce(
      (sum: number, cat: any) => sum + cat.value, 
      0
    );
    
    return Object.values(categoryData)
      .map((cat: any) => ({
        ...cat,
        percentage: total > 0 ? (cat.value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error grouping transactions by category:', error);
    return [];
  }
};

/**
 * Calculates date range based on time period
 * @param period - Time period string
 * @returns Object with start and end dates
 */
export const calculateDateRange = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  
  try {
    switch (period) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '12months':
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      case 'thisyear':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case 'lastyear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        startDate.setMonth(0);
        startDate.setDate(1);
        endDate.setFullYear(endDate.getFullYear() - 1);
        endDate.setMonth(11);
        endDate.setDate(31);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    return { startDate, endDate };
  } catch (error) {
    console.error('Error calculating date range:', error);
    // Fallback to last 6 months
    startDate.setMonth(endDate.getMonth() - 6);
    return { startDate, endDate };
  }
};

/**
 * Generates color palette for charts
 * @param count - Number of colors needed
 * @returns Array of color strings
 */
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
    '#06B6D4', '#F43F5E', '#8B5A2B', '#6B7280', '#065F46'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 65%, 55%)`);
  }
  
  return colors;
};

/**
 * Calculates summary statistics from transactions
 * @param transactions - Array of validated transactions
 * @returns Object with summary statistics
 */
export const calculateSummaryStats = (transactions: Transaction[]) => {
  try {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + sanitizeNumericValue(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    
    const avgTransactionAmount = transactions.length > 0 
      ? (totalIncome + totalExpenses) / transactions.length 
      : 0;
    
    const largestTransaction = transactions.reduce(
      (max, t) => Math.max(max, sanitizeNumericValue(t.amount)),
      0
    );
    
    const avgIncomePerTransaction = income.length > 0 
      ? totalIncome / income.length 
      : 0;
    
    const avgExpensePerTransaction = expenses.length > 0 
      ? totalExpenses / expenses.length 
      : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      totalTransactions: transactions.length,
      incomeTransactions: income.length,
      expenseTransactions: expenses.length,
      avgTransactionAmount,
      avgIncomePerTransaction,
      avgExpensePerTransaction,
      largestTransaction
    };
  } catch (error) {
    console.error('Error calculating summary stats:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingsRate: 0,
      totalTransactions: 0,
      incomeTransactions: 0,
      expenseTransactions: 0,
      avgTransactionAmount: 0,
      avgIncomePerTransaction: 0,
      avgExpensePerTransaction: 0,
      largestTransaction: 0
    };
  }
};

/**
 * Exports chart data to CSV format
 * @param data - Array of data objects
 * @param filename - Name of the file
 * @param headers - Optional custom headers
 */
export const exportToCSV = (
  data: any[], 
  filename: string, 
  headers?: string[]
): void => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    // Generate headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

// ============ CHART-SPECIFIC UTILITIES ============

/**
 * Prepares data for Recharts components
 * @param data - Raw data array
 * @param config - Configuration object
 * @returns Processed data ready for charts
 */
export const prepareChartData = (
  data: any[], 
  config: {
    xKey?: string;
    yKeys?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  } = {}
): any[] => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    let processedData = [...data];
    
    // Sort data if specified
    if (config.sortBy) {
      processedData.sort((a, b) => {
        const aVal = a[config.sortBy!];
        const bVal = b[config.sortBy!];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return config.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        } else {
          const aStr = String(aVal);
          const bStr = String(bVal);
          return config.sortOrder === 'desc' 
            ? bStr.localeCompare(aStr)
            : aStr.localeCompare(bStr);
        }
      });
    }
    
    // Limit data if specified
    if (config.limit && config.limit > 0) {
      processedData = processedData.slice(0, config.limit);
    }
    
    // Ensure numeric values are properly formatted
    if (config.yKeys) {
      processedData = processedData.map(item => {
        const newItem = { ...item };
        config.yKeys!.forEach(key => {
          if (newItem[key] !== undefined) {
            newItem[key] = sanitizeNumericValue(newItem[key]);
          }
        });
        return newItem;
      });
    }
    
    return processedData;
  } catch (error) {
    console.error('Error preparing chart data:', error);
    return [];
  }
};

/**
 * Creates a debounced function for chart updates
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// ============ ERROR HANDLING UTILITIES ============

/**
 * Safely executes a function with error handling
 * @param fn - Function to execute
 * @param fallback - Fallback value on error
 * @param errorMessage - Custom error message
 * @returns Function result or fallback value
 */
export const safeExecute = <T>(
  fn: () => T,
  fallback: T,
  errorMessage?: string
): T => {
  try {
    return fn();
  } catch (error) {
    console.warn(errorMessage || 'Safe execution failed:', error);
    return fallback;
  }
};
