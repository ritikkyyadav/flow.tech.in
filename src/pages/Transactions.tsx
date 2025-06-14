
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { RecentTransactions } from "@/components/RecentTransactions";
import { useState } from "react";

const Transactions = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ResponsiveLayout title="Transactions" activeTab="transactions">
      <div className="p-4 lg:p-6 space-y-6">
        <RecentTransactions refreshTrigger={refreshTrigger} />
      </div>
    </ResponsiveLayout>
  );
};

export default Transactions;
