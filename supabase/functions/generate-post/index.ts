// ============================================================
// Supabase Edge Function: generate-post
// Genera borradores de entradas de blog con IA.
// Intenta Groq (Grok) primero y, si falla, usa Gemini (fallback).
// Las API keys viven como secretos; nunca llegan al frontend.
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

interface CatalogProduct {
  title: string;
  asin?: string;
  amazonUrl?: string;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  mainImage?: string;
}

interface RequestBody {
  title?: string;
  topic?: string;
  blogCategory?: string;
  products?: CatalogProduct[];
  existingPost?: { title?: string; body?: unknown } | null;
}

function buildPrompt(body: RequestBody): string {
  const title = body.title?.trim() || 'Sin título';
  const topic = body.topic?.trim() || '';
  const category = body.blogCategory?.trim() || 'General';

  const catalogText = (body.products || [])
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} (${p.amazonUrl || 'sin link'}) — precio ${p.price ?? '—'}, rating ${p.rating ?? '—'}, ${p.reviewsCount ?? 0} reseñas. Imagen: ${p.mainImage || '—'}`
    )
    .join('\n');

  let extra = '';
  if (body.existingPost?.title || body.existingPost?.body) {
    extra = `\nReescribe y mejora este contenido existente manteniendo el tema y tono: "${body.existingPost.title}". Contenido previo: ${JSON.stringify(body.existingPost.body)}.`;
  }

  return `Eres redactor editorial experto de KORASELECT, una tienda afiliada de Amazon especializada en maletas y equipaje, botellas y termos, estuches y neceseres, y organización. Escribes en español latinoamericano.

Crea una entrada de blog de 5 a 10 bloques usando SOLO estos tipos de bloque:
- {"type":"p","text":"..."} párrafo
- {"type":"h2","text":"..."} subtítulo
- {"type":"list","items":["...","..."]} lista con puntos
- {"type":"quote","text":"..."} cita destacada
- {"type":"product","title":"...","image":"...","excerpt":"...","amazonUrl":"...","rating":4.8,"reviewsCount":100} tarjeta de producto

Puedes usar etiquetas <strong>, <em> y <u> dentro de los textos de p, h2, quote y de los items de list para dar énfasis. NUNCA uses HTML dentro de bloques product.

Reglas:
- Comienza con un párrafo de introducción atractivo y termina con una conclusión (cita o párrafo).
- Incluye al menos una tarjeta product por cada 3 bloques, usando EXACTAMENTE los amazonUrl y las imágenes del catálogo entregado.
- Si el catálogo está vacío, no generes bloques product.
- Tono cercano, útil y honesto; menciona el aviso de afiliación solo de forma breve al final si encaja.

Título del post: ${title}
Tema o instrucciones: ${topic || '(redacta libremente según el título)'}
Categoría: ${category}
${extra}
Catálogo disponible (solo estas referencias para bloques product):
${catalogText || '(vacío)'}

Responde ÚNICAMENTE con un JSON válido de la forma {"blocks": [ ... ]}. No añadas markdown, comillas externas ni comentarios en tu respuesta.`;
}

function extractBlocks(jsonText: string): unknown[] | null {
  let cleaned = jsonText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const blocks = (parsed as { blocks?: unknown[] }).blocks;
    return Array.isArray(blocks) ? blocks : null;
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.8,
          max_tokens: 4000,
          messages: [
            { role: 'system', content: 'Eres un editor experto que responde solo con JSON.' },
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 4000 },
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
    const groqModels = [Deno.env.get('GROQ_MODEL') || 'grok-2', 'grok-2', 'llama-3.3-70b-versatile'].filter(Boolean) as string[];
    const geminiModels = [Deno.env.get('GEMINI_MODEL') || 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'].filter(Boolean) as string[];

    // 1) Intentar Groq (servidor de modelos estilo Grok)
    if (groqKey) {
      try {
        const raw = await callGroq(groqKey, prompt, [...new Set(groqModels)]);
        const blocks = extractBlocks(raw);
        if (blocks) {
          return new Response(JSON.stringify({ engine: 'groq', blocks }), { headers: jsonHeaders });
        }
        console.error('Groq respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Groq:', err);
      }
    }

    // 2) Fallback: Gemini
    if (geminiKey) {
      try {
        const raw = await callGemini(geminiKey, prompt, [...new Set(geminiModels)]);
        const blocks = extractBlocks(raw);
        if (blocks) {
          return new Response(JSON.stringify({ engine: 'gemini', blocks }), { headers: jsonHeaders });
        }
        console.error('Gemini respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Gemini:', err);
      }
    }

    return new Response(
      JSON.stringify({
        engine: null,
        blocks: null,
        error: 'No se pudo generar el contenido. Revisa que las API keys (GROQ_API_KEY / GEMINI_API_KEY) estén configuradas como secretos.',
      }),
      { status: 502, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Error de función:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});