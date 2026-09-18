// ============================================================
// Supabase Edge Function: generate-subtitle
// Redacta con IA el SUBTÍTULO o RESUMEN CORTO de un producto
// usando como contexto las características de la sección
// "About this item" de Amazon. Intenta Groq primero y, si
// falla, usa Gemini (fallback).
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

interface RequestBody {
  title?: string;
  features?: string[];
}

function buildPrompt(body: RequestBody): string {
  const title = body.title?.trim() || '(producto sin título)';
  const features = (body.features || []).filter((f) => f && f.trim()).slice(0, 15);

  const featuresBlock = features.length
    ? features.map((f, i) => `${i + 1}. ${f.trim()}`).join('\n')
    : 'No se proporcionaron características. Redacta apoyándote solo en el título, sin inventar especificaciones.';

  return `Eres redactor publicitario experto de KORASELECT, una tienda afiliada de Amazon en Latinoamérica que vende maletas y equipaje, botellas y termos, estuches y neceseres, organización, y gimbals/estabilizadores para creadores (p. ej. DJI RS Mini). Escribes en castellano neutro latinoamericano, comprensible en todo LATAM.

Tu tarea: redactar UN SUBTÍTULO o RESUMEN CORTO, una única frase impactante y persuasiva de máximo 170 caracteres, que aparecerá justo debajo del título del producto en la tarjeta de una tienda afiliada, para convencer al comprador de hacer clic.

Título del producto: ${title}

Características reales del producto (extraídas de la sección "About this item" de Amazon). Úsalas SOLO como contexto para captar el beneficio principal, no las transcribas literalmente:
${featuresBlock}

Reglas:
- Una sola frase corta con gancho de venta; refleja el beneficio principal de la forma más concreta y atractiva posible.
- No inventes especificaciones que no aparezcan en las características.
- Español neutro de Venezuela/LATAM: nunca uses "vosotros", "ordenador" ni "móvil" (usa "computadora" o "celular"), ni "vale", "guay", "chulo" o "coger".
- Si el producto es un estabilizador, usa SIEMPRE la palabra "gimbal" (nunca "cardán").
- Respeta la marca y el modelo exactos (DJI, Garmin, etc.).
- Tono cercano, útil y honesto; sin exageraciones absurdas ni promesas imposibles.
- No uses comillas dobles dentro del texto (usa paréntesis o comillas simples).

Responde ÚNICAMENTE con un JSON válido de la forma {"subtitle":"..."}. No añadas markdown, comillas externas ni comentarios.`;
}

function extractJson(jsonText: string): { subtitle?: string } | null {
  let cleaned = jsonText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!parsed || typeof parsed !== 'object') return null;
    const subtitle = (parsed as { subtitle?: unknown }).subtitle;
    if (typeof subtitle === 'string' && subtitle.trim()) return { subtitle: subtitle.trim() };
    return null;
  } catch {
    return null;
  }
}

async function callGroq(key: string, prompt: string, models: string[]): Promise<string> {
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          temperature: 0.9,
          max_tokens: 300,
          messages: [
            { role: 'system', content: 'Eres un copywriter publicitario experto que responde solo con JSON.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Groq ${model}: ${res.status} ${text}`);
        continue;
      }
      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`Groq ${model}: respuesta vacía`);
      return content;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Groq falló');
}

async function callGemini(key: string, prompt: string, models: string[]): Promise<string> {
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
          }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        lastError = new Error(`Gemini ${model}: ${res.status} ${text}`);
        continue;
      }
      const data = await res.json();
      const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error(`Gemini ${model}: respuesta vacía`);
      return content;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Gemini falló');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const prompt = buildPrompt(body);

    const groqKey = Deno.env.get('GROQ_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const groqModels = [Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound'].filter(Boolean) as string[];
    const geminiModels = [Deno.env.get('GEMINI_MODEL') || 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'].filter(Boolean) as string[];

    if (groqKey) {
      try {
        const raw = await callGroq(groqKey, prompt, [...new Set(groqModels)]);
        const parsed = extractJson(raw);
        if (parsed) {
          return new Response(JSON.stringify({ engine: 'groq', ...parsed }), { headers: jsonHeaders });
        }
        console.error('Groq respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Groq:', err);
      }
    }

    if (geminiKey) {
      try {
        const raw = await callGemini(geminiKey, prompt, [...new Set(geminiModels)]);
        const parsed = extractJson(raw);
        if (parsed) {
          return new Response(JSON.stringify({ engine: 'gemini', ...parsed }), { headers: jsonHeaders });
        }
        console.error('Gemini respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Gemini:', err);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'No se pudo redactar el subtítulo. Revisa que las API keys (GROQ_API_KEY / GEMINI_API_KEY) estén configuradas como secretos.',
      }),
      { status: 502, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Error de función:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});