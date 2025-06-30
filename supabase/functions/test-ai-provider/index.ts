
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
    const { provider } = await req.json();
    
    let success = false;

    if (provider.type === 'google' || provider.id === 'google') {
      // Test Google Gemini API
      const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
      if (!googleApiKey) {
        throw new Error('Google API key not configured');
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`;
      
      const testResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message. Please respond with 'Test successful'."
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
          }
        }),
      });

      success = testResponse.ok;
      
    } else if (provider.type === 'openai' || provider.id === 'openai') {
      // Test OpenAI API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: "Hello, this is a test message. Please respond with 'Test successful'." }
          ],
          max_tokens: 50,
        }),
      });

      success = testResponse.ok;
    }

    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error testing AI provider:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
