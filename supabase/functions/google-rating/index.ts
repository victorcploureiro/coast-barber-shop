import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Trata requisição OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const placeId = Deno.env.get('GOOGLE_PLACE_ID'); // Ou coloque o Place ID diretamente aqui

    console.log('--- INICIANDO CHAMADA GOOGLE PLACES ---');
    console.log('API Key existe?:', !!apiKey);
    console.log('Place ID existe?:', !!placeId);

    if (!apiKey) {
      throw new Error('A variável GOOGLE_PLACES_API_KEY não está configurada nos Secrets do Supabase.');
    }

    // Exemplo de chamada para Places API (New)
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ERRO RETORNADO PELO GOOGLE:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('RESPOSTA SUCESSO DO GOOGLE:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('EXCEÇÃO NA EDGE FUNCTION:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});