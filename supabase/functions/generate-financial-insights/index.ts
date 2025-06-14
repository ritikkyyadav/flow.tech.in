
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user transactions for analysis
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const { data: currentMonthTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('transaction_date', startOfMonth.toISOString());

    const { data: lastMonthTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('transaction_date', startOfLastMonth.toISOString())
      .lt('transaction_date', startOfMonth.toISOString());

    const insights = [];

    if (currentMonthTransactions && lastMonthTransactions) {
      // Spending pattern analysis
      const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
      const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense');
      
      const currentTotal = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
      const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
      
      if (lastMonthTotal > 0) {
        const change = ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100;
        
        if (Math.abs(change) > 15) {
          insights.push({
            id: 'spending-trend-' + Date.now(),
            type: change > 0 ? 'alert' : 'recommendation',
            title: `Spending ${change > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(change).toFixed(1)}%`,
            description: `Your expenses this month are ${change > 0 ? 'higher' : 'lower'} than last month by ₹${Math.abs(currentTotal - lastMonthTotal).toLocaleString()}. ${change > 0 ? 'Consider reviewing your budget to identify areas for cost reduction.' : 'Great job on reducing your expenses!'}`,
            impact: Math.abs(change) > 30 ? 'high' : 'medium',
            category: 'spending',
            action_items: change > 0 ? [
              'Review largest expense categories',
              'Set stricter monthly budgets',
              'Identify unnecessary subscriptions'
            ] : [
              'Continue current spending habits',
              'Consider allocating savings to investments'
            ],
            confidence: 0.9
          });
        }
      }

      // Category analysis
      const categorySpending = currentExpenses.reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

      const topCategories = Object.entries(categorySpending)
        .sort(([,a]: any, [,b]: any) => Number(b) - Number(a))
        .slice(0, 3);

      if (topCategories.length > 0 && Number(topCategories[0][1]) > 10000) {
        insights.push({
          id: 'top-category-' + Date.now(),
          type: 'optimization',
          title: `${topCategories[0][0]} is your highest expense category`,
          description: `You've spent ₹${Number(topCategories[0][1]).toLocaleString()} on ${topCategories[0][0]} this month, representing ${((Number(topCategories[0][1]) / currentTotal) * 100).toFixed(1)}% of your total expenses.`,
          impact: 'medium',
          category: 'optimization',
          action_items: [
            `Set a monthly budget limit for ${topCategories[0][0]}`,
            'Track daily expenses in this category',
            'Look for cost-saving alternatives'
          ],
          confidence: 0.85,
          data_points: { category: topCategories[0][0], amount: topCategories[0][1] }
        });
      }

      // Income analysis
      const currentIncome = currentMonthTransactions.filter(t => t.type === 'income');
      const totalIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - currentTotal) / totalIncome) * 100 : 0;

      if (savingsRate > 0) {
        insights.push({
          id: 'savings-rate-' + Date.now(),
          type: savingsRate > 20 ? 'recommendation' : 'alert',
          title: `Savings Rate: ${savingsRate.toFixed(1)}%`,
          description: savingsRate > 20 
            ? `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing this surplus for long-term wealth building.`
            : `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
          impact: savingsRate > 20 ? 'low' : 'high',
          category: 'savings',
          action_items: savingsRate > 20 ? [
            'Explore investment opportunities',
            'Increase emergency fund',
            'Consider tax-saving investments'
          ] : [
            'Review and reduce non-essential expenses',
            'Automate savings transfers',
            'Set up a monthly savings target'
          ],
          confidence: 0.95
        });
      }

      // Subscription detection
      const possibleSubscriptions = currentExpenses.filter(t => {
        const desc = (t.description || '').toLowerCase();
        const vendor = (t.vendor_merchant || '').toLowerCase();
        return desc.includes('subscription') || desc.includes('monthly') || 
               vendor.includes('netflix') || vendor.includes('spotify') || 
               vendor.includes('amazon prime') || desc.includes('gym');
      });

      if (possibleSubscriptions.length > 0) {
        const subscriptionTotal = possibleSubscriptions.reduce((sum, t) => sum + Number(t.amount), 0);
        insights.push({
          id: 'subscriptions-' + Date.now(),
          type: 'optimization',
          title: `${possibleSubscriptions.length} subscriptions detected`,
          description: `You have approximately ₹${subscriptionTotal.toLocaleString()} in subscription expenses this month. Review these for unused or duplicate services.`,
          impact: subscriptionTotal > 5000 ? 'high' : 'medium',
          category: 'subscriptions',
          action_items: [
            'Audit all active subscriptions',
            'Cancel unused services',
            'Consider annual plans for savings',
            'Set subscription spending limits'
          ],
          confidence: 0.8
        });
      }
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
