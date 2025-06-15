
import { DashboardLayout } from "@/components/DashboardLayout";
import { FinancialReports } from "@/components/reports/FinancialReports";

const Reports = () => {
  return (
    <DashboardLayout activeTab="reports">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">
            Comprehensive financial analysis and reporting for your business
          </p>
        </div>
        <FinancialReports />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
