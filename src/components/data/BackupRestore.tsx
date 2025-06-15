
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Download, 
  Upload, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BackupData {
  version: string;
  timestamp: string;
  transactions: any[];
  metadata: {
    totalTransactions: number;
    dateRange: {
      from: string;
      to: string;
    };
    categories: string[];
  };
}

export const BackupRestore = () => {
  const { transactions, addTransaction } = useTransactions();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      // Get unique categories
      const categories = [...new Set(transactions.map(t => t.category))];
      
      // Get date range
      const dates = transactions.map(t => new Date(t.transaction_date));
      const dateRange = {
        from: dates.length > 0 ? format(new Date(Math.min(...dates.map(d => d.getTime()))), 'yyyy-MM-dd') : '',
        to: dates.length > 0 ? format(new Date(Math.max(...dates.map(d => d.getTime()))), 'yyyy-MM-dd') : ''
      };

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        transactions: transactions,
        metadata: {
          totalTransactions: transactions.length,
          dateRange,
          categories
        }
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WithU_Backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Created",
        description: `Successfully backed up ${transactions.length} transactions`,
      });
    } catch (error) {
      console.error('Backup creation failed:', error);
      toast({
        title: "Backup Failed",
        description: "An error occurred while creating the backup",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid backup JSON file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsRestoring(true);
        setRestoreProgress(0);

        const backupData = JSON.parse(e.target?.result as string) as BackupData;
        
        // Validate backup data
        if (!backupData.transactions || !Array.isArray(backupData.transactions)) {
          throw new Error('Invalid backup file format');
        }

        const transactions = backupData.transactions;
        let processed = 0;

        // Restore transactions
        for (const transaction of transactions) {
          try {
            await addTransaction({
              type: transaction.type,
              amount: transaction.amount,
              category: transaction.category,
              subcategory: transaction.subcategory,
              description: transaction.description,
              transaction_date: transaction.transaction_date,
              vendor_merchant: transaction.vendor_merchant,
              payment_method: transaction.payment_method,
              location: transaction.location,
              reference_number: transaction.reference_number,
              is_business_related: transaction.is_business_related,
              is_reimbursable: transaction.is_reimbursable
            });
            processed++;
          } catch (error) {
            console.error('Error restoring transaction:', error);
          }
          
          setRestoreProgress((processed / transactions.length) * 100);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        toast({
          title: "Restore Completed",
          description: `Successfully restored ${processed} of ${transactions.length} transactions`,
        });

        // Reset file input
        event.target.value = '';

      } catch (error) {
        console.error('Restore failed:', error);
        toast({
          title: "Restore Failed",
          description: "Invalid backup file or restore error",
          variant: "destructive"
        });
      } finally {
        setIsRestoring(false);
        setRestoreProgress(0);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Backup & Restore
        </h3>
        <p className="text-gray-600">
          Create backups of your data and restore from previous backups
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Create a complete backup of all your transactions and settings
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>{transactions.length}</strong> transactions</p>
                <p>Last backup: Never</p>
              </div>
            </div>

            <Button 
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="w-full"
            >
              {isCreatingBackup ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Backup includes all transactions, categories, and settings in JSON format.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Restore Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Restore your data from a previous backup file
              </p>
            </div>

            {isRestoring && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Restoring...</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(restoreProgress)}%
                  </span>
                </div>
                <Progress value={restoreProgress} className="w-full" />
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={isRestoring}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                disabled={isRestoring}
                className="w-full"
                variant="outline"
              >
                {isRestoring ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Backup File
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Restoring will add transactions from the backup. Existing data will not be deleted.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
