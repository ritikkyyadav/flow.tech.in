import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import InvoicePreviewRenderer from "@/components/invoices/InvoicePreviewRenderer";
import { getPdfMake } from "@/lib/pdf";
import { downloadElementPdf } from "@/lib/htmlToPdf";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
};

type Client = { id: string; name: string; email: string | null; phone: string | null; address: string | null } | null;

export default function InvoicePreviewModal({ open, onOpenChange, invoiceId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [client, setClient] = useState<Client>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: inv, error: invErr } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();
        if (invErr) throw invErr;
        if (!active) return;
        setInvoice(inv);

        const { data: its, error: itErr } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('id');
        if (itErr) throw itErr;
        if (!active) return;
        setItems(its || []);

        if (inv.client_id) {
          const { data: cli, error: cliErr } = await supabase
            .from('clients')
            .select('*')
            .eq('id', inv.client_id)
            .single();
          if (cliErr) throw cliErr;
          if (!active) return;
          setClient(cli as any);
        } else {
          setClient(null);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load invoice');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [open, invoiceId]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + Number(it.quantity) * Number(it.rate), 0);
    const taxAmount = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.rate) * Number(it.tax_rate || 0)) / 100, 0);
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  }, [items]);

  const dataReady = !!invoice;
  const template = (invoice?.template as string) || 'modern';

  function buildPdfDoc() {
    if (!invoice) return null;
    const currency = invoice.currency || 'INR';
    const body = [
      [{ text: 'Description', bold: true }, { text: 'Qty', alignment: 'right', bold: true }, { text: 'Rate', alignment: 'right', bold: true }, { text: 'Amount', alignment: 'right', bold: true }],
      ...items.map(it => [
        it.description,
        { text: String(it.quantity), alignment: 'right' },
        { text: `${currency} ${Number(it.rate).toLocaleString()}`, alignment: 'right' },
        { text: `${currency} ${(Number(it.quantity) * Number(it.rate)).toLocaleString()}`, alignment: 'right' }
      ])
    ];
    const totals = {
      subtotal: items.reduce((s, it) => s + Number(it.quantity) * Number(it.rate), 0),
      tax: items.reduce((s, it) => s + (Number(it.quantity) * Number(it.rate) * Number(it.tax_rate || 0)) / 100, 0),
    };
    const total = totals.subtotal + totals.tax;

    const doc: any = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'INVOICE', style: 'header' },
        { text: `Invoice #: ${invoice.invoice_number}`, margin: [0, 2, 0, 0] },
        { text: `Date: ${new Date(invoice.invoice_date).toLocaleDateString()}` },
        { text: `Due: ${new Date(invoice.due_date).toLocaleDateString()}`, margin: [0, 0, 0, 8] },
        client ? { text: `Bill To: ${client.name}\n${client.email || ''}\n${client.phone || ''}\n${client.address || ''}`, margin: [0, 0, 0, 12] } : {},
        { table: { widths: ['*', 40, 70, 80], body }, layout: 'lightHorizontalLines' },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 220,
              table: {
                widths: [120, 100],
                body: [
                  [{ text: 'Subtotal', alignment: 'right' }, { text: `${currency} ${totals.subtotal.toLocaleString()}`, alignment: 'right' }],
                  [{ text: 'Tax', alignment: 'right' }, { text: `${currency} ${totals.tax.toLocaleString()}`, alignment: 'right' }],
                  [{ text: 'Total', alignment: 'right', bold: true }, { text: `${currency} ${total.toLocaleString()}`, alignment: 'right', bold: true }]
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
    try {
      setExporting(true);
      const el = document.querySelector('.print-container .invoice-print-surface') as HTMLElement | null
        || document.querySelector('.print-container') as HTMLElement | null;
      if (el) {
        await downloadElementPdf(el, { fileName: `${invoice!.invoice_number || 'invoice'}.pdf` });
        return;
      }
      const doc = buildPdfDoc();
      if (doc) {
        const pdfMake = await getPdfMake();
        (pdfMake as any).createPdf(doc).download(`${invoice!.invoice_number || 'invoice'}.pdf`);
      }
    } catch (e) {
      console.error('PDF export failed', e);
      alert('Failed to generate PDF.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        {loading && <div className="py-8 text-center text-sm text-gray-600">Loading…</div>}
        {error && <div className="py-8 text-center text-sm text-red-600">{error}</div>}
        {dataReady && (
          <div className="space-y-4">
            <div className="bg-white rounded border print-container">
              <div className="p-4">
                <InvoicePreviewRenderer
                  template={template as any}
                  logoSrc={invoice?.logo_url || ''}
                  client={client}
                  invoice={{
                    invoiceNumber: invoice.invoice_number,
                    issueDate: invoice.invoice_date,
                    dueDate: invoice.due_date,
                    items: items.map(it => ({
                      id: String(it.id),
                      description: it.description,
                      quantity: Number(it.quantity),
                      rate: Number(it.rate),
                      taxRate: Number(it.tax_rate || 0),
                      amount: Number(it.amount || (Number(it.quantity) * Number(it.rate)))
                    })),
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    total: totals.total,
                    notes: invoice.notes,
                    currency: invoice.currency || 'INR',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.print()}>Print</Button>
              <Button onClick={downloadPdf} disabled={exporting}>{exporting ? 'Preparing…' : 'Download PDF'}</Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
