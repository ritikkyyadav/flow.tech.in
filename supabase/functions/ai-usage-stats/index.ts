
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current month stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyStats, error } = await supabaseClient
      .from('ai_requests')
      .select('tokens, cost, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      throw error;
    }

    const totalCalls = monthlyStats?.length || 0;
    const totalTokens = monthlyStats?.reduce((sum, req) => sum + (req.tokens || 0), 0) || 0;
    const totalCost = monthlyStats?.reduce((sum, req) => sum + (req.cost || 0), 0) || 0;
    const successfulCalls = monthlyStats?.filter(req => req.status === 'success').length || 0;

    // Generate daily usage for the last 7 days
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStats = monthlyStats?.filter(req => {
        const reqDate = new Date(req.created_at);
        return reqDate >= dayStart && reqDate <= dayEnd;
      }) || [];

      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        calls: dayStats.length,
        tokens: dayStats.reduce((sum, req) => sum + (req.tokens || 0), 0),
        cost: dayStats.reduce((sum, req) => sum + (req.cost || 0), 0)
      });
    }

    return new Response(JSON.stringify({
      totalCalls,
      totalTokens,
      totalCost,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(1) : 0,
      dailyUsage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error getting usage stats:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
