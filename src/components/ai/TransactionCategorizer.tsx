
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

interface UncategorizedTransaction {
  id: string;
  description: string;
  amount: number;
  vendor_merchant: string;
  transaction_date: string;
  suggested_categories: CategorySuggestion[];
  selected_category?: string;
  is_selected: boolean;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation', 
  'Shopping',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Groceries',
  'Business',
  'Investment',
  'Miscellaneous'
];

export const TransactionCategorizer = () => {
  const { user } = useAuth();
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState<UncategorizedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUncategorizedTransactions();
    }
  }, [user]);

  const fetchUncategorizedTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('category', ['Uncategorized', 'Miscellaneous'])
        .limit(15);

      if (error) throw error;

      // Process each transaction through AI categorization
      const processedTransactions = await Promise.all(
        (data || []).map(async (transaction) => {
          const suggestions = await categorizeTransaction(transaction);
          return {
            ...transaction,
            suggested_categories: suggestions,
            is_selected: false
          };
        })
      );

      setUncategorizedTransactions(processedTransactions);
    } catch (error) {
      console.error('Error fetching uncategorized transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch uncategorized transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categorizeTransaction = async (transaction: any): Promise<CategorySuggestion[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('categorize-transaction', {
        body: {
          description: transaction.description,
          amount: transaction.amount,
          vendor: transaction.vendor_merchant,
          date: transaction.transaction_date,
          user_id: user?.id
        }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return [{
        category: 'Miscellaneous',
        confidence: 0.5,
        reasoning: 'Default fallback category'
      }];
    }
  };

  const applyCategory = async (transactionId: string, category: string) => {
    setProcessing(transactionId);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category })
        .eq('id', transactionId);

      if (error) throw error;

      setUncategorizedTransactions(prev => 
        prev.filter(t => t.id !== transactionId)
      );

      toast({
        title: "Success",
        description: "Transaction categorized successfully",
      });
    } catch (error) {
      console.error('Error applying category:', error);
      toast({
        title: "Error",
        description: "Failed to categorize transaction",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkCategorization = async () => {
    const selected = uncategorizedTransactions.filter(t => 
      selectedTransactions.includes(t.id) && t.selected_category
    );

    for (const transaction of selected) {
      await applyCategory(transaction.id, transaction.selected_category!);
    }

    setSelectedTransactions([]);
  };

  const toggleTransactionSelection =  (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const updateSelectedCategory = (transactionId: string, category: string) => {
    setUncategorizedTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, selected_category: category }
          : t
      )
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Transaction Categorizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Transaction Categorizer
            <Badge variant="outline">{uncategorizedTransactions.length}</Badge>
          </CardTitle>
          
          {selectedTransactions.length > 0 && (
            <Button 
              onClick={handleBulkCategorization}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!uncategorizedTransactions.some(t => 
                selectedTransactions.includes(t.id) && t.selected_category
              )}
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply to {selectedTransactions.length}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {uncategorizedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>All transactions are categorized!</p>
            <p className="text-sm">AI is keeping your finances organized</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uncategorizedTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{transaction.description || 'No description'}</h4>
                        <p className="text-sm text-gray-600">
                          {transaction.vendor_merchant} • ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <p className="text-sm font-medium">AI Suggestions:</p>
                      {transaction.suggested_categories.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge className={getConfidenceColor(suggestion.confidence)}>
                              {getConfidenceText(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                            </Badge>
                            <div>
                              <p className="font-medium">{suggestion.category}</p>
                              <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => applyCategory(transaction.id, suggestion.category)}
                            disabled={processing === transaction.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply
                          </Button>
                        </div>
                      ))}
                      
                      {/* Manual Override */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Manual Override:</label>
                          <Select
                            value={transaction.selected_category || ''}
                            onValueChange={(value) => updateSelectedCategory(transaction.id, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Choose category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
