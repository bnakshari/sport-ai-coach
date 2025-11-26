import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    if (!cohereApiKey) {
      throw new Error('COHERE_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { message, context } = await req.json();

    // Fetch recent chat history
    const { data: history, error: historyError } = await supabaseClient
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    // Fetch recent sessions for context
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('sessions')
      .select('*, session_metrics(*)')
      .eq('athlete_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    }

    // Fetch athlete profile
    const { data: profile } = await supabaseClient
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build context for Cohere
    let systemContext = `You are an expert sports performance coach assistant. 
Your role is to help athletes improve their training and performance.

Guidelines:
- Provide evidence-based training advice
- Be encouraging and motivating
- Cite specific sessions when making recommendations
- Do NOT provide medical diagnoses
- Suggest consulting professionals for injuries
- Base suggestions on the athlete's recent performance data

`;

    if (profile) {
      systemContext += `\nAthlete Profile:
- Sport: ${profile.sport || 'Not specified'}
- Position: ${profile.position || 'Not specified'}
- Goals: ${profile.goals || 'Not specified'}
`;
    }

    if (sessions && sessions.length > 0) {
      systemContext += `\nRecent Training Sessions:\n`;
      sessions.forEach((session: any) => {
        systemContext += `- ${new Date(session.date).toLocaleDateString()}: ${session.type} (${session.duration_minutes || 0} min)\n`;
        if (session.notes) {
          systemContext += `  Notes: ${session.notes}\n`;
        }
      });
    }

    // Prepare chat history for Cohere
    const chatHistory = (history || [])
      .reverse()
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.message_text,
      }));

    // Call Cohere API
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        chat_history: chatHistory,
        preamble: systemContext,
        model: 'command-r-plus',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cohere API error:', response.status, errorText);
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.text;

    // Store user message
    await supabaseClient.from('chat_history').insert({
      user_id: user.id,
      role: 'user',
      message_text: message,
      metadata: { context: context || {} },
    });

    // Store assistant response
    await supabaseClient.from('chat_history').insert({
      user_id: user.id,
      role: 'assistant',
      message_text: assistantMessage,
      metadata: {},
    });

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        citations: data.citations || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cohere-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
