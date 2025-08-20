import { motion } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

type Stat = { label: string; value: string; hint?: string };

export function DashboardHero({ title = "Dashboard", subtitle = "Track your finances with AI-powered insights", stats = [] as Stat[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-transparent dark:from-blue-950/40 dark:via-purple-950/20" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1"
            >
              {subtitle}
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Zap className="w-4 h-4" /> Live
            </span>
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gray-900/5 dark:bg-gray-50/10 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
              <Sparkles className="w-4 h-4" /> AI Insights
            </span>
          </motion.div>
        </div>

        {stats?.length ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/60 p-3"
              >
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className="text-lg font-bold mt-0.5">{s.value}</div>
                {s.hint && <div className="text-[10px] text-gray-500 mt-0.5">{s.hint}</div>}
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardHero;
