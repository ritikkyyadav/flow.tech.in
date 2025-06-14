
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceBuilder } from "@/components/InvoiceBuilder";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { InvoiceModal } from "@/components/InvoiceModal";

const Invoices = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

  const handleCreateInvoice = () => {
    setShowInvoiceBuilder(true);
  };

  const handleInvoiceCreated = () => {
    setShowInvoiceModal(false);
    // Refresh invoice list if needed
  };

  const handleBackToList = () => {
    setShowInvoiceBuilder(false);
  };

  if (showInvoiceBuilder) {
    return (
      <ResponsiveLayout 
        title="Create Invoice" 
        activeTab="invoices"
        showBack={true}
        onBack={handleBackToList}
      >
        <InvoiceBuilder onInvoiceCreated={handleBackToList} />
      </ResponsiveLayout>
    );
  }

  return (
    <>
      <ResponsiveLayout 
        title="Invoices" 
        activeTab="invoices"
        headerActions={
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleCreateInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Quick Add
            </Button>
          </div>
        }
      >
        <div className="p-4 lg:p-6 space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
          </div>
          <InvoiceList />
        </div>
      </ResponsiveLayout>

      {showInvoiceModal && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}
    </>
  );
};

export default Invoices;
