
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'Forever Free',
    description: 'Perfect for getting started with financial management',
    features: [
      { name: 'Up to 50 transactions per month', included: true },
      { name: 'Basic income/expense tracking', included: true },
      { name: 'Simple dashboard (2 chart types)', included: true },
      { name: '5 invoices per month', included: true },
      { name: 'Basic PDF export', included: true },
      { name: 'Community support', included: true },
      { name: '3 months data history', included: true },
      { name: 'Watermarked reports', included: true },
      { name: 'Advanced AI insights', included: false },
      { name: 'Unlimited transactions', included: false },
      { name: 'Inventory management', included: false },
      { name: 'Custom branding', included: false },
      { name: 'Multi-user access', included: false },
      { name: 'API access', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2999,
    period: 'per month',
    description: 'Complete solution for growing businesses',
    popular: true,
    features: [
      { name: 'Unlimited transactions', included: true },
      { name: 'Advanced AI insights & recommendations', included: true },
      { name: 'Inventory management system', included: true },
      { name: 'Unlimited invoicing with custom templates', included: true },
      { name: 'Advanced reporting (P&L, Cash Flow, Tax)', included: true },
      { name: 'Budget tracking and planning', included: true },
      { name: 'Receipt OCR and auto-categorization', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Multi-user access (up to 5 users)', included: true },
      { name: 'API access for integrations', included: true },
      { name: 'Full data history and backup', included: true },
      { name: 'Custom branding options', included: true },
      { name: 'GST compliance tools', included: true },
      { name: 'Advanced analytics dashboard', included: true }
    ]
  }
];

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    setIsUpgrading(true);
    
    try {
      if (planId === 'pro') {
        // In a real implementation, this would integrate with payment gateway
        console.log('Initiating Pro plan upgrade for user:', user?.id);
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update user subscription status
        localStorage.setItem('withu_subscription', JSON.stringify({
          plan: 'pro',
          status: 'active',
          startDate: new Date().toISOString(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        setSelectedPlan(planId);
        alert('Successfully upgraded to Pro plan!');
      } else {
        setSelectedPlan(planId);
        localStorage.setItem('withu_subscription', JSON.stringify({
          plan: 'starter',
          status: 'active'
        }));
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                {plan.id === 'starter' ? (
                  <Zap className="w-12 h-12 text-green-500" />
                ) : (
                  <Crown className="w-12 h-12 text-yellow-500" />
                )}
              </div>
              
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                )}
              </div>
              
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isUpgrading}
              >
                {isUpgrading ? 'Processing...' : 
                 plan.id === selectedPlan ? 'Current Plan' : 
                 plan.price === 0 ? 'Get Started Free' : 'Upgrade to Pro'}
              </Button>

              {plan.id === 'pro' && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  14-day free trial • Cancel anytime
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Need a custom plan for your enterprise? 
        </p>
        <Button variant="outline">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};
