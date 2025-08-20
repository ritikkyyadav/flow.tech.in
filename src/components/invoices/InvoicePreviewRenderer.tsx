import React from "react";

type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate?: number;
};

export type InvoicePreviewData = {
  invoiceNumber?: string;
  issueDate: string; // ISO or date-like string
  dueDate: string;   // ISO or date-like string
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  currency?: string; // e.g., "INR"
};

export type ClientInfo = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
} | null;

export interface InvoicePreviewRendererProps {
  template: "modern" | "classic" | "creative" | "minimal" | "corporate";
  invoice: InvoicePreviewData;
  client: ClientInfo;
  logoSrc?: string;
}

const Money = ({ value, currency = "₹" }: { value: number; currency?: string }) => (
  <span>
    {currency}{value.toLocaleString()}
  </span>
);

const HeaderBlock = ({ title, invoiceNumber, issueDate, dueDate, logoSrc, align = "between" as const }) => (
  <div className={`mb-6 flex items-start justify-${align} gap-4`}>
    <div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <div className="text-gray-600 text-sm">
        {invoiceNumber && <p>Invoice #: {invoiceNumber}</p>}
        <p>Date: {new Date(issueDate).toLocaleDateString()}</p>
        <p>Due: {new Date(dueDate).toLocaleDateString()}</p>
      </div>
    </div>
    {logoSrc && (
      <div className="w-16 h-16">
        <img src={logoSrc} alt="Company Logo" className="w-full h-full object-contain" />
      </div>
    )}
  </div>
);

const ClientBlock = ({ client }: { client: ClientInfo }) => (
  client ? (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Bill To:</h3>
      <div className="text-gray-700 text-sm">
        <p className="font-medium">{client.name}</p>
        {client.email && <p>{client.email}</p>}
        {client.phone && <p>{client.phone}</p>}
        {client.address && <p className="whitespace-pre-line">{client.address}</p>}
      </div>
    </div>
  ) : null
);

const ItemsTable = ({ items, currency = "₹", compact = false }: { items: InvoiceItem[]; currency?: string; compact?: boolean }) => (
  <div className="mb-6">
    <div className={`border-b pb-2 mb-4 ${compact ? "text-[11px]" : "text-xs"} font-semibold`}>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-6">Item</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-2">Rate</div>
        <div className="col-span-2">Amount</div>
      </div>
    </div>
    {items.map((item) => (
      <div key={item.id || item.description} className={`grid grid-cols-12 gap-2 ${compact ? "text-[11px]" : "text-xs"} mb-2`}>
        <div className="col-span-6">{item.description || "Item"}</div>
        <div className="col-span-2">{item.quantity}</div>
        <div className="col-span-2">{currency}{item.rate}</div>
        <div className="col-span-2">{currency}{(item.quantity * item.rate).toLocaleString()}</div>
      </div>
    ))}
  </div>
);

const TotalsBlock = ({ subtotal, taxAmount, total, currency = "₹", emphasize = false }: { subtotal: number; taxAmount: number; total: number; currency?: string; emphasize?: boolean }) => (
  <div className="border-t pt-4">
    <div className={`space-y-1 ${emphasize ? "text-[15px]" : "text-sm"}`}>
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <Money value={subtotal} currency={currency} />
      </div>
      <div className="flex justify-between">
        <span>Tax:</span>
        <Money value={taxAmount} currency={currency} />
      </div>
      <div className={`flex justify-between font-bold border-t pt-2 ${emphasize ? "text-lg" : ""}`}>
        <span>Total:</span>
        <Money value={total} currency={currency} />
      </div>
    </div>
  </div>
);

// Templates
const ModernTemplate = ({ data, client, logoSrc }: { data: InvoicePreviewData; client: ClientInfo; logoSrc?: string }) => (
  <div className="border rounded-lg p-6 bg-white invoice-print-surface">
    <HeaderBlock title="INVOICE" invoiceNumber={data.invoiceNumber} issueDate={data.issueDate} dueDate={data.dueDate} logoSrc={logoSrc} />
    <ClientBlock client={client} />
    <ItemsTable items={data.items} />
    <TotalsBlock subtotal={data.subtotal} taxAmount={data.taxAmount} total={data.total} />
    {data.notes && <div className="mt-4 text-xs text-gray-600"><span className="font-medium">Notes:</span> {data.notes}</div>}
  </div>
);

const ClassicTemplate = ({ data, client, logoSrc }: { data: InvoicePreviewData; client: ClientInfo; logoSrc?: string }) => (
  <div className="border rounded-lg p-6 bg-white font-serif invoice-print-surface">
    <HeaderBlock title="Invoice" invoiceNumber={data.invoiceNumber} issueDate={data.issueDate} dueDate={data.dueDate} logoSrc={logoSrc} align="between" />
    <hr className="my-4" />
    <ClientBlock client={client} />
    <div className="mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Rate</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id || item.description} className="border-b">
              <td className="py-2">{item.description || "Item"}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">₹{item.rate}</td>
              <td className="py-2 text-right">₹{(item.quantity * item.rate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="ml-auto max-w-xs">
      <TotalsBlock subtotal={data.subtotal} taxAmount={data.taxAmount} total={data.total} />
    </div>
    {data.notes && <div className="mt-4 text-xs text-gray-700"><em>{data.notes}</em></div>}
  </div>
);

const MinimalTemplate = ({ data, client, logoSrc }: { data: InvoicePreviewData; client: ClientInfo; logoSrc?: string }) => (
  <div className="rounded-lg p-6 bg-white invoice-print-surface">
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="tracking-widest text-gray-500 text-xs">INVOICE</div>
        <div className="text-gray-600 text-xs mt-1">#{data.invoiceNumber}</div>
      </div>
      {logoSrc && <img src={logoSrc} alt="Logo" className="w-12 h-12 object-contain" />}
    </div>
    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
      <div>
        <div className="text-gray-500">Date</div>
        <div>{new Date(data.issueDate).toLocaleDateString()}</div>
      </div>
      <div className="text-right">
        <div className="text-gray-500">Due</div>
        <div>{new Date(data.dueDate).toLocaleDateString()}</div>
      </div>
    </div>
    <ClientBlock client={client} />
    <ItemsTable items={data.items} compact />
    <TotalsBlock subtotal={data.subtotal} taxAmount={data.taxAmount} total={data.total} emphasize />
  </div>
);

const CorporateTemplate = ({ data, client, logoSrc }: { data: InvoicePreviewData; client: ClientInfo; logoSrc?: string }) => (
  <div className="rounded-lg overflow-hidden bg-white invoice-print-surface">
    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white flex items-center justify-between">
      <div>
        <div className="uppercase tracking-wider text-sm">Invoice</div>
        <div className="text-xs opacity-90">#{data.invoiceNumber}</div>
      </div>
      {logoSrc && <img src={logoSrc} alt="Logo" className="w-12 h-12 object-contain" />}
    </div>
    <div className="p-6">
      <ClientBlock client={client} />
      <ItemsTable items={data.items} />
      <div className="ml-auto max-w-xs">
        <TotalsBlock subtotal={data.subtotal} taxAmount={data.taxAmount} total={data.total} />
      </div>
      {data.notes && <div className="mt-4 text-xs text-gray-600">{data.notes}</div>}
    </div>
  </div>
);

const CreativeTemplate = ({ data, client, logoSrc }: { data: InvoicePreviewData; client: ClientInfo; logoSrc?: string }) => (
  <div className="rounded-lg bg-white invoice-print-surface">
    <div className="flex">
      <div className="w-2 bg-gradient-to-b from-blue-600 to-orange-500" />
      <div className="flex-1 p-6">
        <HeaderBlock title="INVOICE" invoiceNumber={data.invoiceNumber} issueDate={data.issueDate} dueDate={data.dueDate} logoSrc={logoSrc} />
        <ClientBlock client={client} />
        <ItemsTable items={data.items} />
        <TotalsBlock subtotal={data.subtotal} taxAmount={data.taxAmount} total={data.total} />
      </div>
    </div>
  </div>
);

export const InvoicePreviewRenderer: React.FC<InvoicePreviewRendererProps> = ({ template, invoice, client, logoSrc }) => {
  const data: InvoicePreviewData = {
    currency: invoice.currency || "₹",
    ...invoice,
  };

  switch (template) {
    case "classic":
      return <ClassicTemplate data={data} client={client} logoSrc={logoSrc} />;
    case "minimal":
      return <MinimalTemplate data={data} client={client} logoSrc={logoSrc} />;
    case "corporate":
      return <CorporateTemplate data={data} client={client} logoSrc={logoSrc} />;
    case "creative":
      return <CreativeTemplate data={data} client={client} logoSrc={logoSrc} />;
    case "modern":
    default:
      return <ModernTemplate data={data} client={client} logoSrc={logoSrc} />;
  }
};

export default InvoicePreviewRenderer;
