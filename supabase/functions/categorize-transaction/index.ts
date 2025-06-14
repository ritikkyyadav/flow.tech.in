
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, amount, vendor, date, user_id } = await req.json();

    // Category mapping with keywords and patterns
    const categoryRules = [
      {
        category: 'Food & Dining',
        keywords: ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc'],
        patterns: ['*food*', '*restaurant*', '*cafe*'],
        confidence: 0.9
      },
      {
        category: 'Transportation',
        keywords: ['uber', 'ola', 'taxi', 'metro', 'bus', 'petrol', 'fuel', 'parking', 'toll'],
        patterns: ['*transport*', '*travel*'],
        confidence: 0.85
      },
      {
        category: 'Shopping',
        keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store', 'market'],
        patterns: ['*shop*', '*purchase*'],
        confidence: 0.8
      },
      {
        category: 'Utilities',
        keywords: ['electricity', 'water', 'gas', 'internet', 'broadband', 'mobile', 'phone', 'recharge'],
        patterns: ['*bill*', '*utility*'],
        confidence: 0.95
      },
      {
        category: 'Healthcare',
        keywords: ['hospital', 'doctor', 'medical', 'pharmacy', 'medicine', 'clinic', 'health'],
        patterns: ['*medical*', '*health*'],
        confidence: 0.9
      },
      {
        category: 'Entertainment',
        keywords: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'bookmyshow'],
        patterns: ['*entertainment*', '*movie*'],
        confidence: 0.85
      },
      {
        category: 'Groceries',
        keywords: ['grocery', 'supermarket', 'bigbasket', 'grofers', 'vegetables', 'fruits'],
        patterns: ['*grocery*', '*market*'],
        confidence: 0.9
      },
      {
        category: 'Salary',
        keywords: ['salary', 'payroll', 'wages', 'income'],
        patterns: ['*salary*', '*pay*'],
        confidence: 0.95,
        type: 'income'
      },
      {
        category: 'Investment',
        keywords: ['mutual fund', 'sip', 'stock', 'share', 'zerodha', 'groww', 'investment'],
        patterns: ['*invest*', '*fund*'],
        confidence: 0.9
      }
    ];

    const suggestions: CategorySuggestion[] = [];
    const searchText = `${description} ${vendor}`.toLowerCase();

    // Score each category
    for (const rule of categoryRules) {
      let score = 0;
      let matches = [];

      // Check keywords
      for (const keyword of rule.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 0.3;
          matches.push(`keyword: ${keyword}`);
        }
      }

      // Check patterns
      for (const pattern of rule.patterns) {
        const regex = new RegExp(pattern.replace('*', '.*'), 'i');
        if (regex.test(searchText)) {
          score += 0.2;
          matches.push(`pattern: ${pattern}`);
        }
      }

      // Amount-based hints
      if (rule.category === 'Salary' && amount > 20000) {
        score += 0.4;
        matches.push('large income amount');
      }
      if (rule.category === 'Utilities' && amount < 5000 && amount > 100) {
        score += 0.2;
        matches.push('typical utility amount');
      }
      if (rule.category === 'Groceries' && amount < 10000 && amount > 500) {
        score += 0.1;
        matches.push('typical grocery amount');
      }

      // Time-based hints
      const transactionDate = new Date(date);
      const dayOfMonth = transactionDate.getDate();
      if (rule.category === 'Salary' && (dayOfMonth <= 5 || dayOfMonth >= 28)) {
        score += 0.3;
        matches.push('salary timing pattern');
      }

      if (score > 0.1) {
        const confidence = Math.min(score * rule.confidence, 0.95);
        suggestions.push({
          category: rule.category,
          confidence,
          reasoning: `Matched: ${matches.join(', ')}`
        });
      }
    }

    // Sort by confidence and return top 3
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestions = suggestions.slice(0, 3);

    // Add fallback if no good matches
    if (topSuggestions.length === 0 || topSuggestions[0].confidence < 0.5) {
      topSuggestions.unshift({
        category: 'Miscellaneous',
        confidence: 0.5,
        reasoning: 'No clear category pattern detected'
      });
    }

    return new Response(
      JSON.stringify({ suggestions: topSuggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in categorize-transaction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
