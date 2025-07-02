
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
    
    console.log('AI Request received:', { provider, model, prompt: prompt?.substring(0, 100) });
    
    let response;
    let tokens = 0;
    let cost = 0;

    if (provider === 'google' || provider === 'gemini') {
      const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
      console.log('Google API Key present:', !!googleApiKey);
      
      if (!googleApiKey) {
        console.error('Google API key not found in environment');
        return new Response(JSON.stringify({ 
          error: 'Google API key not configured',
          details: 'Please configure GOOGLE_API_KEY in environment variables'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const modelName = model || 'gemini-1.5-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${googleApiKey}`;
      
      console.log('Making request to Google API:', apiUrl);
      
      try {
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

        console.log('API Response status:', apiResponse.status);
        
        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('Google API error response:', errorText);
          return new Response(JSON.stringify({ 
            error: `Google API error: ${apiResponse.status}`,
            details: errorText
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const data = await apiResponse.json();
        console.log('API Response data:', JSON.stringify(data, null, 2));
        
        if (!data.candidates || data.candidates.length === 0) {
          console.error('No candidates in response:', data);
          return new Response(JSON.stringify({ 
            error: 'No response generated from Google API',
            details: 'The API did not return any candidates'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (data.candidates[0].finishReason === 'SAFETY') {
          console.error('Response blocked by safety filters');
          return new Response(JSON.stringify({ 
            error: 'Response was blocked by safety filters',
            details: 'Please try rephrasing your request'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
          console.error('Invalid response structure:', data.candidates[0]);
          return new Response(JSON.stringify({ 
            error: 'Invalid response structure from Google API',
            details: 'Response does not contain expected content structure'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        response = data.candidates[0].content.parts[0].text;
        
        // Estimate tokens (rough approximation)
        tokens = Math.ceil((prompt.length + response.length) / 4);
        cost = tokens * 0.00025 / 1000; // Rough cost estimate for Gemini
        
      } catch (fetchError) {
        console.error('Error calling Google API:', fetchError);
        return new Response(JSON.stringify({ 
          error: 'Failed to call Google API',
          details: fetchError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
    } else if (provider === 'openai') {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API key not configured',
          details: 'Please configure OPENAI_API_KEY in environment variables'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        return new Response(JSON.stringify({ 
          error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
      tokens = data.usage.total_tokens;
      cost = tokens * 0.002 / 1000; // Rough cost estimate for GPT-4o-mini
      
    } else {
      return new Response(JSON.stringify({ 
        error: `Unsupported provider: ${provider}`,
        details: 'Supported providers are: google, gemini, openai'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Response generated successfully');
    
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
      error: error.message || 'Internal server error',
      details: error.stack || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
