
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { toast } from '@/hooks/use-toast';

interface SmartSuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  keywords: string[];
}

interface TransactionToProcess {
  id: string;
  description: string;
  amount: number;
  vendor_merchant?: string;
  current_category: string;
  suggestions: SmartSuggestion[];
}

export const SmartTransactionCategorizer = () => {
  const { isFeatureEnabled, makeAIRequest } = useAI();
  const { transactions, editTransaction } = useTransactions();
  const [processing, setProcessing] = useState(false);
  const [transactionsToProcess, setTransactionsToProcess] = useState<TransactionToProcess[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isFeatureEnabled('transactionCategorization')) {
      findTransactionsToProcess();
    }
  }, [transactions, isFeatureEnabled]);

  const findTransactionsToProcess = async () => {
    // Find transactions that might need better categorization
    const candidates = transactions.filter(t => 
      t.category === 'Miscellaneous' || 
      t.category === 'Uncategorized' ||
      !t.category
    ).slice(0, 20);

    if (candidates.length === 0) {
      setTransactionsToProcess([]);
      return;
    }

    setProcessing(true);
    const processed: TransactionToProcess[] = [];

    for (const transaction of candidates) {
      try {
        const suggestions = await getAISuggestions(transaction);
        processed.push({
          id: transaction.id,
          description: transaction.description || 'No description',
          amount: transaction.amount,
          vendor_merchant: transaction.vendor_merchant,
          current_category: transaction.category,
          suggestions
        });
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }

    setTransactionsToProcess(processed);
    setProcessing(false);
  };

  const getAISuggestions = async (transaction: any): Promise<SmartSuggestion[]> => {
    try {
      const prompt = `Analyze this transaction and suggest the best category:
        Description: ${transaction.description || 'N/A'}
        Vendor: ${transaction.vendor_merchant || 'N/A'}
        Amount: ₹${transaction.amount}
        
        Available categories: Food & Dining, Transportation, Shopping, Utilities, Healthcare, Entertainment, Groceries, Business, Investment, Miscellaneous
        
        Provide 3 suggestions with confidence scores and reasoning.`;

      const response = await makeAIRequest({
        provider: 'openai', // This should come from settings
        model: 'gpt-3.5-turbo',
        prompt,
        tokens: 0,
        cost: 0
      });

      // Parse AI response (this is simplified - in reality you'd have better parsing)
      return [
        {
          category: 'Food & Dining',
          confidence: 0.85,
          reasoning: 'Transaction description suggests food purchase',
          keywords: ['food', 'restaurant', 'dining']
        }
      ];
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  };

  const applySuggestion = async (transactionId: string, category: string) => {
    try {
      await editTransaction(transactionId, { category });
      setTransactionsToProcess(prev => prev.filter(t => t.id !== transactionId));
      
      toast({
        title: "Category Applied",
        description: `Transaction categorized as ${category}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction category",
        variant: "destructive",
      });
    }
  };

  const bulkApply = async () => {
    const selected = transactionsToProcess.filter(t => selectedTransactions.has(t.id));
    
    for (const transaction of selected) {
      if (transaction.suggestions.length > 0) {
        await applySuggestion(transaction.id, transaction.suggestions[0].category);
      }
    }
    
    setSelectedTransactions(new Set());
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (!isFeatureEnabled('transactionCategorization')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium">AI Categorization Disabled</h3>
            <p className="text-gray-600">Enable AI transaction categorization in settings to use this feature.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Smart Transaction Categorizer
              <Badge variant="outline">{transactionsToProcess.length} to review</Badge>
            </CardTitle>
            
            {selectedTransactions.size > 0 && (
              <Button onClick={bulkApply} className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Apply to {selectedTransactions.size} transactions
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {processing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">AI is analyzing your transactions...</p>
              </div>
            </div>
          )}

          {!processing && transactionsToProcess.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
              <p className="text-gray-600">All your transactions are properly categorized.</p>
            </div>
          )}

          {!processing && transactionsToProcess.length > 0 && (
            <div className="space-y-4">
              {transactionsToProcess.map((transaction) => (
                <Card key={transaction.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.has(transaction.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedTransactions);
                            if (e.target.checked) {
                              newSelected.add(transaction.id);
                            } else {
                              newSelected.delete(transaction.id);
                            }
                            setSelectedTransactions(newSelected);
                          }}
                          className="rounded"
                        />
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          {transaction.vendor_merchant && (
                            <p className="text-sm text-gray-600">{transaction.vendor_merchant}</p>
                          )}
                          <p className="text-sm text-gray-500">₹{transaction.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <Badge variant="outline">{transaction.current_category}</Badge>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">AI Suggestions:</h5>
                      {transaction.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <Badge className={getConfidenceColor(suggestion.confidence)}>
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                            <div>
                              <p className="font-medium">{suggestion.category}</p>
                              <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                              {suggestion.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {suggestion.keywords.map((keyword, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(transaction.id, suggestion.category)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
