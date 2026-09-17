// ============================================================
// Supabase Edge Function: generate-meta
// Redacta con IA el TÍTULO o el EXTRACTO de una entrada de blog
// por separado, para editar esos campos puntuales con la IA.
// Intenta Groq primero y, si falla, usa Gemini (fallback).
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

interface MetaProduct {
  title: string;
  asin?: string;
  amazonUrl?: string;
  price?: number;
  rating?: number;
}

interface MetaRequestBody {
  field?: 'title' | 'excerpt' | 'both';
  title?: string;
  excerpt?: string;
  topic?: string;
  blogCategory?: string;
  products?: MetaProduct[];
  selectedProducts?: (MetaProduct & { subtitle?: string; description?: string })[];
  scrapedUrl?: string;
  scrapedContent?: string;
  content?: string;
}

function buildPrompt(body: MetaRequestBody): string {
  const field = body.field === 'excerpt' ? 'excerpt' : 'title';
  const title = body.title?.trim() || '';
  const excerpt = body.excerpt?.trim() || '';
  const topic = body.topic?.trim() || '';
  const category = body.blogCategory?.trim() || 'General';
  const content = (body.content || '').trim().slice(0, 3000);

  const catalogTitles = (body.products || [])
    .map((p) => p.title)
    .filter(Boolean)
    .slice(0, 30)
    .join('; ');

  const selectedText = (body.selectedProducts || [])
    .map((p, i) => `${i + 1}. ${p.title}${p.rating ? ` (★ ${p.rating})` : ''}${p.subtitle ? `. ${p.subtitle}` : ''}`)
    .join('\n');

  let scrapedText = '';
  if (body.scrapedContent?.trim()) {
    scrapedText = `\nReferencia extraída de ${body.scrapedUrl || '(URL)'}: ${body.scrapedContent.trim().slice(0, 2000)}`;
  }

  const base = `Eres redactor editorial experto de KORASELECT, una tienda afiliada de Amazon en Latinoamérica especializada en maletas y equipaje, botellas y termos, estuches y neceseres, organización, y gimbals o estabilizadores para creadores. Escribes en español neutro de Venezuela (comprensivo para todo LATAM).

Quiero que redactes uno de los textos de presentación de una entrada de blog de KORASELECT. Escribe con naturalidad, como un humano, SIN clichés ni fórmulas recicladas. Evita empezar con muletillas como "En este artículo", "En el mundo actual", "A la hora de", "Cada vez más personas", "Descubre", "Guía definitiva", "Todo sobre", "Conoce", "Si buscas". Respeta la marca y los nombres exactos de los productos, no inventes datos y usa tildes correctas.

Datos de la entrada:
- Categoría: ${category}
- Título actual: ${title || '(vacío)'}
- Extracto actual: ${excerpt || '(vacío)'}
- Tema o instrucciones: ${topic || '(dedúcelo del contenido)'}
- Contenido de la entrada: ${content ? '\n' + content : '(vacío)'}
${scrapedText}
${selectedText ? `\nProductos destacados de la entrada:\n${selectedText}` : catalogTitles ? `\nProductos disponibles en el catálogo (contexto): ${catalogTitles}` : ''}`;

  if (field === 'title') {
    return `${base}

Tarea: redactar el TÍTULO ideal de la entrada (máximo 70 caracteres). Debe ser específico, con gancho y orientado al lector, reflejando el contenido real. Varía entre las opciones posibles: pregunta, beneficio concreto, promesa verificable, curiosidad. NO enumeres características ni repitas el catálogo en el título.

Responde ÚNICAMENTE con un JSON válido: {"title": "título aquí"}. No añadas markdown, comillas externas ni comentarios.`;
  }

  return `${base}

Tarea: redactar el EXTRACTO o resumen de la entrada (máximo 160 caracteres, de 1 a 2 oraciones), el que se muestra como tarjeta en el blog. Debe enganchar al lector, ser natural, concreto y reflejar el contenido real y el producto principal. No lo repitas textualmente del contenido y evita los clichés.

Responde ÚNICAMENTE con un JSON válido: {"excerpt": "extracto aquí"}. No añadas markdown, comillas externas ni comentarios.`;
}

interface ExtractedResult {
  title?: string;
  excerpt?: string;
}

function extractResult(jsonText: string): ExtractedResult {
  let cleaned = jsonText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return {};
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as ExtractedResult;
    const out: ExtractedResult = {};
    if (typeof parsed.title === 'string') out.title = parsed.title.trim().slice(0, 90);
    if (typeof parsed.excerpt === 'string') out.excerpt = parsed.excerpt.trim().slice(0, 180);
    return out;
  } catch {
    return {};
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
          temperature: 0.85,
          max_tokens: 500,
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.85, maxOutputTokens: 500 },
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
    const body: MetaRequestBody = await req.json();
    const field = body.field === 'excerpt' ? 'excerpt' : 'title';
    const prompt = buildPrompt(body);

    const groqKey = Deno.env.get('GROQ_API_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const groqModels = [Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound'].filter(Boolean) as string[];
    const geminiModels = [Deno.env.get('GEMINI_MODEL') || 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'].filter(Boolean) as string[];

    if (groqKey) {
      try {
        const raw = await callGroq(groqKey, prompt, [...new Set(groqModels)]);
        const parsed = extractResult(raw);
        if (field === 'title' ? parsed.title : parsed.excerpt) {
          return new Response(JSON.stringify({ engine: 'groq', field, ...parsed }), { headers: jsonHeaders });
        }
        console.error('Groq respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Groq:', err);
      }
    }

    if (geminiKey) {
      try {
        const raw = await callGemini(geminiKey, prompt, [...new Set(geminiModels)]);
        const parsed = extractResult(raw);
        if (field === 'title' ? parsed.title : parsed.excerpt) {
          return new Response(JSON.stringify({ engine: 'gemini', field, ...parsed }), { headers: jsonHeaders });
        }
        console.error('Gemini respondió pero no se pudo parsear JSON:', raw.slice(0, 300));
      } catch (err) {
        console.error('Error en Gemini:', err);
      }
    }

    return new Response(
      JSON.stringify({
        error: 'No se pudo generar el texto. Revisa que las API keys (GROQ_API_KEY / GEMINI_API_KEY) estén configuradas como secretos.',
      }),
      { status: 502, headers: jsonHeaders }
    );
  } catch (err) {
    console.error('Error de función:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});