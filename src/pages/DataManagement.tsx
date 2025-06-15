
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
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
    <ResponsiveLayout 
      title="Data Management" 
      activeTab="data"
      headerActions={
        <Button 
          size="sm" 
          onClick={handleRefresh}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      }
    >
      <div className="p-4 lg:p-6">
        <DataImportExport key={refreshTrigger} />
      </div>
    </ResponsiveLayout>
  );
};

export default DataManagement;
