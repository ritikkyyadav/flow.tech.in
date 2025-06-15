import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Printer, FileText, TableIcon } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { ProfitLossReport } from "./ProfitLossReport";
import { SpendingCategoriesReport } from "./SpendingCategoriesReport";
import { ReportFilters } from "./ReportFilters";
import { IncomeExpenseChart } from "../dashboard/IncomeExpenseChart";

export const FinancialReports = () => {
  const { transactions, loading } = useTransactions();
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, dateRange]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: data.income,
        expenses: data.expenses
      }));
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return formatIndianCurrency(amount);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    console.log(`Exporting report as ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onPrint={handlePrint}
        isGenerating={isGenerating}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Income</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summaryMetrics.totalIncome)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(summaryMetrics.totalExpenses)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r border ${
          summaryMetrics.netProfit >= 0 
            ? 'from-blue-50 to-blue-100 border-blue-200' 
            : 'from-orange-50 to-orange-100 border-orange-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  summaryMetrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  Net Profit/Loss
                </p>
                <p className={`text-2xl font-bold ${
                  summaryMetrics.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {formatCurrency(summaryMetrics.netProfit)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                summaryMetrics.netProfit >= 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                <TableIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-700">
                  {summaryMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expense Chart */}
      <IncomeExpenseChart data={chartData} loading={isGenerating} />

      {/* Profit & Loss Report */}
      <ProfitLossReport 
        transactions={filteredTransactions} 
        dateRange={dateRange}
        loading={isGenerating}
      />

      {/* Spending Categories Report */}
      <SpendingCategoriesReport 
        transactions={filteredTransactions} 
        dateRange={dateRange}
        loading={isGenerating}
      />
    </div>
  );
};
