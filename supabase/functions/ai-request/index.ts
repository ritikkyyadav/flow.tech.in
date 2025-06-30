
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { provider, model, prompt } = await req.json();
    
    let response;
    let tokens = 0;
    let cost = 0;

    if (provider === 'google' || provider === 'gemini') {
      // Handle Google Gemini API
      const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
      if (!googleApiKey) {
        throw new Error('Google API key not configured');
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${googleApiKey}`;
      
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`Google API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await apiResponse.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Google API');
      }

      response = data.candidates[0].content.parts[0].text;
      
      // Estimate tokens (rough approximation)
      tokens = Math.ceil((prompt.length + response.length) / 4);
      cost = tokens * 0.00025 / 1000; // Rough cost estimate for Gemini Pro
      
    } else if (provider === 'openai') {
      // Handle OpenAI API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
      tokens = data.usage.total_tokens;
      cost = tokens * 0.002 / 1000; // Rough cost estimate for GPT-3.5-turbo
      
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return new Response(JSON.stringify({ 
      response, 
      tokens, 
      cost 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in ai-request function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
