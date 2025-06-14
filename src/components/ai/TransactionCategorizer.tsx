
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
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
}

export const TransactionCategorizer = () => {
  const { user } = useAuth();
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState<UncategorizedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

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
        .eq('category', 'Uncategorized')
        .limit(10);

      if (error) throw error;

      // Process each transaction through AI categorization
      const processedTransactions = await Promise.all(
        (data || []).map(async (transaction) => {
          const suggestions = await categorizeTransaction(transaction);
          return {
            ...transaction,
            suggested_categories: suggestions
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

  const applyCategory = async (transactionId: string, category: string, isCorrection: boolean = false) => {
    setProcessing(transactionId);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category })
        .eq('id', transactionId);

      if (error) throw error;

      // Learn from user feedback
      if (isCorrection) {
        await supabase.functions.invoke('learn-categorization', {
          body: {
            transaction_id: transactionId,
            correct_category: category,
            user_id: user?.id
          }
        });
      }

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

  const provideFeedback = async (transactionId: string, categoryUsed: string, isHelpful: boolean) => {
    try {
      await supabase.functions.invoke('categorization-feedback', {
        body: {
          transaction_id: transactionId,
          category_used: categoryUsed,
          is_helpful: isHelpful,
          user_id: user?.id
        }
      });

      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping improve our AI",
      });
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
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
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Transaction Categorizer
          <Badge variant="outline">{uncategorizedTransactions.length}</Badge>
        </CardTitle>
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

                <div className="space-y-3">
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => applyCategory(transaction.id, suggestion.category)}
                          disabled={processing === transaction.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => provideFeedback(transaction.id, suggestion.category, true)}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => provideFeedback(transaction.id, suggestion.category, false)}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
