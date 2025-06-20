import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Insight {
  type: 'positive' | 'warning' | 'opportunity' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  actionEnabled?: boolean;
}

export const AIInsights = () => {
  const insights: Insight[] = [
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Excellent Savings Rate',
      description: 'Your savings rate of 38.2% is well above the recommended 20%. Keep up the great work!',
      action: 'View Savings Plan',
      actionEnabled: true
    },
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Dining Expenses Up 25%',
      description: 'Your food and dining expenses have increased significantly this month. Consider meal planning to optimize costs.',
      action: 'See Suggestions',
      actionEnabled: true
    },
    {
      type: 'opportunity',
      icon: TrendingUp,
      title: 'Investment Opportunity',
      description: 'Based on your income pattern, you could invest an additional ₹10,000/month in tax-saving instruments.',
      action: 'Explore Options',
      actionEnabled: true
    },
    {
      type: 'neutral',
      icon: TrendingDown,
      title: 'Subscription Review',
      description: 'You have 8 active subscriptions totaling ₹2,400/month. Review unused services to save money.',
      action: 'Review Subscriptions',
      actionEnabled: true
    }
  ];

  const handleInsightAction = (action: string, insightType: string) => {
    // TODO: Implement actual navigation/actions based on the action type
    switch (action) {
      case 'View Savings Plan':
        // Navigate to savings dashboard
        toast({
          title: "Navigation",
          description: "Opening savings plan dashboard...",
          variant: "default"
        });
        break;
      case 'See Suggestions':
        // Navigate to expense suggestions
        toast({
          title: "Navigation", 
          description: "Opening expense optimization suggestions...",
          variant: "default"
        });
        break;
      case 'Explore Options':
        // Navigate to investment options
        toast({
          title: "Navigation",
          description: "Opening investment options...",
          variant: "default"
        });
        break;
      case 'Review Subscriptions':
        // Navigate to subscription management
        toast({
          title: "Navigation",
          description: "Opening subscription management...",
          variant: "default"
        });
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: "This feature is currently under development",
          variant: "default"
        });
    }
  };

  const getInsightStyle = (type: Insight['type']): string => {
    switch (type) {
      case 'positive':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'opportunity':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'neutral':
        return 'border-l-4 border-gray-500 bg-gray-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (type: Insight['type']): string => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'opportunity':
        return 'text-blue-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">
          AI Financial Insights
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalized recommendations based on your financial data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg transition-all hover:shadow-sm ${getInsightStyle(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <insight.icon 
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getIconColor(insight.type)}`}
                aria-hidden="true" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-black text-sm">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {insight.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-gray-300 hover:bg-white hover:border-gray-400 transition-colors"
                  onClick={() => handleInsightAction(insight.action, insight.type)}
                  disabled={!insight.actionEnabled}
                  aria-label={`${insight.action} for ${insight.title}`}
                >
                  {insight.action}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
