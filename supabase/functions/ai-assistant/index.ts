
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, conversation_history } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's recent financial data for context
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('transaction_date', startOfMonth.toISOString())
      .order('transaction_date', { ascending: false })
      .limit(50);

    // Calculate basic financial summary
    const income = recentTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = recentTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = income - expenses;

    // Category breakdown
    const categoryBreakdown: any = {};
    recentTransactions?.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
    });

    // Simple rule-based responses for common queries
    const lowerMessage = message.toLowerCase();
    let response = '';
    let actions: any[] = [];
    let context: any = {};

    if (lowerMessage.includes('expense') && (lowerMessage.includes('this month') || lowerMessage.includes('month'))) {
      response = `This month you've spent ₹${expenses.toLocaleString()} across ${Object.keys(categoryBreakdown).length} categories. Your top spending categories are:\n\n`;
      const topCategories = Object.entries(categoryBreakdown)
        .sort(([,a]: any, [,b]: any) => Number(b) - Number(a))
        .slice(0, 5);
      
      topCategories.forEach(([category, amount]: any) => {
        const percentage = ((Number(amount) / expenses) * 100).toFixed(1);
        response += `• ${category}: ₹${Number(amount).toLocaleString()} (${percentage}%)\n`;
      });
      
      context = { expenses, categoryBreakdown };
    }
    else if (lowerMessage.includes('income') && lowerMessage.includes('expense')) {
      response = `Here's your financial summary for this month:\n\n💰 Income: ₹${income.toLocaleString()}\n💸 Expenses: ₹${expenses.toLocaleString()}\n📊 Net: ₹${balance.toLocaleString()}`;
      
      if (balance > 0) {
        response += `\n\n✅ Great! You're saving ₹${balance.toLocaleString()} this month (${((balance/income)*100).toFixed(1)}% savings rate).`;
      } else {
        response += `\n\n⚠️ You're spending more than you earn this month. Consider reviewing your expenses.`;
      }
      
      context = { income, expenses, balance, savingsRate: balance/income };
    }
    else if (lowerMessage.includes('saving') || lowerMessage.includes('save')) {
      const savingsRate = income > 0 ? (balance / income) * 100 : 0;
      response = `Your current savings rate is ${savingsRate.toFixed(1)}%. `;
      
      if (savingsRate > 20) {
        response += `Excellent! You're saving well above the recommended 20%. Consider investing your surplus for long-term growth.`;
        actions.push({
          type: 'view_chart',
          label: 'View Investment Options',
          data: { type: 'investment_suggestions' }
        });
      } else if (savingsRate > 0) {
        response += `You're saving some money, but financial experts recommend saving at least 20% of income. Here are some tips to increase your savings:\n\n• Review your top expense categories\n• Cancel unused subscriptions\n• Cook more meals at home\n• Set up automatic savings transfers`;
      } else {
        response += `You're currently spending more than you earn. Focus on reducing expenses first:\n\n• Track all expenses for a week\n• Identify non-essential spending\n• Create a monthly budget\n• Consider increasing your income`;
      }
    }
    else if (lowerMessage.includes('budget')) {
      response = `Based on your spending patterns, here are suggested monthly budgets:\n\n`;
      const topCategories = Object.entries(categoryBreakdown)
        .sort(([,a]: any, [,b]: any) => Number(b) - Number(a))
        .slice(0, 5);
      
      topCategories.forEach(([category, amount]: any) => {
        const suggestedBudget = Math.ceil(Number(amount) * 1.1 / 1000) * 1000; // Round up to nearest 1000
        response += `• ${category}: ₹${suggestedBudget.toLocaleString()}\n`;
      });
      
      actions.push({
        type: 'set_budget',
        label: 'Set These Budgets',
        data: { budgets: topCategories }
      });
    }
    else if (lowerMessage.includes('highest') || lowerMessage.includes('top')) {
      const topExpenses = recentTransactions
        ?.filter(t => t.type === 'expense')
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5) || [];
      
      response = `Your highest expenses this month:\n\n`;
      topExpenses.forEach((t, index) => {
        response += `${index + 1}. ₹${Number(t.amount).toLocaleString()} - ${t.description || 'No description'} (${t.category})\n`;
      });
    }
    else if (lowerMessage.includes('invoice')) {
      response = `I can help you create an invoice. What details do you need to include?\n\n• Client name and details\n• Invoice items and amounts\n• Due date and payment terms\n\nWould you like me to guide you through creating an invoice?`;
      
      actions.push({
        type: 'create_invoice',
        label: 'Create Invoice',
        data: { template: 'standard' }
      });
    }
    else if (lowerMessage.includes('add') && (lowerMessage.includes('expense') || lowerMessage.includes('transaction'))) {
      response = `I can help you add a transaction. Please provide:\n\n• Amount\n• Description\n• Category\n• Date (optional)\n\nFor example: "Add ₹500 expense for lunch in food category"`;
      
      actions.push({
        type: 'create_transaction',
        label: 'Add Transaction',
        data: { type: 'expense' }
      });
    }
    else {
      // Generic helpful response
      response = `I'm here to help with your finances! I can assist with:\n\n📊 Analyzing your spending patterns\n💰 Tracking income and expenses\n📈 Setting budgets and financial goals\n📋 Creating invoices\n💡 Providing personalized financial insights\n\nWhat would you like to know about your finances?`;
    }

    return new Response(
      JSON.stringify({ 
        response, 
        actions,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          query_type: 'financial_analysis'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        actions: [],
        context: { error: true }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
