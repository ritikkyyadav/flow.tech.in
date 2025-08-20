import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Send, FileText, Eye, Upload, ImageIcon } from "lucide-react";
import { getPdfMake } from "@/lib/pdf";
import { downloadElementPdf, openElementPdf } from "@/lib/htmlToPdf";
import InvoicePreviewRenderer from "@/components/invoices/InvoicePreviewRenderer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface Invoice {
  id?: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  template: string;
  logoUrl?: string;
}

const invoiceTemplates = [
  { id: 'modern', name: 'Modern', description: 'Clean lines, minimal design' },
  { id: 'classic', name: 'Classic', description: 'Traditional layout, formal styling' },
  { id: 'creative', name: 'Creative', description: 'Modern typography, flexible layout' },
  { id: 'minimal', name: 'Minimal', description: 'Maximum white space, essential elements' },
  { id: 'corporate', name: 'Corporate', description: 'Professional header, structured layout' }
] as const;

type TemplateId = typeof invoiceTemplates[number]['id'];

const taxRates = [
  { value: 0, label: '0% (Exempt)' },
  { value: 5, label: '5% GST' },
  { value: 12, label: '12% GST' },
  { value: 18, label: '18% GST' },
  { value: 28, label: '28% GST' }
];

export const InvoiceBuilder = ({ onInvoiceCreated }: { onInvoiceCreated?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: '1', description: '', quantity: 1, rate: 0, taxRate: 18, amount: 0 }],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    status: 'draft',
    template: 'modern'
  });

  useEffect(() => { if (user) fetchClients(); }, [user]);
  useEffect(() => {
    const subtotal = invoice.items.reduce((s, it) => s + it.quantity * it.rate, 0);
    const taxAmount = invoice.items.reduce((s, it) => s + (it.quantity * it.rate * it.taxRate) / 100, 0);
    setInvoice(prev => ({ ...prev, subtotal, taxAmount, total: subtotal + taxAmount }));
  }, [invoice.items]);

  async function fetchClients() {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to fetch clients', variant: 'destructive' });
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    toast({ title: 'Logo uploaded', description: 'Logo has been added to your invoice' });
  }

  function addItem() {
    setInvoice(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, taxRate: 18, amount: 0 }] }));
  }
  function removeItem(id: string) {
    if (invoice.items.length <= 1) return;
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }
  function updateItem(id: string, field: keyof InvoiceItem, value: any) {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value, amount: (field === 'quantity' || field === 'rate') ? (field === 'quantity' ? value : i.quantity) * (field === 'rate' ? value : i.rate) : i.amount } : i)
    }));
  }

  async function saveInvoice(status: 'draft' | 'sent' = 'draft') {
    if (!user) return;
    if (!invoice.clientId) { toast({ title: 'Client Required', description: 'Please select a client', variant: 'destructive' }); return; }
    if (invoice.items.some(it => !it.description || it.rate <= 0)) { toast({ title: 'Invalid Items', description: 'Add description and rate for all items', variant: 'destructive' }); return; }
    try {
      let payload: any = {
        user_id: user.id,
        client_id: invoice.clientId,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.issueDate,
        due_date: invoice.dueDate,
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        total: invoice.total,
        status,
        notes: invoice.notes || null,
        currency: 'INR',
        template: selectedTemplate,
      };
      let { data: created, error } = await supabase.from('invoices').insert([payload]).select().single();
      if ((error && (error as any).code === '42703') || (error && (error.message || '').toLowerCase().includes('column') && (error.message || '').toLowerCase().includes('template'))) {
        delete payload.template;
        const retry = await supabase.from('invoices').insert([payload]).select().single();
        created = retry.data as any; error = retry.error as any;
        if (!error) toast({ title: 'Saved without template', description: "Invoice saved but template wasn't stored. Run the latest DB migration to enable template persistence." });
      }
      if (error) throw error;
      const itemsData = invoice.items.map(it => ({ invoice_id: created!.id, description: it.description, quantity: it.quantity, rate: it.rate, amount: it.amount, tax_rate: it.taxRate }));
      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsData);
      if (itemsError) throw itemsError;
      toast({ title: 'Success', description: `Invoice ${status === 'draft' ? 'saved as draft' : 'sent to client'}` });
      onInvoiceCreated?.();
    } catch (e) {
      console.error('Error saving invoice', e);
      toast({ title: 'Error', description: 'Failed to save invoice', variant: 'destructive' });
    }
  }

  const selectedClient = clients.find(c => c.id === invoice.clientId) || null;

  function buildPdfDoc() {
    const currencySymbol = '₹';
    const body = [
      [
        { text: 'Description', bold: true },
        { text: 'Qty', alignment: 'right', bold: true },
        { text: 'Rate', alignment: 'right', bold: true },
        { text: 'Amount', alignment: 'right', bold: true }
      ],
      ...invoice.items.map(it => [
        it.description || 'Item',
        { text: String(it.quantity), alignment: 'right' },
        { text: `${currencySymbol} ${Number(it.rate).toLocaleString()}`, alignment: 'right' },
        { text: `${currencySymbol} ${(Number(it.quantity) * Number(it.rate)).toLocaleString()}`, alignment: 'right' }
      ])
    ];
    const doc: any = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'INVOICE', style: 'header' },
        invoice.invoiceNumber ? { text: `Invoice #: ${invoice.invoiceNumber}`, margin: [0, 2, 0, 0] } : {},
        { text: `Date: ${new Date(invoice.issueDate).toLocaleDateString()}` },
        { text: `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, margin: [0, 0, 0, 8] },
        selectedClient ? { text: `Bill To: ${selectedClient.name}\n${selectedClient.email || ''}\n${selectedClient.phone || ''}\n${selectedClient.address || ''}`, margin: [0, 0, 0, 12] } : {},
        logoPreview ? { image: logoPreview, fit: [80, 80], alignment: 'right', margin: [0, 0, 0, 8] } : {},
        { table: { widths: ['*', 40, 70, 80], body }, layout: 'lightHorizontalLines' },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 220,
              table: {
                widths: [120, 100],
                body: [
                  [{ text: 'Subtotal', alignment: 'right' }, { text: `${currencySymbol} ${invoice.subtotal.toLocaleString()}`, alignment: 'right' }],
                  [{ text: 'Tax', alignment: 'right' }, { text: `${currencySymbol} ${invoice.taxAmount.toLocaleString()}`, alignment: 'right' }],
                  [{ text: 'Total', alignment: 'right', bold: true }, { text: `${currencySymbol} ${invoice.total.toLocaleString()}`, alignment: 'right', bold: true }]
                ]
              },
              layout: 'noBorders',
              margin: [0, 8, 0, 0]
            }
          ]
        },
        invoice.notes ? { text: `Notes: ${invoice.notes}`, margin: [0, 12, 0, 0], style: 'notes' } : {}
      ],
      styles: {
        header: { fontSize: 20, bold: true },
        notes: { fontSize: 10, color: '#555' }
      },
      defaultStyle: { fontSize: 10 }
    };
    return doc;
  }

  async function downloadPdf() {
    // Prefer DOM export for design fidelity; fallback to doc if preview not available
    try {
      setExporting(true);
      const el = previewRef.current;
      if (el) {
        await downloadElementPdf(el, { fileName: `${invoice.invoiceNumber || 'invoice'}.pdf` });
        return;
      }
      const doc = buildPdfDoc();
      if (doc) {
        const pdfMake = await getPdfMake();
        (pdfMake as any).createPdf(doc).download(`${invoice.invoiceNumber || 'invoice'}.pdf`);
      }
    } catch (e) {
      console.error('PDF export failed', e);
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  }

  async function viewPdf() {
    try {
      setExporting(true);
      const el = previewRef.current;
      if (el) {
        await openElementPdf(el, { fileName: `${invoice.invoiceNumber || 'invoice'}.pdf` });
        return;
      }
      const doc = buildPdfDoc();
      if (doc) {
        const pdfMake = await getPdfMake();
        (pdfMake as any).createPdf(doc).open();
      }
    } catch (e) {
      console.error('PDF open failed', e);
      toast({ title: 'Error', description: 'Failed to open PDF preview', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Generate professional invoices for your clients</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => saveInvoice('draft')}><Save className="w-4 h-4 mr-2" />Save Draft</Button>
          <Button onClick={() => saveInvoice('sent')}><Send className="w-4 h-4 mr-2" />Send Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center space-x-2"><ImageIcon className="w-5 h-5" /><span>Company Logo</span></CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="w-4 h-4 mr-2" />Upload Logo</Button>
                </div>
                {logoPreview && (<div className="w-16 h-16 border rounded-lg overflow-hidden"><img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" /></div>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center space-x-2"><FileText className="w-5 h-5" /><span>Template Selection</span></CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {invoiceTemplates.map(t => (
                  <div key={t.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => { setSelectedTemplate(t.id as TemplateId); setInvoice(p => ({ ...p, template: t.id })); }}>
                    <h3 className="font-medium">{t.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="invoiceNumber">Invoice Number</Label><Input id="invoiceNumber" value={invoice.invoiceNumber} onChange={(e) => setInvoice(p => ({ ...p, invoiceNumber: e.target.value }))} /></div>
                <div><Label htmlFor="issueDate">Issue Date</Label><Input id="issueDate" type="date" value={invoice.issueDate} onChange={(e) => setInvoice(p => ({ ...p, issueDate: e.target.value }))} /></div>
                <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" value={invoice.dueDate} onChange={(e) => setInvoice(p => ({ ...p, dueDate: e.target.value }))} /></div>
              </div>
              <div>
                <Label htmlFor="client">Select Client *</Label>
                <Select value={invoice.clientId} onValueChange={(value) => setInvoice(p => ({ ...p, clientId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose a client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (<SelectItem key={c.id} value={c.id}>{c.name} {c.email ? `- ${c.email}` : ''}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between"><span>Invoice Items</span><Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-2" />Add Item</Button></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                    <div className="col-span-4"><Label>Description *</Label><Input placeholder="Item description..." value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></div>
                    <div className="col-span-2"><Label>Quantity</Label><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)} /></div>
                    <div className="col-span-2"><Label>Rate (₹) *</Label><Input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2"><Label>Tax Rate</Label>
                      <Select value={item.taxRate.toString()} onValueChange={(v) => updateItem(item.id, 'taxRate', parseInt(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{taxRates.map(r => (<SelectItem key={r.value} value={r.value.toString()}>{r.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1"><Label>Amount</Label><div className="text-sm font-medium p-2 bg-gray-50 rounded">₹{(item.quantity * item.rate).toLocaleString()}</div></div>
                    <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button></div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-6">
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₹{invoice.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax Amount:</span><span>₹{invoice.taxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>₹{invoice.total.toLocaleString()}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
            <CardContent><Textarea placeholder="Payment terms, additional information..." value={invoice.notes || ''} onChange={(e) => setInvoice(p => ({ ...p, notes: e.target.value }))} rows={3} /></CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader><CardTitle className="flex items-center space-x-2"><Eye className="w-5 h-5" /><span>Invoice Preview</span></CardTitle></CardHeader>
            <CardContent>
              <div ref={previewRef} className="print-container">
              <InvoicePreviewRenderer
                template={selectedTemplate}
                logoSrc={logoPreview}
                client={selectedClient}
                invoice={{
                  invoiceNumber: invoice.invoiceNumber,
                  issueDate: invoice.issueDate,
                  dueDate: invoice.dueDate,
                  items: invoice.items,
                  subtotal: invoice.subtotal,
                  taxAmount: invoice.taxAmount,
                  total: invoice.total,
                  notes: invoice.notes,
                  currency: 'INR',
                }}
              />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => window.print()}>Print</Button>
                <Button variant="outline" onClick={viewPdf} disabled={exporting}><FileText className="w-4 h-4 mr-2" />{exporting ? 'Preparing…' : 'View PDF'}</Button>
                <Button onClick={downloadPdf} disabled={exporting}><FileText className="w-4 h-4 mr-2" />{exporting ? 'Preparing…' : 'Download PDF'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;

