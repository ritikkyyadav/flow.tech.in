
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, Target, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AIInsightsWidgetProps {
  dashboardData: any;
  className?: string;
}

export const AIInsightsWidget = ({ dashboardData, className }: AIInsightsWidgetProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate AI insights based on data patterns
  const generateInsights = () => {
    const generatedInsights = [];
    const { monthlyIncome, monthlyExpenses, savingsRate, categoryData } = dashboardData;

    // Spending pattern analysis
    if (monthlyExpenses > monthlyIncome * 0.8) {
      generatedInsights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Spending Alert',
        message: `You're spending ${((monthlyExpenses / monthlyIncome) * 100).toFixed(1)}% of your income this month. Consider reviewing your expenses.`,
        actions: ['Review Budget', 'Set Spending Limit'],
        priority: 'high'
      });
    }

    // Savings optimization
    if (savingsRate < 20) {
      generatedInsights.push({
        type: 'improvement',
        icon: Target,
        title: 'Savings Opportunity',
        message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
        actions: ['Set Savings Goal', 'Analyze Expenses'],
        priority: 'medium'
      });
    }

    // Category analysis
    const topCategory = categoryData.sort((a: any, b: any) => b.value - a.value)[0];
    if (topCategory && topCategory.value > monthlyExpenses * 0.3) {
      generatedInsights.push({
        type: 'insight',
        icon: TrendingUp,
        title: 'Category Spending Pattern',
        message: `${topCategory.name} accounts for ${((topCategory.value / monthlyExpenses) * 100).toFixed(1)}% of your expenses (${formatCurrency(topCategory.value)}).`,
        actions: ['Set Category Budget', 'View Details'],
        priority: 'low'
      });
    }

    // Positive insights
    if (savingsRate > 20) {
      generatedInsights.push({
        type: 'success',
        icon: Lightbulb,
        title: 'Excellent Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income! Consider investing your surplus for long-term growth.`,
        actions: ['Explore Investments', 'Set Financial Goals'],
        priority: 'low'
      });
    }

    return generatedInsights;
  };

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call Claude API
      // For now, we'll simulate with local insights
      const localInsights = generateInsights();
      setInsights(localInsights);
      
      // Simulate API call to Claude (would be implemented with actual API)
      // const { data } = await supabase.functions.invoke('ai-assistant', {
      //   body: {
      //     message: `Analyze my financial data: Income: ${formatCurrency(dashboardData.monthlyIncome)}, Expenses: ${formatCurrency(dashboardData.monthlyExpenses)}, Savings Rate: ${dashboardData.savingsRate}%`,
      //     user_id: user.id,
      //     data: dashboardData
      //   }
      // });
      
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardData.monthlyIncome || dashboardData.monthlyExpenses) {
      fetchAIInsights();
    }
  }, [dashboardData]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'improvement': return Target;
      case 'success': return Lightbulb;
      default: return TrendingUp;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-400';
      case 'improvement': return 'text-orange-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            AI Financial Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAIInsights}
            disabled={loading}
            className="text-white hover:bg-gray-700"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-gray-700 rounded-lg p-4 cursor-pointer transition-all",
                    selectedInsight === index ? "bg-gray-600 ring-2 ring-blue-400" : "hover:bg-gray-600"
                  )}
                  onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className={cn("w-5 h-5 mt-0.5", getInsightColor(insight.type))} />
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-300 mb-3">{insight.message}</p>
                      
                      {selectedInsight === index && (
                        <div className="flex flex-wrap gap-2">
                          {insight.actions.map((action: string, actionIndex: number) => (
                            <Button
                              key={actionIndex}
                              variant="outline"
                              size="sm"
                              className="text-xs bg-transparent border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {insights.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No insights available yet</p>
                <p className="text-sm text-gray-500">Add more transactions to get personalized insights</p>
              </div>
            )}
          </div>
        )}

        {/* Powered by Claude indicator */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Powered by Claude Sonnet 4</span>
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
