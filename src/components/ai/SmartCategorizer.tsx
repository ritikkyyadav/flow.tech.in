
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, CheckCircle, AlertCircle, Zap, Target } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { toast } from "@/hooks/use-toast";

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  keywords_matched: string[];
}

interface SmartTransaction {
  id: string;
  description: string;
  amount: number;
  vendor_merchant: string;
  transaction_date: string;
  current_category: string;
  suggestions: CategorySuggestion[];
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

export const SmartCategorizer = () => {
  const { transactions, editTransaction } = useTransactions();
  const [smartTransactions, setSmartTransactions] = useState<SmartTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  useEffect(() => {
    analyzeTransactions();
  }, [transactions]);

  const analyzeTransactions = async () => {
    setLoading(true);
    
    // Get transactions that might need better categorization
    const candidateTransactions = transactions.filter(t => 
      t.category === 'Miscellaneous' || 
      t.category === 'Uncategorized' ||
      !t.category
    ).slice(0, 20);

    const analyzed = await Promise.all(
      candidateTransactions.map(async (transaction) => {
        const suggestions = await categorizeTransaction(transaction);
        return {
          id: transaction.id,
          description: transaction.description || 'No description',
          amount: transaction.amount,
          vendor_merchant: transaction.vendor_merchant || '',
          transaction_date: transaction.transaction_date,
          current_category: transaction.category,
          suggestions,
          is_selected: false
        };
      })
    );

    setSmartTransactions(analyzed);
    setLoading(false);
  };

  const categorizeTransaction = async (transaction: any): Promise<CategorySuggestion[]> => {
    const description = (transaction.description || '').toLowerCase();
    const vendor = (transaction.vendor_merchant || '').toLowerCase();
    const searchText = `${description} ${vendor}`;
    const amount = transaction.amount;

    const categoryRules = [
      {
        category: 'Food & Dining',
        keywords: ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'starbucks', 'subway'],
        patterns: ['*food*', '*restaurant*', '*cafe*', '*eatery*'],
        confidence: 0.9
      },
      {
        category: 'Transportation',
        keywords: ['uber', 'ola', 'taxi', 'metro', 'bus', 'petrol', 'fuel', 'parking', 'toll', 'rapido', 'auto'],
        patterns: ['*transport*', '*travel*', '*cab*'],
        confidence: 0.85
      },
      {
        category: 'Shopping',
        keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store', 'market', 'buy', 'purchase', 'retail'],
        patterns: ['*shop*', '*purchase*', '*buy*'],
        confidence: 0.8
      },
      {
        category: 'Utilities',
        keywords: ['electricity', 'water', 'gas', 'internet', 'broadband', 'mobile', 'phone', 'recharge', 'bill', 'wifi'],
        patterns: ['*bill*', '*utility*', '*recharge*'],
        confidence: 0.95
      },
      {
        category: 'Healthcare',
        keywords: ['hospital', 'doctor', 'medical', 'pharmacy', 'medicine', 'clinic', 'health', 'dentist'],
        patterns: ['*medical*', '*health*', '*doctor*'],
        confidence: 0.9
      },
      {
        category: 'Entertainment',
        keywords: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'bookmyshow', 'youtube', 'prime'],
        patterns: ['*entertainment*', '*movie*', '*game*'],
        confidence: 0.85
      },
      {
        category: 'Groceries',
        keywords: ['grocery', 'supermarket', 'bigbasket', 'grofers', 'vegetables', 'fruits', 'milk', 'bread'],
        patterns: ['*grocery*', '*market*', '*fresh*'],
        confidence: 0.9
      },
      {
        category: 'Business',
        keywords: ['office', 'business', 'meeting', 'conference', 'supplies', 'software', 'subscription'],
        patterns: ['*business*', '*office*', '*work*'],
        confidence: 0.8
      },
      {
        category: 'Investment',
        keywords: ['mutual fund', 'sip', 'stock', 'share', 'zerodha', 'groww', 'investment', 'trading'],
        patterns: ['*invest*', '*fund*', '*trading*'],
        confidence: 0.9
      }
    ];

    const suggestions: CategorySuggestion[] = [];

    for (const rule of categoryRules) {
      let score = 0;
      let matches: string[] = [];

      // Check keywords
      for (const keyword of rule.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 0.3;
          matches.push(keyword);
        }
      }

      // Check patterns
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern.replace('*', '.*'), 'i');
        if (regex.test(searchText)) {
          score += 0.2;
          matches.push(`pattern: ${pattern}`);
        }
      }

      // Amount-based hints
      if (rule.category === 'Utilities' && amount < 5000 && amount > 100) {
        score += 0.2;
        matches.push('typical utility amount');
      }
      
      if (rule.category === 'Groceries' && amount < 10000 && amount > 200) {
        score += 0.1;
        matches.push('typical grocery amount');
      }

      if (score > 0.1) {
        const confidence = Math.min(score * rule.confidence, 0.98);
        suggestions.push({
          category: rule.category,
          confidence,
          reasoning: `Matched: ${matches.join(', ')}`,
          keywords_matched: matches
        });
      }
    }

    // Sort by confidence and return top 3
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 3);
  };

  const applyCategorization = async (transactionId: string, category: string) => {
    setProcessing(prev => [...prev, transactionId]);
    
    try {
      await editTransaction(transactionId, { category });
      
      setSmartTransactions(prev => 
        prev.filter(t => t.id !== transactionId)
      );

      toast({
        title: "Success",
        description: `Transaction categorized as ${category}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction category",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => prev.filter(id => id !== transactionId));
    }
  };

  const handleBulkCategorization = async () => {
    const selected = smartTransactions.filter(t => 
      selectedTransactions.includes(t.id) && t.selected_category
    );

    for (const transaction of selected) {
      await applyCategorization(transaction.id, transaction.selected_category!);
    }

    setSelectedTransactions([]);
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const updateSelectedCategory = (transactionId: string, category: string) => {
    setSmartTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, selected_category: category }
          : t
      )
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Transaction Categorizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"></div>
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
            Smart Transaction Categorizer
            <Badge variant="outline" className="ml-2">
              {smartTransactions.length} to review
            </Badge>
          </CardTitle>
          
          {selectedTransactions.length > 0 && (
            <Button 
              onClick={handleBulkCategorization}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!smartTransactions.some(t => 
                selectedTransactions.includes(t.id) && t.selected_category
              )}
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply to {selectedTransactions.length} transactions
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {smartTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">All transactions are properly categorized!</p>
            <p className="text-sm">The AI has analyzed your recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {smartTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        {transaction.vendor_merchant && (
                          <p className="text-sm text-gray-600">{transaction.vendor_merchant}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          ₹{transaction.amount.toLocaleString()} • {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Badge variant="outline" className="bg-gray-100">
                        Current: {transaction.current_category}
                      </Badge>
                    </div>

                    {/* AI Suggestions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        AI Suggestions:
                      </p>
                      
                      {transaction.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-3">
                            <Badge className={getConfidenceColor(suggestion.confidence)} variant="outline">
                              {getConfidenceText(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{suggestion.category}</p>
                              <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => applyCategorization(transaction.id, suggestion.category)}
                            disabled={processing.includes(transaction.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Apply
                          </Button>
                        </div>
                      ))}
                    </div>

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
                        
                        {transaction.selected_category && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyCategorization(transaction.id, transaction.selected_category!)}
                            disabled={processing.includes(transaction.id)}
                          >
                            Apply Manual
                          </Button>
                        )}
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
