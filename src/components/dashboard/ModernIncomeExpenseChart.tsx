import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { IncomeExpenseData, ChartDataService } from '@/services/chartDataService';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

type Preset = '1d' | '7d' | '1m' | '6m' | '12m' | '1y' | 'custom';

interface ModernIncomeExpenseChartProps {
  data: IncomeExpenseData[];
  transactions?: Array<{ amount: number; type: 'income' | 'expense'; transaction_date: string | Date }>;
  loading?: boolean;
  className?: string;
}

// Custom cursor that mimics the vertical soft bar highlight in the inspiration
const SoftBarCursor: React.FC<any> = (props) => {
  const { points, width, height } = props;
  if (!points || !points[0]) return null;
  const x = points[0].x - 12; // center the bar
  return (
    <g>
      <defs>
        <linearGradient id="softBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.0} />
          <stop offset="50%" stopColor="#C4B5FD" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <rect x={x} y={0} width={24} height={height} fill="url(#softBar)" rx={12} />
    </g>
  );
};

// Custom tooltip pill
const PillTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value ?? 0;
    const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0;
    const net = (income as number) - (expenses as number);
    return (
      <div className="rounded-xl shadow-xl bg-white px-3 py-2 border border-gray-200">
        <div className="text-[11px] text-gray-500">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-gray-900">
          {ChartDataService.formatIndianCurrency(net)}
        </div>
        <div className="mt-1 text-[11px] text-gray-500 flex gap-2">
          <span className="text-emerald-600">Inc: {ChartDataService.formatIndianCurrency(income as number)}</span>
          <span className="text-rose-600">Exp: {ChartDataService.formatIndianCurrency(expenses as number)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ModernIncomeExpenseChart: React.FC<ModernIncomeExpenseChartProps> = ({
  data,
  transactions = [],
  loading = false,
  className = ''
}) => {
  const [preset, setPreset] = React.useState<Preset>('6m');
  const [customDays, setCustomDays] = React.useState(90);
  const [showIncome, setShowIncome] = React.useState(true);
  const [showExpenses, setShowExpenses] = React.useState(true);

  const computedData = React.useMemo(() => {
    if (transactions && transactions.length > 0) {
      return ChartDataService.buildTimeSeries(transactions as any, preset, customDays);
    }
    return data;
  }, [transactions, preset, customDays, data]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-200/50 via-purple-100/30 to-violet-50/20 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base text-gray-800">Income vs Expenses</CardTitle>
          <button className="inline-flex items-center gap-1 text-[11px] sm:text-xs px-2 py-1 rounded-full bg-white/60 backdrop-blur border border-white/60 text-gray-700 hover:bg-white transition">
            <FileText className="w-3.5 h-3.5" />
            Report
          </button>
        </div>

        <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
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
                'text-[11px] px-3 py-1 rounded-full border transition',
                preset === k
                  ? 'bg-violet-600 border-violet-600 text-white shadow'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="relative z-10 mt-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span>1 day</span>
              <span>{customDays} days</span>
              <span>365 days</span>
            </div>
            <Slider min={1} max={365} step={1} value={[customDays]} onValueChange={(v) => setCustomDays(v[0] ?? 30)} />
          </div>
        )}

        <div className="relative z-10 mt-2 flex gap-2 flex-wrap">
          <button
            className={cn('text-[11px] px-3 py-1 rounded-full border', showIncome ? 'bg-emerald-100/70 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-600')}
            onClick={() => setShowIncome((v) => !v)}
          >
            Income
          </button>
          <button
            className={cn('text-[11px] px-3 py-1 rounded-full border', showExpenses ? 'bg-rose-100/70 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-600')}
            onClick={() => setShowExpenses((v) => !v)}
          >
            Expenses
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative h-[320px] rounded-xl bg-gradient-to-t from-violet-100/40 via-white to-white">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={computedData} margin={{ top: 20, right: 24, left: 8, bottom: 8 }}>
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5FF" />
              <XAxis dataKey="month" stroke="#7C7BA6" fontSize={12} tickMargin={8} />
              <YAxis stroke="#7C7BA6" fontSize={12} tickFormatter={(v) => ChartDataService.formatIndianCurrency(v)} tickMargin={8} />
              <Tooltip content={<PillTooltip />} cursor={<SoftBarCursor />} />
              {showIncome && (
                <Line type="monotone" dataKey="income" name="Income" stroke="#84CC16" strokeWidth={3}
                  dot={{ r: 3.5, stroke: '#84CC16', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#84CC16', strokeWidth: 3, fill: '#ffffff' }}
                  filter="url(#glow)"
                />
              )}
              {showExpenses && (
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FB7185" strokeWidth={2.5}
                  dot={{ r: 3, stroke: '#FB7185', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#FB7185', strokeWidth: 3, fill: '#ffffff' }}
                />
              )}
              <Legend verticalAlign="bottom" height={24} wrapperStyle={{ paddingTop: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernIncomeExpenseChart;
