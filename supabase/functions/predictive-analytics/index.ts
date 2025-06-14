
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

    // Get last 6 months of data for better predictions
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('transaction_date', sixMonthsAgo.toISOString())
      .order('transaction_date', { ascending: true });

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({
          cash_flow_forecast: {
            next_3_months: [0, 0, 0],
            confidence: 0.1,
            trend: 'stable'
          },
          savings_projection: {
            monthly_potential: 0,
            annual_projection: 0,
            goal_achievement_probability: 0.5
          },
          spending_predictions: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group transactions by month
    const monthlyData: any = {};
    transactions.forEach(t => {
      const monthKey = new Date(t.transaction_date).toISOString().slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, by_category: {} };
      }
      
      const amount = Number(t.amount);
      if (t.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += amount;
        if (!monthlyData[monthKey].by_category[t.category]) {
          monthlyData[monthKey].by_category[t.category] = 0;
        }
        monthlyData[monthKey].by_category[t.category] += amount;
      }
    });

    const months = Object.keys(monthlyData).sort();
    const recentMonths = months.slice(-3);

    // Calculate trends
    const incomeValues = recentMonths.map(m => monthlyData[m].income);
    const expenseValues = recentMonths.map(m => monthlyData[m].expenses);
    const netFlowValues = recentMonths.map(m => monthlyData[m].income - monthlyData[m].expenses);

    // Simple linear regression for trend
    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return 0;
      const n = values.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
      const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
      
      return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    };

    const incomeTrend = calculateTrend(incomeValues);
    const expenseTrend = calculateTrend(expenseValues);
    const netFlowTrend = calculateTrend(netFlowValues);

    // Predict next 3 months cash flow
    const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length || 0;
    const avgExpenses = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length || 0;

    const cashFlowForecast = [];
    for (let i = 1; i <= 3; i++) {
      const predictedIncome = avgIncome + (incomeTrend * i);
      const predictedExpenses = avgExpenses + (expenseTrend * i);
      cashFlowForecast.push(predictedIncome - predictedExpenses);
    }

    // Determine trend direction
    let trendDirection: 'increasing' | 'stable' | 'decreasing';
    if (netFlowTrend > 100) trendDirection = 'increasing';
    else if (netFlowTrend < -100) trendDirection = 'decreasing';
    else trendDirection = 'stable';

    // Calculate confidence based on data consistency
    const cashFlowConfidence = Math.min(0.9, Math.max(0.3, 1 - (Math.abs(netFlowTrend) / 10000)));

    // Savings projection
    const currentSavings = avgIncome - avgExpenses;
    const monthlySavingsPotential = Math.max(0, currentSavings);
    const annualProjection = monthlySavingsPotential * 12;

    // Goal achievement probability (simplified)
    const goalAchievementProbability = Math.min(0.95, Math.max(0.1, 
      monthlySavingsPotential > 0 ? 0.7 + (monthlySavingsPotential / 100000) : 0.3
    ));

    // Category-wise spending predictions
    const spendingPredictions = [];
    const allCategories = new Set<string>();
    Object.values(monthlyData).forEach((month: any) => {
      Object.keys(month.by_category).forEach(cat => allCategories.add(cat));
    });

    for (const category of allCategories) {
      const categoryAmounts = recentMonths.map(m => monthlyData[m].by_category[category] || 0);
      const avgAmount = categoryAmounts.reduce((a, b) => a + b, 0) / categoryAmounts.length;
      const variance = categoryAmounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / categoryAmounts.length;
      const confidence = Math.max(0.3, 1 - (Math.sqrt(variance) / avgAmount));

      if (avgAmount > 100) {
        spendingPredictions.push({
          category,
          predicted_amount: avgAmount,
          confidence: Math.min(0.95, confidence)
        });
      }
    }

    spendingPredictions.sort((a, b) => b.predicted_amount - a.predicted_amount);

    const response = {
      cash_flow_forecast: {
        next_3_months: cashFlowForecast,
        confidence: cashFlowConfidence,
        trend: trendDirection
      },
      savings_projection: {
        monthly_potential: monthlySavingsPotential,
        annual_projection: annualProjection,
        goal_achievement_probability: goalAchievementProbability
      },
      spending_predictions: spendingPredictions.slice(0, 10)
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predictive analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
