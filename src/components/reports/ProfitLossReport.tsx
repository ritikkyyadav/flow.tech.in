
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatIndianCurrency } from "@/utils/indianUtils";
import type { Transaction } from "@/contexts/TransactionContext";
import { sanitizeNumericValue } from "@/utils/chartDataUtils";

interface ProfitLossReportProps {
  transactions: Transaction[];
  dateRange: { start: string; end: string };
  loading: boolean;
}

export const ProfitLossReport = ({ transactions, dateRange, loading }: ProfitLossReportProps) => {
  const reportData = useMemo(() => {
    // Group transactions by category
    const incomeByCategory: { [key: string]: number } = {};
    const expensesByCategory: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      // Skip invalid dates or records
      if (isNaN(new Date(transaction.transaction_date).getTime())) return;
      if (transaction.type === 'income') {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + sanitizeNumericValue(transaction.amount);
      } else {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + sanitizeNumericValue(transaction.amount);
      }
    });

    const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      incomeByCategory,
      expensesByCategory,
      totalIncome,
      totalExpenses,
      netProfit
    };
  }, [transactions]);

  const formatDateRange = () => {
    const start = new Date(dateRange.start).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const end = new Date(dateRange.end).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profit & Loss Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating report...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader className="print:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 print:hidden" />
          Profit & Loss Statement
        </CardTitle>
        <p className="text-sm text-gray-600">Period: {formatDateRange()}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Income Section */}
          <div>
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Income
            </h3>
            <div className="space-y-2">
              {Object.entries(reportData.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-green-600">{formatIndianCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 px-2 rounded">
                <span className="font-semibold text-green-800">Total Income</span>
                <span className="font-bold text-green-700 text-lg">{formatIndianCurrency(reportData.totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Expenses
            </h3>
            <div className="space-y-2">
              {Object.entries(reportData.expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-red-600">{formatIndianCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-red-200 bg-red-50 px-2 rounded">
                <span className="font-semibold text-red-800">Total Expenses</span>
                <span className="font-bold text-red-700 text-lg">{formatIndianCurrency(reportData.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit/Loss */}
          <div className={`p-4 rounded-lg border-2 ${
            reportData.netProfit >= 0 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className={`w-5 h-5 ${
                  reportData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
                <span className={`font-bold text-lg ${
                  reportData.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  Net {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}
                </span>
              </div>
              <span className={`font-bold text-xl ${
                reportData.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {formatIndianCurrency(Math.abs(reportData.netProfit))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
