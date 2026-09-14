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
  scrapedUrl?: string;
  scrapedContent?: string;
  selectedProducts?: (CatalogProduct & { subtitle?: string; description?: string })[];
  debug?: boolean;
}

function buildPrompt(body: RequestBody): string {
  const title = body.title?.trim() || 'Sin título';
  const topic = body.topic?.trim() || (body.selectedProducts?.length
    ? `Escribe una reseña y guía de compra centrada en el(los) producto(s) seleccionado(s). El(Los) producto(s) seleccionado(s) son el tema principal de la entrada.`
    : '');
  const category = body.blogCategory?.trim() || 'General';

  const catalogText = (body.products || [])
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} (${p.amazonUrl || 'sin link'}) — precio ${p.price ?? '—'}, rating ${p.rating ?? '—'}, ${p.reviewsCount ?? 0} reseñas. Imagen: ${p.mainImage || '—'}`
    )
    .join('\n');

  // Productos seleccionados como contexto adicional para la redacción.
  const selectedText = (body.selectedProducts || [])
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} (${p.amazonUrl || 'sin link'}) — precio ${p.price ?? '—'}, rating ${p.rating ?? '—'}, ${p.reviewsCount ?? 0} reseñas. Imagen (usa esta URL en el campo image de la tarjeta): ${p.mainImage || '—'}${p.subtitle ? `. Subtítulo: ${p.subtitle}` : ''}${p.description ? `. Descripción: ${p.description}` : ''}`
    )
    .join('\n');

  // Contenido extraído de la URL de referencia.
  let scrapedText = '';
  if (body.scrapedContent?.trim()) {
    scrapedText = `\n\nCONTENIDO DE REFERENCIA EXTRAÍDO DE LA URL ${body.scrapedUrl || '(sin URL)'}:\n${body.scrapedContent.trim()}\n\nUsa este contenido como contexto e inspiración para redactar la entrada (estructura, datos, enfoque), pero REESCRÍBELO completamente con tu propio estilo y las reglas de KORASELECT. NO lo copies textualmente ni lo repitas palabra por palabra.`;
  }

  let extra = '';
  if (body.existingPost?.title || body.existingPost?.body) {
    extra = `\nReescribe y mejora este contenido existente manteniendo el tema y tono: "${body.existingPost.title}". Contenido previo: ${JSON.stringify(body.existingPost.body)}.`;
  }

  const selectedBlock = selectedText
    ? `\n\nPRODUCTOS DESTACADOS (OBLIGATORIOS): debes incluir CADA uno de estos productos como una tarjeta product en la entrada, con su amazonUrl EXACTO y su imagen EXACTA:\n${selectedText}`
    : '';

  return `Eres redactor editorial experto de KORASELECT, una tienda afiliada de Amazon especializada en maletas y equipaje, botellas y termos, estuches y neceseres, organización, y gimbals o estabilizadores para creadores (p. ej. DJI RS Mini). Escribes en español neutro.

Crea una entrada de blog de 5 a 10 bloques usando SOLO estos tipos de bloque:
- {"type":"p","text":"..."} párrafo
- {"type":"h2","text":"..."} subtítulo
- {"type":"list","items":["...","..."]} lista con puntos
- {"type":"quote","text":"..."} cita destacada
- {"type":"product","title":"...","image":"...","excerpt":"...","amazonUrl":"...","rating":4.8,"reviewsCount":100} tarjeta de producto

Puedes usar etiquetas <strong>, <em> y <u> dentro de los textos de p, h2, quote y de los items de list para dar énfasis. NUNCA uses HTML dentro de bloques product.

Reglas:
- Comienza con un párrafo de introducción atractivo y termina con una conclusión (cita o párrafo).
- Incluye al menos una tarjeta product por cada 3 bloques.
- PRODUCTOS DESTACADOS (OBLIGATORIO si se entregan): crea una tarjeta product por CADA producto destacado. Priorízalos siempre sobre el resto del catálogo a la hora de elegir qué productos mostrar en las tarjetas.
- Si NO hay productos destacados pero sí catálogo, usa los productos del catálogo para las tarjetas product respetando sus amazonUrl e imágenes exactos.
- Si no hay ni catálogo ni productos destacados, no generes bloques product.${selectedBlock ? '\n- FOCO OBLIGATORIO cuando hay productos seleccionados: el contenido de la entrada DEBE tratar específicamente sobre el/los producto(s) destacado(s). Menciona sus características, usos, ventajas, desventajas, para quién son ideales y cómo elegirlos. NO desvíes el tema hacia maletas, gimbals, termos u otros productos de la tienda.' + '\n- Cuando haya productos seleccionados, las tarjetas product DEBEN ser SOLO de esos productos. NO incluyas ni menciones otros productos del catálogo en las tarjetas ni en el texto de la entrada.' : ''}${selectedBlock}
${scrapedText}
- Tono cercano, útil y honesto; NO incluyas avisos de afiliación ni menciones de comisiones en el texto de la entrada: la página ya muestra el aviso legal automáticamente al final.
- ORTOGRAFÍA Y TERMINOLOGÍA: escribe en castellano de Venezuela (español neutro latinoamericano comprensivo para todo LATAM). Evita el español de España: no uses "vosotros", "ordenador" ni "móvil" (usa "computadora" o "celular"), ni muletillas como "vale", "guay", "chulo" o "coger". Para estabilizadores de imagen usa SIEMPRE el término técnico "gimbal" (tal cual, en inglés, como lo usa la industria) cada vez que te refieras al dispositivo, por ejemplo: "el DJI RS 4 Mini es un gimbal compacto". NUNCA lo traduzcas a "cardán" ni lo sustituyas por "estabilizador" como nombre principal ni lo parafrasees ("solución de estabilidad", "artefacto", etc.); puedes escribir "estabilizador (gimbal)" una vez si lo aclaras, y luego solo "gimbal". Respeta los nombres de marca (DJI, GoPro, etc.) y usa tildes y puntuación correctas.

Título del post: ${title}
Tema o instrucciones: ${topic || '(redacta libremente según el título)'}
Categoría: ${category}
${extra}
Catálogo disponible (solo estas referencias para bloques product):
${catalogText || '(vacío)'}

Responde ÚNICAMENTE con un JSON válido de la forma {"excerpt": "resumen de 1 a 2 oraciones (máximo 160 caracteres) en español neutro que capture la esencia y el producto principal de la entrada, sin comillas del bloque", "blocks": [ ... ]}. Escribe el campo excerpt en una sola línea, sin saltos de línea. No añadas markdown, comillas externas ni comentarios en tu respuesta.`;
}

interface ExtractedResult {
  blocks: unknown[] | null;
  excerpt: string;
}

function extractResult(jsonText: string): ExtractedResult {
  let cleaned = jsonText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start)
    return { blocks: null, excerpt: '' };
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const blocks = (parsed as { blocks?: unknown[] }).blocks;
    const excerpt = typeof (parsed as { excerpt?: unknown }).excerpt === 'string'
      ? ((parsed as { excerpt: string }).excerpt).trim().slice(0, 180)
      : '';
    return { blocks: Array.isArray(blocks) ? blocks : null, excerpt };
  } catch {
    return { blocks: null, excerpt: '' };
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

async function listGroqModels(key: string): Promise<string[]> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Groq models ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const models = (data?.data || []) as { id: string }[];
  return models.map((m) => m.id);
}

function probeGroq(key: string, prompt: string, models: string[]) {
  return callGroq(key, prompt, models).catch((err: unknown) => {
    throw err instanceof Error ? new Error(`Groq probe falló: ${err.message}`) : new Error(String(err));
  });
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

    // Modo depuración: nunca expone las claves, solo status/errores y lista de modelos.
    if (body.debug) {
      const debugPayload: Record<string, unknown> = {
        debug: true,
        engine: null,
        blocks: null,
        groqModelsConfigured: [...new Set(groqModels)],
      };
      if (!groqKey) {
        debugPayload.error = 'GROQ_API_KEY no está configurado como secreto.';
        return new Response(JSON.stringify(debugPayload), { headers: jsonHeaders });
      }
      try {
        debugPayload.models = await listGroqModels(groqKey);
      } catch (err) {
        debugPayload.modelsListError = (err as Error).message.slice(0, 400);
      }
      try {
        const raw = await probeGroq(groqKey, prompt, [...new Set(groqModels)]);
        debugPayload.probeStatus = 'ok';
        debugPayload.probeRaw = raw.slice(0, 200);
      } catch (err) {
        debugPayload.probeStatus = 'error';
        debugPayload.probeError = (err as Error).message.slice(0, 600);
      }
      return new Response(JSON.stringify(debugPayload), { headers: jsonHeaders });
    }

    // 1) Intentar Groq (servidor de modelos estilo Grok)
    if (groqKey) {
      try {
        const raw = await callGroq(groqKey, prompt, [...new Set(groqModels)]);
        const { blocks, excerpt } = extractResult(raw);
        if (blocks) {
          return new Response(JSON.stringify({ engine: 'groq', blocks, excerpt }), { headers: jsonHeaders });
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
        const { blocks, excerpt } = extractResult(raw);
        if (blocks) {
          return new Response(JSON.stringify({ engine: 'gemini', blocks, excerpt }), { headers: jsonHeaders });
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