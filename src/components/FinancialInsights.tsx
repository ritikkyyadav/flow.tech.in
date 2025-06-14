import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Target, X, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FinancialInsightsProps {
  refreshTrigger: number;
}

interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  description: string;
  actionText?: string;
  actionType?: string;
  amount?: number;
  category?: string;
}

export const FinancialInsights = ({ refreshTrigger }: FinancialInsightsProps) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user, refreshTrigger]);

  const generateInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get current month transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfMonth.toISOString());

      // Get last month transactions
      const { data: lastMonthTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfLastMonth.toISOString())
        .lt('transaction_date', startOfMonth.toISOString());

      const generatedInsights: Insight[] = [];

      if (currentTransactions && lastMonthTransactions) {
        // Analyze spending patterns
        analyzeSpendingPatterns(currentTransactions, lastMonthTransactions, generatedInsights);
        
        // Check for unusual expenses
        checkUnusualExpenses(currentTransactions, generatedInsights);
        
        // Analyze savings progress
        analyzeSavingsProgress(currentTransactions, generatedInsights);
        
        // Check subscription spending
        analyzeSubscriptions(currentTransactions, generatedInsights);
      }

      setInsights(generatedInsights.filter(insight => !dismissedInsights.includes(insight.id)));
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpendingPatterns = (current: any[], lastMonth: any[], insights: Insight[]) => {
    const currentExpenses = current.filter(t => t.type === 'expense');
    const lastMonthExpenses = lastMonth.filter(t => t.type === 'expense');

    const currentTotal = currentExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    if (lastMonthTotal > 0) {
      const change = ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100;
      
      if (Math.abs(change) > 15) {
        insights.push({
          id: 'spending-change',
          type: change > 0 ? 'warning' : 'success',
          title: `Spending ${change > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(change).toFixed(1)}%`,
          description: `Your expenses this month are ${change > 0 ? 'higher' : 'lower'} than last month by ₹${Math.abs(currentTotal - lastMonthTotal).toLocaleString()}`,
          actionText: change > 0 ? 'Review Budget' : 'Great Job!',
          actionType: 'review-budget'
        });
      }
    }

    // Category analysis
    const categorySpending = currentExpenses.reduce((acc: any, t: any) => {
      const amount = Number(t.amount || 0);
      acc[t.category] = (acc[t.category] || 0) + amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categorySpending)
      .sort(([,a]: any, [,b]: any) => Number(b) - Number(a))[0];

    if (topCategory && Number(topCategory[1]) > 10000) {
      insights.push({
        id: 'top-category',
        type: 'info',
        title: `${topCategory[0]} is your top expense`,
        description: `You've spent ₹${Number(topCategory[1]).toLocaleString()} on ${topCategory[0]} this month`,
        actionText: 'Set Category Budget',
        actionType: 'set-budget',
        category: topCategory[0] as string,
        amount: Number(topCategory[1])
      });
    }
  };

  const checkUnusualExpenses = (transactions: any[], insights: Insight[]) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const amounts = expenses.map(t => Number(t.amount || 0));
    
    if (amounts.length === 0) return;
    
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const unusualThreshold = average * 3;

    const unusualExpenses = expenses.filter(t => Number(t.amount || 0) > unusualThreshold);
    
    if (unusualExpenses.length > 0) {
      const largest = unusualExpenses.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
      insights.push({
        id: 'unusual-expense',
        type: 'warning',
        title: 'Unusual large expense detected',
        description: `₹${Number(largest.amount || 0).toLocaleString()} spent on ${largest.category} - is this planned?`,
        actionText: 'Review Transaction',
        actionType: 'review-transaction',
        amount: Number(largest.amount || 0)
      });
    }
  };

  const analyzeSavingsProgress = (transactions: any[], insights: Insight[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    if (savingsRate > 20) {
      insights.push({
        id: 'good-savings',
        type: 'success',
        title: `Excellent savings rate: ${savingsRate.toFixed(1)}%`,
        description: `You're saving ₹${savings.toLocaleString()} this month, which is ${savingsRate.toFixed(1)}% of your income`,
        actionText: 'Invest Savings',
        actionType: 'invest'
      });
    } else if (savingsRate < 10 && income > 0) {
      insights.push({
        id: 'low-savings',
        type: 'warning',
        title: `Low savings rate: ${savingsRate.toFixed(1)}%`,
        description: 'Consider reviewing your expenses to increase your savings rate',
        actionText: 'Create Budget Plan',
        actionType: 'budget-plan'
      });
    }
  };

  const analyzeSubscriptions = (transactions: any[], insights: Insight[]) => {
    const subscriptionKeywords = ['subscription', 'monthly', 'annual', 'netflix', 'spotify', 'amazon prime', 'gym'];
    const possibleSubscriptions = transactions.filter(t => 
      t.type === 'expense' && 
      subscriptionKeywords.some(keyword => 
        (t.description?.toLowerCase() || '').includes(keyword) ||
        (t.vendor_merchant?.toLowerCase() || '').includes(keyword)
      )
    );

    if (possibleSubscriptions.length > 0) {
      const total = possibleSubscriptions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      insights.push({
        id: 'subscriptions',
        type: 'tip',
        title: `${possibleSubscriptions.length} subscription expenses found`,
        description: `You're spending approximately ₹${total.toLocaleString()} on subscriptions this month`,
        actionText: 'Review Subscriptions',
        actionType: 'review-subscriptions'
      });
    }
  };

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'success': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      default: return <Target className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-orange-500 bg-orange-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'tip': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-purple-500 bg-purple-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>AI Financial Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5" />
          <span>AI Financial Insights</span>
          <Badge variant="outline">{insights.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No insights available yet</p>
            <p className="text-sm">Add more transactions to get personalized insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 rounded-lg p-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      {insight.actionText && (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            {insight.actionText}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400"
                          >
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            Not helpful
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissInsight(insight.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
