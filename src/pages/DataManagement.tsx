
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataImportExport } from "@/components/data/DataImportExport";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const DataManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout activeTab="data">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
            <p className="text-gray-600">Import, export, and manage your financial data</p>
          </div>
          <Button 
            size="sm" 
            onClick={handleRefresh}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
        <DataImportExport key={refreshTrigger} />
      </div>
    </DashboardLayout>
  );
};

export default DataManagement;
