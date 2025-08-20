import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useSubscription } from '@/hooks/useSubscription';
import { ChartDataService } from '@/services/chartDataService';
import { ModernIncomeExpenseChart } from '@/components/dashboard/ModernIncomeExpenseChart';
import { FixedCategoryChart } from '@/components/dashboard/FixedCategoryChart';
import { AIInsightsWidget } from '@/components/dashboard/AIInsightsWidget';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, DollarSign, IndianRupee, TrendingUp, Wallet, FileText, ShieldCheck, CheckCircle2, Brain, Zap } from 'lucide-react';

// Shared utility styles
const glass = 'relative rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.05)]';

function MetricCard({ icon: Icon, label, value, sub, trend }: any) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl bg-white/70 dark:bg-gray-950/40 shadow-inner px-5 py-4 ring-1 ring-black/5 dark:ring-white/5 hover:shadow-lg transition-all">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-blue-600 dark:text-indigo-300 ring-1 ring-inset ring-blue-500/30">
        <Icon className="h-6 w-6" />
        <span className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/30 to-purple-500/30 transition-opacity" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">{trend}{sub}</p>
      </div>
    </div>
  );
}

function Placeholder({ title, lines = [] as string[], icon: Icon }: { title: string; lines?: string[]; icon?: any }) {
  return (
    <div className={`${glass} p-6 overflow-hidden`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <div className="p-2 rounded-xl bg-gradient-to-br from-gray-900/5 to-gray-900/0 dark:from-white/10 dark:to-transparent"><Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" /></div>}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        {lines.map((l,i)=>(<li key={i} className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />{l}</li>))}
      </ul>
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-400/20 blur-2xl" />
    </div>
  );
}

export default function DashboardV2() {
  const navigate = useNavigate();
  const { data, isLoading, refreshData } = useRealTimeData();
  const { subscription } = useSubscription();

  const metrics = useMemo(() => {
    const tx = data?.recentTransactions || [];
    return ChartDataService.calculateMetrics(tx);
  }, [data]);

  const chartData = useMemo(() => ChartDataService.prepareChartData(data || {}), [data]);

  const aiData = {
    monthlyIncome: metrics.monthlyIncome,
    monthlyExpenses: metrics.monthlyExpenses,
    savingsRate: metrics.savingsRate,
    categoryData: chartData.categoryData.map(c => ({ name: c.name, value: c.value }))
  };

  const kpiCards = [
    { icon: Wallet, label: 'Cash Balance', value: ChartDataService.formatIndianCurrency(metrics.totalBalance), sub: '', trend: '' },
    { icon: DollarSign, label: 'Receivables', value: '₹ —', sub: 'Awaiting data', trend: '' },
    { icon: FileText, label: 'Payables', value: '₹ —', sub: 'Coming soon', trend: '' },
    { icon: IndianRupee, label: 'Net Income (M)', value: ChartDataService.formatIndianCurrency(metrics.monthlyIncome - metrics.monthlyExpenses), sub: '', trend: '' },
    { icon: TrendingUp, label: 'Runway Forecast', value: metrics.monthlyExpenses>0? `${Math.max(1,Math.round((metrics.totalBalance)/(metrics.monthlyExpenses||1)))} mo` : '—', sub: 'Est.', trend: '' },
    { icon: ShieldCheck, label: 'GST Liability', value: '₹ —', sub: 'Beta', trend: '' },
  ];

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#ede9fe_0%,transparent_55%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] dark:bg-[radial-gradient(circle_at_20%_20%,#1e293b_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#312e81_0%,transparent_55%),linear-gradient(to_bottom,#0f172a,#1e293b)] text-gray-900 dark:text-white px-6 py-5 md:px-10 lg:px-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" alt="Flow" className="h-10 w-10 rounded-xl shadow ring-1 ring-black/5 dark:ring-white/10" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Executive Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={()=>refreshData()} className="rounded-full">Refresh</Button>
          <Button variant="outline" size="sm" onClick={()=>navigate('/dashboard-classic')} className="rounded-full"><ArrowLeft className="h-4 w-4 mr-1"/>Classic</Button>
          <Button size="sm" className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"><Zap className="h-4 w-4 mr-1"/>AI Chat</Button>
        </div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className={`${glass} p-6 mb-8`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-300"/> Top KPIs</h2>
          {subscription?.plan && <span className="text-[11px] px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 ring-1 ring-blue-500/30 text-blue-700 dark:text-blue-300">{subscription.plan.toUpperCase()} PLAN</span>}
        </div>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {kpiCards.map((k)=> <MetricCard key={k.label} {...k} />)}
        </div>
      </motion.div>

      <div className="grid gap-8 xl:grid-cols-2">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-10%'}} transition={{duration:0.7}} className={`${glass} p-6 h-full flex flex-col`}>
          <h3 className="mb-4 text-base font-semibold tracking-tight flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600"/> Cashflow Forecast & Runway</h3>
          <div className="flex-1 min-h-[340px] rounded-2xl bg-white/40 dark:bg-gray-900/40 p-4 ring-1 ring-black/5 dark:ring-white/5">
            <ModernIncomeExpenseChart data={chartData.monthlyData} transactions={data?.recentTransactions || []} />
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-10%'}} transition={{duration:0.75, delay:0.05}} className="space-y-8">
          <div className={`${glass} p-6`}>
            <h3 className="mb-4 text-base font-semibold tracking-tight flex items-center gap-2"><FileText className="h-5 w-5 text-orange-600"/> Expenses & Vendors</h3>
            <FixedCategoryChart data={chartData.categoryData} />
          </div>
          <div className={`${glass} p-0 overflow-hidden`}>
            <QuickActionsPanel onRefresh={refreshData} />
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-10%'}} transition={{duration:0.7}}>
          <Placeholder
            title="Invoices & Collections"
            icon={FileText}
            lines={[ 'Aging buckets & collection rate visual.', 'Top customers with outstanding amounts.', 'Automated reminder performance.' ]}
          />
        </motion.div>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-10%'}} transition={{duration:0.75}}>
          <Placeholder
            title="Compliance & GST"
            icon={ShieldCheck}
            lines={[ 'GST filing status & due date ticker.', 'Tax liability estimate & projection.', 'Mismatch / anomaly alerts feed.' ]}
          />
        </motion.div>

        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-10%'}} transition={{duration:0.7}} className="xl:col-span-2">
          <div className={`${glass} p-6`}>
            <h3 className="mb-5 text-base font-semibold tracking-tight flex items-center gap-2"><Brain className="h-5 w-5 text-purple-600"/> AI Insights & Nudges</h3>
            <AIInsightsWidget dashboardData={aiData} />
          </div>
        </motion.div>
      </div>

      <div className="mt-12 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Flow • Executive Dashboard Preview</p>
        <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5"/> Optimized for clarity & speed</p>
      </div>
    </div>
  );
}
