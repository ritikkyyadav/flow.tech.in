
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { IndianFeaturesDashboard } from "@/components/indian/IndianFeaturesDashboard";

const IndianFeatures = () => {
  return (
    <ResponsiveLayout title="Indian Features" activeTab="data">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            🇮🇳 Indian Market Features
          </h1>
          <p className="text-gray-600">
            Specialized features designed for the Indian market including GST calculations, 
            Indian categories, financial year tracking, and regional customizations
          </p>
        </div>
        <IndianFeaturesDashboard />
      </div>
    </ResponsiveLayout>
  );
};

export default IndianFeatures;
