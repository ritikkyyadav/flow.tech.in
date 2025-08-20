import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileBalanceCardProps {
  balance: number;
  currency?: string;
  className?: string;
}

export const MobileBalanceCard = ({ balance, currency = 'INR', className }: MobileBalanceCardProps) => {
  const format = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative overflow-hidden rounded-2xl p-4 text-white mobile-shadow-lg', className)}
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 60%, #F97316 120%)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-white/80">Available Balance</div>
          <div className="text-3xl font-bold mt-1">{format(balance)}</div>
        </div>
        <img src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" alt="card" className="w-12 h-12 opacity-90" />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
        <span>{new Date().toLocaleDateString()}</span>
        <span className="opacity-50">•</span>
        <span>Wallet</span>
      </div>
    </motion.div>
  );
};

export default MobileBalanceCard;
