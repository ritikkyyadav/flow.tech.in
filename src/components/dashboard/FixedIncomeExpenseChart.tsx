
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IncomeExpenseData, ChartDataService } from '@/services/chartDataService';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

type Preset = '1d' | '7d' | '1m' | '6m' | '12m' | '1y' | 'custom';

interface FixedIncomeExpenseChartProps {
  data: IncomeExpenseData[];
  transactions?: Array<{ amount: number; type: 'income' | 'expense'; transaction_date: string | Date }>;
  loading?: boolean;
  className?: string;
}

export const FixedIncomeExpenseChart: React.FC<FixedIncomeExpenseChartProps> = ({ 
  data, 
  transactions = [],
  loading = false, 
  className = "" 
}) => {
  const [showIncome, setShowIncome] = React.useState(true);
  const [showExpenses, setShowExpenses] = React.useState(true);
  const [preset, setPreset] = React.useState<Preset>('6m');
  const [customDays, setCustomDays] = React.useState(90);

  const computedData = React.useMemo(() => {
    if (transactions && transactions.length > 0) {
      return ChartDataService.buildTimeSeries(transactions as any, preset, customDays);
    }
    return data;
  }, [transactions, preset, customDays, data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {ChartDataService.formatIndianCurrency(entry.value)}
            </p>
          ))}
          {payload.length === 2 && (
            <p className="text-sm font-medium text-gray-700 mt-1 pt-1 border-t">
              Net: {ChartDataService.formatIndianCurrency(payload[0].payload.net)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Income vs Expenses Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Income vs Expenses Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No transaction data available</p>
              <p className="text-gray-400 text-sm">Add some transactions to see your financial trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Income vs Expenses Trend</span>
        </CardTitle>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {([
            { k: '1d', l: '1D' },
            { k: '7d', l: '1W' },
            { k: '1m', l: '1M' },
            { k: '6m', l: '6M' },
            { k: '12m', l: '12M' },
            { k: '1y', l: '1Y' },
            { k: 'custom', l: 'Custom' },
          ] as Array<{ k: Preset; l: string }>).map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setPreset(k)}
              className={cn(
                'text-xs px-3 py-1 rounded-full border transition',
                preset === k
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              {l}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>1 day</span>
              <span>{customDays} days</span>
              <span>365 days</span>
            </div>
            <Slider min={1} max={365} step={1} value={[customDays]} onValueChange={(v) => setCustomDays(v[0] ?? 30)} />
          </div>
        )}
        <div className="mt-2 flex gap-2 flex-wrap">
          <button
            className={`text-xs px-3 py-1 rounded-full border transition ${showIncome ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}
            onClick={() => setShowIncome((v) => !v)}
          >
            Income
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full border transition ${showExpenses ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-gray-200 text-gray-600'}`}
            onClick={() => setShowExpenses((v) => !v)}
          >
            Expenses
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={computedData} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => ChartDataService.formatIndianCurrency(v)} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            {showIncome && (
              <>
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2.5} fill="url(#incomeGradient)" isAnimationActive />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} isAnimationActive={false} />
              </>
            )}
            {showExpenses && (
              <>
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseGradient)" isAnimationActive />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444' }} isAnimationActive={false} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
