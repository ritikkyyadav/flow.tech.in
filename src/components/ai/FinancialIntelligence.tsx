
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  DollarSign,
  Calendar,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  action_items: string[];
  confidence: number;
  data_points: any;
}

interface PredictiveAnalytics {
  cash_flow_forecast: {
    next_3_months: number[];
    confidence: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  savings_projection: {
    monthly_potential: number;
    annual_projection: number;
    goal_achievement_probability: number;
  };
  spending_predictions: {
    category: string;
    predicted_amount: number;
    confidence: number;
  }[];
}

export const FinancialIntelligence = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (user) {
      generateAIInsights();
      generatePredictiveAnalytics();
    }
  }, [user]);

  const generateAIInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-financial-insights', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePredictiveAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      setPredictions(data);
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const generateMonthlyReport = async () => {
    setGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-monthly-report', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      // Create and download the report
      const blob = new Blob([data.report], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().slice(0, 7)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your AI-powered monthly financial report has been downloaded",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'optimization': return <Target className="w-5 h-5 text-green-500" />;
      default: return <Brain className="w-5 h-5 text-purple-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Financial Intelligence</h2>
          <p className="text-gray-600">AI-powered insights and predictions for your finances</p>
        </div>
        <Button 
          onClick={generateMonthlyReport}
          disabled={generatingReport}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          {generatingReport ? 'Generating...' : 'Generate AI Report'}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    {insight.action_items.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">Recommended Actions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {insight.action_items.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600">{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {predictions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Cash Flow Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {predictions.cash_flow_forecast.trend === 'increasing' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : predictions.cash_flow_forecast.trend === 'decreasing' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {predictions.cash_flow_forecast.trend} Trend
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Next 3 Months Projection</p>
                      <div className="space-y-1">
                        {predictions.cash_flow_forecast.next_3_months.map((amount, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>Month {index + 1}</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {Math.round(predictions.cash_flow_forecast.confidence * 100)}% Confidence
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Savings Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Potential</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(predictions.savings_projection.monthly_potential)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Projection</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(predictions.savings_projection.annual_projection)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Goal Achievement</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${predictions.savings_projection.goal_achievement_probability * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(predictions.savings_projection.goal_achievement_probability * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Spending Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictions.spending_predictions.slice(0, 5).map((prediction, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{prediction.category}</p>
                          <p className="text-xs text-gray-500">
                            {Math.round(prediction.confidence * 100)}% confidence
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(prediction.predicted_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights
              .filter(insight => insight.type === 'optimization' || insight.type === 'recommendation')
              .map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    <div className="space-y-2">
                      {insight.action_items.map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
