
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { getIndianFinancialYear, getFinancialYearRange, formatIndianCurrency } from "@/utils/indianUtils";

export const FinancialYearTracker = () => {
  const { transactions } = useTransactions();
  const [selectedFY, setSelectedFY] = useState(getIndianFinancialYear());

  // Generate list of financial years (current + 2 previous + 1 future)
  const availableFYs = useMemo(() => {
    const currentFY = getIndianFinancialYear();
    const currentYear = parseInt(currentFY.split('-')[0]);
    const years = [];
    
    for (let i = -2; i <= 1; i++) {
      const year = currentYear + i;
      years.push(`${year}-${(year + 1).toString().slice(-2)}`);
    }
    
    return years;
  }, []);

  const fyData = useMemo(() => {
    const { start, end } = getFinancialYearRange(selectedFY);
    
    const fyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= start && transactionDate <= end;
    });

    const income = fyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = fyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSaving = income - expenses;

    // Monthly breakdown
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(start.getFullYear(), start.getMonth() + month, 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + month + 1, 0);
      
      const monthTransactions = fyTransactions.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses
      });
    }

    return {
      income,
      expenses,
      netSaving,
      fyString: selectedFY,
      period: `April ${start.getFullYear()} - March ${end.getFullYear()}`,
      monthlyData,
      transactionCount: fyTransactions.length
    };
  }, [transactions, selectedFY]);

  return (
    <div className="space-y-6">
      {/* FY Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Indian Financial Year Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Financial Year
              </label>
              <Select value={selectedFY} onValueChange={setSelectedFY}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFYs.map(fy => (
                    <SelectItem key={fy} value={fy}>
                      FY {fy} ({getFinancialYearRange(fy).start.getFullYear()}-{getFinancialYearRange(fy).end.getFullYear()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              <div>{fyData.period}</div>
              <div>{fyData.transactionCount} transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FY Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Income</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatIndianCurrency(fyData.income)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatIndianCurrency(fyData.expenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r border ${
          fyData.netSaving >= 0 
            ? 'from-blue-50 to-blue-100 border-blue-200' 
            : 'from-orange-50 to-orange-100 border-orange-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  fyData.netSaving >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  Net {fyData.netSaving >= 0 ? 'Saving' : 'Loss'}
                </p>
                <p className={`text-2xl font-bold ${
                  fyData.netSaving >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {formatIndianCurrency(Math.abs(fyData.netSaving))}
                </p>
              </div>
              <IndianRupee className={`w-8 h-8 ${
                fyData.netSaving >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown - FY {fyData.fyString}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Income</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {fyData.monthlyData.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{month.month}</td>
                    <td className="py-3 px-4 text-right font-mono text-green-600">
                      {formatIndianCurrency(month.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">
                      {formatIndianCurrency(month.expenses)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${
                      month.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {formatIndianCurrency(month.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
