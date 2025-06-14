
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarIcon, Upload, Calculator, Split, Clock, MapPin, Receipt } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onTransactionAdded: () => void;
  editTransaction?: any;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const TransactionModal = ({ isOpen, onClose, type, onTransactionAdded, editTransaction }: TransactionModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    transaction_date: new Date(),
    source_client: '',
    vendor_merchant: '',
    location: '',
    payment_method: '',
    reference_number: '',
    is_business_related: false,
    is_reimbursable: false,
    is_tax_exempt: false,
    tds_amount: '',
    tax_rate: '',
    is_recurring: false,
    recurring_frequency: '',
    recurring_end_date: null as Date | null,
    recurring_occurrences: ''
  });

  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Digital Wallet'];
  const recurringFrequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (type === 'income') {
        fetchClients();
      }
      if (editTransaction) {
        populateEditData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, type, editTransaction]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const populateEditData = () => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        subcategory: editTransaction.subcategory || '',
        description: editTransaction.description || '',
        transaction_date: new Date(editTransaction.transaction_date),
        source_client: editTransaction.source_client || '',
        vendor_merchant: editTransaction.vendor_merchant || '',
        location: editTransaction.location || '',
        payment_method: editTransaction.payment_method || '',
        reference_number: editTransaction.reference_number || '',
        is_business_related: editTransaction.is_business_related || false,
        is_reimbursable: editTransaction.is_reimbursable || false,
        is_tax_exempt: editTransaction.is_tax_exempt || false,
        tds_amount: editTransaction.tds_amount?.toString() || '',
        tax_rate: editTransaction.tax_rate?.toString() || '',
        is_recurring: editTransaction.is_recurring || false,
        recurring_frequency: editTransaction.recurring_frequency || '',
        recurring_end_date: editTransaction.recurring_end_date ? new Date(editTransaction.recurring_end_date) : null,
        recurring_occurrences: editTransaction.recurring_occurrences?.toString() || ''
      });
      setShowRecurring(editTransaction.is_recurring || false);
      setShowTaxDetails(editTransaction.is_business_related || false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      subcategory: '',
      description: '',
      transaction_date: new Date(),
      source_client: '',
      vendor_merchant: '',
      location: '',
      payment_method: '',
      reference_number: '',
      is_business_related: false,
      is_reimbursable: false,
      is_tax_exempt: false,
      tds_amount: '',
      tax_rate: '',
      is_recurring: false,
      recurring_frequency: '',
      recurring_end_date: null,
      recurring_occurrences: ''
    });
    setShowRecurring(false);
    setShowTaxDetails(false);
    setAttachments([]);
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(number);
  };

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    if (parseFloat(cleanValue) <= 10000000) {
      setFormData({ ...formData, amount: cleanValue });
    }
  };

  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only JPG, PNG, and PDF files under 5MB are allowed",
        variant: "destructive",
      });
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (transactionId: string) => {
    for (const file of attachments) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${transactionId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('transaction-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      const { error: dbError } = await supabase
        .from('transaction_attachments')
        .insert({
          transaction_id: transactionId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) {
        console.error('Error saving attachment record:', dbError);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add transactions",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || !formData.category || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in amount, category, and description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        user_id: user.id,
        type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description,
        transaction_date: formData.transaction_date.toISOString(),
        source_client: formData.source_client || null,
        vendor_merchant: formData.vendor_merchant || null,
        location: formData.location || null,
        payment_method: formData.payment_method || null,
        reference_number: formData.reference_number || null,
        is_business_related: formData.is_business_related,
        is_reimbursable: formData.is_reimbursable,
        is_tax_exempt: formData.is_tax_exempt,
        tds_amount: formData.tds_amount ? parseFloat(formData.tds_amount) : 0,
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : 0,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.recurring_frequency || null,
        recurring_end_date: formData.recurring_end_date?.toISOString() || null,
        recurring_occurrences: formData.recurring_occurrences ? parseInt(formData.recurring_occurrences) : null
      };

      let result;
      if (editTransaction) {
        result = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editTransaction.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(result.data.id);
      }

      toast({
        title: "Success",
        description: `${type === 'income' ? 'Income' : 'Expense'} ${editTransaction ? 'updated' : 'added'} successfully`,
      });

      onTransactionAdded();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            {editTransaction ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label htmlFor="amount" className="text-lg font-medium">Amount (₹)</Label>
            <div className="mt-2 space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-600">₹</span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={formData.amount ? formatCurrency(formData.amount) : ''}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-8 text-2xl font-semibold h-14"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(amount)}
                    className="text-sm"
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </Button>
                ))}
                <Button type="button" variant="outline" size="sm">
                  <Calculator className="w-4 h-4 mr-1" />
                  Calculator
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div>
                <Label>Transaction Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.transaction_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.transaction_date ? format(formData.transaction_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.transaction_date}
                      onSelect={(date) => date && setFormData({ ...formData, transaction_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe this ${type}...`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>

              {/* Source/Vendor */}
              {type === 'income' ? (
                <div>
                  <Label htmlFor="source_client">Source/Client</Label>
                  <div className="flex gap-2">
                    <Select value={formData.source_client} onValueChange={(value) => setFormData({ ...formData, source_client: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon">
                      <span className="text-lg">+</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="vendor_merchant">Vendor/Merchant</Label>
                  <Input
                    id="vendor_merchant"
                    value={formData.vendor_merchant}
                    onChange={(e) => setFormData({ ...formData, vendor_merchant: e.target.value })}
                    placeholder="Enter vendor name"
                  />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Payment Method */}
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference Number */}
              <div>
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  placeholder="Transaction ID, check number, etc."
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Business & Tax Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="business_related">Business Related</Label>
                  <Switch
                    id="business_related"
                    checked={formData.is_business_related}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, is_business_related: checked });
                      setShowTaxDetails(checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reimbursable">Reimbursable</Label>
                  <Switch
                    id="reimbursable"
                    checked={formData.is_reimbursable}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_reimbursable: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="recurring">Recurring</Label>
                  <Switch
                    id="recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, is_recurring: checked });
                      setShowRecurring(checked);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Details */}
          {showTaxDetails && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-blue-900">Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax_exempt">Tax Exempt</Label>
                  <Switch
                    id="tax_exempt"
                    checked={formData.is_tax_exempt}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_tax_exempt: checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="tds_amount">TDS Amount (₹)</Label>
                  <Input
                    id="tds_amount"
                    type="number"
                    value={formData.tds_amount}
                    onChange={(e) => setFormData({ ...formData, tds_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recurring Setup */}
          {showRecurring && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-green-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recurring Setup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="recurring_frequency">Frequency</Label>
                  <Select value={formData.recurring_frequency} onValueChange={(value) => setFormData({ ...formData, recurring_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq.toLowerCase()}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recurring_occurrences">Number of Times</Label>
                  <Input
                    id="recurring_occurrences"
                    type="number"
                    value={formData.recurring_occurrences}
                    onChange={(e) => setFormData({ ...formData, recurring_occurrences: e.target.value })}
                    placeholder="Leave empty for indefinite"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.recurring_end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.recurring_end_date ? format(formData.recurring_end_date, "PPP") : "Optional"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.recurring_end_date || undefined}
                        onSelect={(date) => setFormData({ ...formData, recurring_end_date: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* File Attachments */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="attachments" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB each</p>
                    </div>
                    <input
                      id="attachments"
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Show uploaded files */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800">
              {loading ? "Saving..." : editTransaction ? "Update" : "Add"} {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
