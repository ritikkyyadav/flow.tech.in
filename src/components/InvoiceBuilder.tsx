
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Send, FileText, Eye, Calendar } from "lucide-react";
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
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  paymentTerms: string;
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
}

const invoiceTemplates = [
  { id: 'modern', name: 'Modern', description: 'Clean lines, minimal design' },
  { id: 'classic', name: 'Classic', description: 'Traditional layout, formal styling' },
  { id: 'creative', name: 'Creative', description: 'Modern typography, flexible layout' },
  { id: 'minimal', name: 'Minimal', description: 'Maximum white space, essential elements' },
  { id: 'corporate', name: 'Corporate', description: 'Professional header, structured layout' }
];

const taxRates = [
  { value: 0, label: '0% (Exempt)' },
  { value: 5, label: '5% GST' },
  { value: 12, label: '12% GST' },
  { value: 18, label: '18% GST' },
  { value: 28, label: '28% GST' }
];

export const InvoiceBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
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

  useEffect(() => {
    fetchClients();
  }, [user]);

  useEffect(() => {
    calculateTotals();
  }, [invoice.items]);

  const fetchClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.rate;
      return sum + itemAmount;
    }, 0);

    const taxAmount = invoice.items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.rate;
      const tax = (itemAmount * item.taxRate) / 100;
      return sum + tax;
    }, 0);

    const total = subtotal + taxAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      taxRate: 18,
      amount: 0
    };

    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const saveInvoice = async (status: 'draft' | 'sent' = 'draft') => {
    if (!user) return;

    try {
      const invoiceData = {
        ...invoice,
        status,
        user_id: user.id,
        client_id: invoice.clientId,
        invoice_number: invoice.invoiceNumber,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        items: JSON.stringify(invoice.items),
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        total: invoice.total,
        template: selectedTemplate
      };

      const { error } = await supabase
        .from('invoices')
        .insert([invoiceData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invoice ${status === 'draft' ? 'saved as draft' : 'sent to client'}`,
      });

    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const selectedClient = clients.find(c => c.id === invoice.clientId);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Generate professional invoices for your clients</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => saveInvoice('draft')}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => saveInvoice('sent')}>
            <Send className="w-4 h-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Builder Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Template Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {invoiceTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="client">Select Client</Label>
                <Select value={invoice.clientId} onValueChange={(value) => setInvoice(prev => ({ ...prev, clientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice Items</span>
                <Button size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rate (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Tax Rate</Label>
                      <Select
                        value={item.taxRate.toString()}
                        onValueChange={(value) => updateItem(item.id, 'taxRate', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {taxRates.map((rate) => (
                            <SelectItem key={rate.value} value={rate.value.toString()}>
                              {rate.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Label>Amount</Label>
                      <div className="text-sm font-medium p-2 bg-gray-50 rounded">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 mt-6">
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>₹{invoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Payment terms, additional information..."
                value={invoice.notes || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Invoice Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Invoice Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white text-sm">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                  <div className="text-gray-600">
                    <p>Invoice #: {invoice.invoiceNumber}</p>
                    <p>Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
                    <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Client Info */}
                {selectedClient && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <div className="text-gray-700">
                      <p className="font-medium">{selectedClient.name}</p>
                      <p>{selectedClient.email}</p>
                      <p>{selectedClient.phone}</p>
                      {selectedClient.address && (
                        <p className="whitespace-pre-line">{selectedClient.address}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="mb-6">
                  <div className="border-b pb-2 mb-4">
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2">Qty</div>
                      <div className="col-span-2">Rate</div>
                      <div className="col-span-2">Amount</div>
                    </div>
                  </div>
                  {invoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 text-xs mb-2">
                      <div className="col-span-6">{item.description || 'Item'}</div>
                      <div className="col-span-2">{item.quantity}</div>
                      <div className="col-span-2">₹{item.rate}</div>
                      <div className="col-span-2">₹{(item.quantity * item.rate).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{invoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{invoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <Badge 
                    variant={invoice.status === 'paid' ? 'default' : 'outline'}
                    className="capitalize"
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
