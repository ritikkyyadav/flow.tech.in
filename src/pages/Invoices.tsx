
import { ResponsiveLayout } from "@/components/mobile/ResponsiveLayout";
import { InvoiceList } from "@/components/InvoiceList";

const Invoices = () => {
  return (
    <ResponsiveLayout title="Invoices" activeTab="invoices">
      <div className="p-4 lg:p-6 space-y-6">
        <InvoiceList />
      </div>
    </ResponsiveLayout>
  );
};

export default Invoices;
