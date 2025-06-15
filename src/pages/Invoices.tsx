
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
    console.log("Create invoice button clicked");
    setShowInvoiceBuilder(true);
  };

  const handleInvoiceCreated = () => {
    console.log("Invoice created, returning to list");
    setShowInvoiceModal(false);
    setShowInvoiceBuilder(false);
    // Refresh invoice list if needed
  };

  const handleBackToList = () => {
    console.log("Back to list clicked");
    setShowInvoiceBuilder(false);
  };

  if (showInvoiceBuilder) {
    return (
      <ResponsiveLayout 
        title="Create Invoice" 
        activeTab="invoices"
        headerActions={
          <Button 
            onClick={handleBackToList}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
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
          <Button 
            onClick={handleCreateInvoice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        }
      >
        <div className="p-4 lg:p-6 space-y-6">
          {/* Add a prominent create button at the top */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Management</h2>
              <p className="text-gray-600 text-sm">Create and manage your invoices</p>
            </div>
            <Button 
              onClick={handleCreateInvoice}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-md shadow-sm"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Invoice
            </Button>
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
