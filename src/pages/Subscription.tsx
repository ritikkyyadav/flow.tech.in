
import { DashboardLayout } from "@/components/DashboardLayout";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

const Subscription = () => {
  return (
    <DashboardLayout activeTab="subscription">
      <div className="min-h-screen bg-gray-50">
        <SubscriptionPlans />
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
