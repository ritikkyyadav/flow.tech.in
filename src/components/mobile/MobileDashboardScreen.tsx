import { MobileBalanceCard } from './MobileBalanceCard';
import { MobileQuickActionsRow } from './MobileQuickActionsRow';
import { BillsDueCarousel, BillItem } from './BillsDueCarousel';
import { ModernIncomeExpenseChart } from '@/components/dashboard/ModernIncomeExpenseChart';
import { MobileCard } from './MobileCard';

interface MobileDashboardScreenProps {
  balance: number;
  chartData: any[];
  bills: BillItem[];
  onSend?: () => void;
}

export const MobileDashboardScreen = ({ balance, chartData, bills, onSend }: MobileDashboardScreenProps) => {
  return (
    <div className="space-y-4 mobile-fade-in">
      <MobileBalanceCard balance={balance} />
      <MobileQuickActionsRow onSend={onSend} />
      <MobileCard title="Bills due" padding="md">
        <BillsDueCarousel items={bills} />
      </MobileCard>
      <MobileCard title="Overview" padding="md">
        <ModernIncomeExpenseChart data={chartData as any} />
      </MobileCard>
    </div>
  );
};

export default MobileDashboardScreen;
