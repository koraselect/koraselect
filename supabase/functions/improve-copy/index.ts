// ============================================================
// Supabase Edge Function: improve-copy
// Redacta con IA el contenido A+ del producto (título y
// subtítulo/historia) para que sea atractivo al comprador.
// Intenta Groq primero y, si falla, usa Gemini (fallback).
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

interface RequestBody {
  product?: {
    title?: string;
    subtitle?: string;
    category?: string;
    badge?: string;
    brand?: string;
    price?: number;
    rating?: number;
    reviewsCount?: number;
  };
  currentTitle?: string;
  currentSubtitle?: string;
}

function buildPrompt(body: RequestBody): string {
  const p = body.product || {};
  const title = p.title?.trim() || '(producto sin título)';
  const subtitle = p.subtitle?.trim() || '';
  const category = p.category?.trim() || 'General';
  const badge = p.badge?.trim() || 'A+ Content';
  const brand = p.brand?.trim() || '';
  const currentTitle = body.currentTitle?.trim() || '';
  const currentSubtitle = body.currentSubtitle?.trim() || '';

  return `Eres redactor publicitario experto de KORASELECT, una tienda afiliada de Amazon en Latinoamérica que vende maletas y equipaje, botellas y termos, estuches y neceseres, organización, y gimbals/estabilizadores para creadores (p. ej. DJI RS Mini). Escribes en castellano de Venezuela (español neutro latinoamericano, comprensible para todo LATAM).

Tu tarea: escribir un TÍTULO y un SUBTÍTULO o HISTORIA atractivos que aparecerán en el visor A+ (modal desplegable) del producto, para convencer al comprador.

Datos del producto:
- Nombre: ${title}
- Categoría: ${category}
${p.brand ? `- Marca: ${brand}` : ''}
${p.badge ? `- Etiqueta: ${badge}` : ''}
${p.price ? `- Precio: $${p.price}` : ''}
${p.rating ? `- Rating: ${p.rating}` : ''}
${subtitle ? `- Subtítulo actual: ${subtitle}` : ''}
${currentTitle ? `- Título A+ actual: ${currentTitle}` : ''}
${currentSubtitle ? `- Subtítulo A+ actual: ${currentSubtitle}` : ''}

Reglas:
- Entrega 3 opciones de TÍTULO (cortas, máx. ~60 caracteres) y 3 opciones de SUBTÍTULO o HISTORIA (máx. ~130 caracteres), persuasivas, concretas y con gancho de venta.
- Español neutro de Venezuela/LATAM: nunca uses "vosotros", "ordenador" ni "móvil" (usa "computadora" o "celular"), ni "vale", "guay", "chulo" o "coger".
- Para estabilizadores usa SIEMPRE la palabra "gimbal" (término técnico usado por la industria). NUNCA uses "cardán" ni "estabilizador" como nombre principal.
- Respeta la marca y el modelo exactos (DJI, Garmin, etc.). No inventes especificaciones. No pongas el precio literal si no fue entregado.
- Tono cercano, útil y honesto; sin exageraciones absurdas ni promesas imposibles.
- No uses comillas dobles dentro del texto (si necesitas citar, usa comillas simples o paréntesis).

Responde ÚNICAMENTE con un JSON válido de la forma {"titles":["...","...","..."],"subtitles":["...","...","..."]}. No añadas markdown, comillas externas ni comentarios.`;
}

function extractJson(jsonText: string): { titles?: string[]; subtitles?: string[] } | null {
  let cleaned = jsonText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!parsed || typeof parsed !== 'object') return null;
    const titles = Array.isArray((parsed as { titles?: unknown }).titles)
      ? ((parsed as { titles: unknown[] }).titles.filter((t): t is string => typeof t === 'string'))
      : [];
    const subtitles = Array.isArray((parsed as { subtitles?: unknown }).subtitles)
      ? ((parsed as { subtitles: unknown[] }).subtitles.filter((s): s is string => typeof s === 'string'))
      : [];
    if (titles.length > 0 && subtitles.length > 0) return { titles, subtitles };
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
          max_tokens: 1200,
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
            generationConfig: { temperature: 0.9, maxOutputTokens: 1200 },
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
        error: 'No se pudo generar el copy. Revisa que las API keys (GROQ_API_KEY / GEMINI_API_KEY) estén configuradas como secretos.',
      }),
      { status: 502, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Error de función:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});