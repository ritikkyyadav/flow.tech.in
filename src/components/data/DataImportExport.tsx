
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
  ArrowRight,
  FileDown,
  FileUp,
  Database
} from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CSVMapping {
  csvField: string;
  systemField: string;
}

interface ImportProgress {
  total: number;
  processed: number;
  errors: number;
  isProcessing: boolean;
}

export const DataImportExport = () => {
  const { transactions, addTransaction } = useTransactions();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<CSVMapping[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    errors: 0,
    isProcessing: false
  });
  const [exportDateRange, setExportDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const systemFields = [
    { value: 'type', label: 'Transaction Type (income/expense)' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' },
    { value: 'subcategory', label: 'Subcategory' },
    { value: 'description', label: 'Description' },
    { value: 'transaction_date', label: 'Transaction Date' },
    { value: 'vendor_merchant', label: 'Vendor/Merchant' },
    { value: 'payment_method', label: 'Payment Method' },
    { value: 'location', label: 'Location' },
    { value: 'reference_number', label: 'Reference Number' },
    { value: 'is_business_related', label: 'Business Related (true/false)' },
    { value: 'is_reimbursable', label: 'Reimbursable (true/false)' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    setImportFile(file);
    parseCSVHeaders(file);
  };

  const parseCSVHeaders = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setCsvHeaders(headers);
        
        // Initialize field mappings
        const initialMappings = headers.map(header => ({
          csvField: header,
          systemField: ''
        }));
        setFieldMappings(initialMappings);
      }
    };
    reader.readAsText(file);
  };

  const updateFieldMapping = (csvField: string, systemField: string) => {
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.csvField === csvField 
          ? { ...mapping, systemField }
          : mapping
      )
    );
  };

  const validateImportData = (data: any[]): string[] => {
    const errors: string[] = [];
    const requiredFields = ['type', 'amount', 'category'];
    
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });

      if (row.type && !['income', 'expense'].includes(row.type.toLowerCase())) {
        errors.push(`Row ${index + 1}: Invalid transaction type '${row.type}'. Must be 'income' or 'expense'`);
      }

      if (row.amount && isNaN(parseFloat(row.amount))) {
        errors.push(`Row ${index + 1}: Invalid amount '${row.amount}'. Must be a number`);
      }
    });

    return errors;
  };

  const processImport = async () => {
    if (!importFile) return;

    setImportProgress({ total: 0, processed: 0, errors: 0, isProcessing: true });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Parse CSV data
        const csvData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        // Map CSV data to system fields
        const mappedData = csvData.map(row => {
          const mapped: any = {};
          fieldMappings.forEach(mapping => {
            if (mapping.systemField && row[mapping.csvField]) {
              mapped[mapping.systemField] = row[mapping.csvField];
            }
          });
          return mapped;
        });

        // Validate data
        const errors = validateImportData(mappedData);
        if (errors.length > 0) {
          setValidationErrors(errors);
          setImportProgress(prev => ({ ...prev, isProcessing: false }));
          return;
        }

        setImportProgress({ total: mappedData.length, processed: 0, errors: 0, isProcessing: true });

        // Process transactions
        let processed = 0;
        let errorCount = 0;

        for (const data of mappedData) {
          try {
            await addTransaction({
              type: data.type?.toLowerCase() === 'income' ? 'income' : 'expense',
              amount: parseFloat(data.amount) || 0,
              category: data.category || 'Uncategorized',
              subcategory: data.subcategory,
              description: data.description,
              transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
              vendor_merchant: data.vendor_merchant,
              payment_method: data.payment_method,
              location: data.location,
              reference_number: data.reference_number,
              is_business_related: data.is_business_related === 'true',
              is_reimbursable: data.is_reimbursable === 'true'
            });
            processed++;
          } catch (error) {
            errorCount++;
            console.error('Error importing transaction:', error);
          }
          
          setImportProgress(prev => ({ ...prev, processed, errors: errorCount }));
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        setImportProgress(prev => ({ ...prev, isProcessing: false }));
        
        toast({
          title: "Import Completed",
          description: `Successfully imported ${processed} transactions with ${errorCount} errors`,
        });

        // Reset form
        setImportFile(null);
        setCsvHeaders([]);
        setFieldMappings([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      } catch (error) {
        console.error('Import error:', error);
        setImportProgress(prev => ({ ...prev, isProcessing: false }));
        toast({
          title: "Import Failed",
          description: "An error occurred while processing the file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(importFile);
  };

  const exportTransactions = () => {
    let filteredTransactions = [...transactions];

    // Apply date range filter
    if (exportDateRange.from || exportDateRange.to) {
      filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        const fromDate = exportDateRange.from;
        const toDate = exportDateRange.to;

        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    if (filteredTransactions.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No transactions found for the selected date range",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Date',
      'Type',
      'Amount (₹)',
      'Category',
      'Subcategory',
      'Description',
      'Vendor/Merchant',
      'Payment Method',
      'Location',
      'Reference Number',
      'Business Related',
      'Reimbursable'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        format(new Date(transaction.transaction_date), 'dd/MM/yyyy'),
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        new Intl.NumberFormat('en-IN', { 
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        }).format(transaction.amount),
        transaction.category,
        transaction.subcategory || '',
        transaction.description || '',
        transaction.vendor_merchant || '',
        transaction.payment_method || '',
        transaction.location || '',
        transaction.reference_number || '',
        transaction.is_business_related ? 'Yes' : 'No',
        transaction.is_reimbursable ? 'Yes' : 'No'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    const dateRange = exportDateRange.from || exportDateRange.to 
      ? `_${exportDateRange.from ? format(exportDateRange.from, 'dd-MM-yyyy') : 'all'}_to_${exportDateRange.to ? format(exportDateRange.to, 'dd-MM-yyyy') : 'all'}`
      : '';
    
    link.download = `WithU_Transactions${dateRange}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();

    toast({
      title: "Export Completed",
      description: `Successfully exported ${filteredTransactions.length} transactions`,
    });
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      ['Date', 'Type', 'Amount', 'Category', 'Subcategory', 'Description', 'Vendor/Merchant', 'Payment Method', 'Location', 'Reference Number', 'Business Related', 'Reimbursable'],
      ['15/06/2025', 'expense', '1500', 'Food', 'Groceries', 'Weekly grocery shopping', 'SuperMart', 'Credit Card', 'Mumbai', 'TXN123456', 'false', 'false'],
      ['14/06/2025', 'income', '50000', 'Salary', '', 'Monthly salary', 'Company ABC', 'Bank Transfer', '', 'SAL202506', 'false', 'false'],
      ['13/06/2025', 'expense', '2500', 'Transportation', 'Fuel', 'Car fuel', 'Petrol Pump XYZ', 'Debit Card', 'Delhi', 'FUEL789', 'true', 'true']
    ];

    const csvContent = sampleData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'WithU_Sample_Template.csv';
    link.click();

    toast({
      title: "Template Downloaded",
      description: "Sample CSV template has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-gray-600">Import and export your transaction data</p>
        </div>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="csv-file" className="text-lg font-medium cursor-pointer">
                    Choose CSV File
                  </Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600">
                    Select a CSV file to import your transactions
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </div>

              {importFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{importFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(importFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ready</Badge>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={downloadSampleTemplate}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample Template
                    </Button>
                  </div>
                </div>
              )}

              {csvHeaders.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Map CSV Fields
                    </h3>
                    <div className="grid gap-4">
                      {fieldMappings.map((mapping, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{mapping.csvField}</Badge>
                          </div>
                          <Select
                            value={mapping.systemField}
                            onValueChange={(value) => updateFieldMapping(mapping.csvField, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select system field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Skip this field</SelectItem>
                              {systemFields.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="font-semibold">Validation Errors</h4>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {importProgress.isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing...</span>
                    <span className="text-sm text-gray-600">
                      {importProgress.processed} / {importProgress.total}
                    </span>
                  </div>
                  <Progress 
                    value={(importProgress.processed / importProgress.total) * 100} 
                    className="w-full"
                  />
                  {importProgress.errors > 0 && (
                    <p className="text-sm text-red-600">
                      {importProgress.errors} errors encountered
                    </p>
                  )}
                </div>
              )}

              {csvHeaders.length > 0 && !importProgress.isProcessing && (
                <Button 
                  onClick={processImport}
                  className="w-full"
                  disabled={!fieldMappings.some(m => m.systemField)}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Import Transactions
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !exportDateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportDateRange.from ? (
                          format(exportDateRange.from, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportDateRange.from}
                        onSelect={(date) =>
                          setExportDateRange(prev => ({ ...prev, from: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>To Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !exportDateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportDateRange.to ? (
                          format(exportDateRange.to, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportDateRange.to}
                        onSelect={(date) =>
                          setExportDateRange(prev => ({ ...prev, to: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setExportDateRange({ from: undefined, to: undefined })}
                  className="flex-1"
                >
                  Clear Dates
                </Button>
                <Button onClick={exportTransactions} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900">Export Features</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Indian currency formatting (₹)</li>
                      <li>• Date format: DD/MM/YYYY</li>
                      <li>• Complete transaction details</li>
                      <li>• UTF-8 encoding for Excel compatibility</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Total Transactions: {transactions.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
