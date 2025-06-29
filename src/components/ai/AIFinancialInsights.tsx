
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain, Target, DollarSign, PieChart } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { toast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
  data?: any;
}

interface FinancialForecast {
  period: string;
  prediction: number;
  confidence: number;
  factors: string[];
}

export const AIFinancialInsights = () => {
  const { isFeatureEnabled, makeAIRequest } = useAI();
  const { transactions } = useTransactions();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    if (isFeatureEnabled('financialInsights') && transactions.length > 0) {
      generateInsights();
    }
  }, [transactions, isFeatureEnabled]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Analyze spending patterns
      const spendingInsights = await analyzeSpendingPatterns();
      
      // Generate forecasts
      const forecastData = await generateForecasts();
      
      // Identify opportunities
      const opportunities = await identifyOpportunities();
      
      setInsights([...spendingInsights, ...opportunities]);
      setForecasts(forecastData);
      setLastAnalysis(new Date());
      
      toast({
        title: "Insights Generated",
        description: "AI has analyzed your financial data and generated new insights",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate financial insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpendingPatterns = async (): Promise<AIInsight[]> => {
    // Analyze transaction data
    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.transaction_date).getMonth() === currentMonth
    );
    
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Category analysis
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const insights: AIInsight[] = [];
    
    // High spending category
    const highestCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (highestCategory && highestCategory[1] > totalExpenses * 0.3) {
      insights.push({
        id: 'high-category-spending',
        type: 'warning',
        title: `High ${highestCategory[0]} Spending`,
        description: `${highestCategory[0]} accounts for ${((highestCategory[1] / totalExpenses) * 100).toFixed(1)}% of your monthly expenses (₹${highestCategory[1].toLocaleString()})`,
        impact: 'medium',
        confidence: 0.9,
        actionItems: [
          `Set a budget limit for ${highestCategory[0]}`,
          'Track daily expenses in this category',
          'Look for cost-saving alternatives'
        ],
        data: { category: highestCategory[0], amount: highestCategory[1] }
      });
    }
    
    // Savings rate
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (income > 0) {
      const savingsRate = ((income - totalExpenses) / income) * 100;
      insights.push({
        id: 'savings-rate',
        type: savingsRate > 20 ? 'achievement' : 'opportunity',
        title: `Savings Rate: ${savingsRate.toFixed(1)}%`,
        description: savingsRate > 20 
          ? 'Excellent! You\'re saving well above the recommended 20%' 
          : 'Your savings rate is below the recommended 20%. Consider reducing expenses.',
        impact: savingsRate < 10 ? 'high' : 'medium',
        confidence: 0.95,
        actionItems: savingsRate > 20 ? [
          'Consider investing surplus funds',
          'Increase emergency fund',
          'Explore tax-saving investments'
        ] : [
          'Review and cut non-essential expenses',
          'Automate savings transfers',
          'Set monthly savings targets'
        ]
      });
    }
    
    return insights;
  };

  const generateForecasts = async (): Promise<FinancialForecast[]> => {
    const forecasts: FinancialForecast[] = [];
    
    // Simple trend analysis for next 3 months
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        expenses: monthlyData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        income: monthlyData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      };
    }).reverse();
    
    if (monthlyData.length >= 3) {
      const avgExpenses = monthlyData.slice(-3).reduce((sum, m) => sum + m.expenses, 0) / 3;
      const trend = (monthlyData[monthlyData.length - 1].expenses - monthlyData[monthlyData.length - 3].expenses) / 2;
      
      forecasts.push({
        period: 'Next Month',
        prediction: avgExpenses + trend,
        confidence: 0.75,
        factors: ['Historical spending patterns', 'Recent trend analysis']
      });
    }
    
    return forecasts;
  };

  const identifyOpportunities = async (): Promise<AIInsight[]> => {
    const opportunities: AIInsight[] = [];
    
    // Subscription analysis
    const possibleSubscriptions = transactions.filter(t => {
      const desc = (t.description || '').toLowerCase();
      return desc.includes('subscription') || desc.includes('monthly') || desc.includes('recurring');
    });
    
    if (possibleSubscriptions.length > 0) {
      const subscriptionTotal = possibleSubscriptions.reduce((sum, t) => sum + t.amount, 0);
      
      opportunities.push({
        id: 'subscription-review',
        type: 'opportunity',
        title: 'Subscription Optimization',
        description: `Found ${possibleSubscriptions.length} potential subscriptions costing ₹${subscriptionTotal.toLocaleString()} monthly`,
        impact: subscriptionTotal > 5000 ? 'high' : 'medium',
        confidence: 0.8,
        actionItems: [
          'Review all active subscriptions',
          'Cancel unused services',
          'Consider annual plans for savings',
          'Set subscription spending limits'
        ]
      });
    }
    
    return opportunities;
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'recommendation':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-blue-500 bg-blue-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'achievement':
        return 'border-l-green-500 bg-green-50';
      case 'recommendation':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!isFeatureEnabled('financialInsights')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-medium">AI Insights Disabled</h3>
            <p className="text-gray-600">Enable AI financial insights in settings to get personalized recommendations.</p>
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
              AI Financial Insights
              {insights.length > 0 && (
                <Badge variant="outline">{insights.length} insights</Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {lastAnalysis && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastAnalysis.toLocaleTimeString()}
                </span>
              )}
              <Button 
                onClick={generateInsights}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? 'Analyzing...' : 'Refresh Insights'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">AI is analyzing your financial patterns...</p>
              </div>
            </div>
          )}

          {!loading && insights.length === 0 && (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
              <p className="text-gray-600">Add more transactions to get AI-powered financial insights.</p>
            </div>
          )}

          {!loading && insights.length > 0 && (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="secondary">
                              {Math.round(insight.confidence * 100)}% confident
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{insight.description}</p>
                        
                        {insight.actionItems.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Recommended Actions:</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {insight.actionItems.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Financial Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{forecast.period}</h4>
                    <p className="text-sm text-gray-600">
                      Predicted expenses: ₹{forecast.prediction.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {forecast.factors.map((factor, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {Math.round(forecast.confidence * 100)}% confident
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
