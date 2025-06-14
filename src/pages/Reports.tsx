
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { BusinessAnalytics } from "@/components/BusinessAnalytics";

const Reports = () => {
  return (
    <ResponsiveLayout title="Reports" activeTab="reports">
      <div className="p-4 lg:p-6 space-y-6">
        <BusinessAnalytics />
      </div>
    </ResponsiveLayout>
  );
};

export default Reports;
