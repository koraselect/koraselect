// ============================================================
// Supabase Edge Function: scrape-url
// Recibe la URL de un artículo o página web y extrae el título,
// descripción, imagen principal y el texto del contenido (sin
// etiquetas HTML) para usarlo como contexto en la redacción de
// entradas de blog con IA. Best-effort (sin librerías externas).
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// Límite de caracteres del contenido que se envía al prompt de IA.
const MAX_CONTENT_CHARS = 8000;

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&hellip;/gi, '…')
    .replace(/&mdash;|&ndash;/gi, '—');
}

function stripTags(text: string): string {
  return decodeEntities(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function metaContent(page: string, re: RegExp): string {
  const m = page.match(re);
  return m ? decodeEntities(m[1]) : '';
}

function ogImage(page: string): string {
  const m = page.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  let img = m ? m[1] : '';
  if (!img) {
    const m2 = page.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    img = m2 ? m2[1] : '';
  }
  if (img.startsWith('//')) img = `https:${img}`;
  return img;
}

// Extrae el texto principal de la página priorizando <article>, luego
// <main>, y como último recurso el <body> completo.
function extractBodyText(page: string): string {
  const candidates: string[] = [];
  const grab = (tag: string, attrs: string[]): void => {
    const re = new RegExp(`<${tag}[^>]*(?:${attrs.join('|')})[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = page.match(re);
    if (m) candidates.push(stripTags(m[1]));
  };
  grab('article', ['itemprop=["\']articleBody["\']']);
  grab('main', ['role=["\']main["\']', 'id=["\']main["\']', 'id=["\']content["\']']);

  let best = '';
  for (const c of candidates) {
    if (c.length > best.length) best = c;
  }

  if (best.length < 200) {
    const m = page.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (m) best = stripTags(m[1]);
  }

  // Colapsar espacios y líneas en blanco.
  best = best.replace(/\s{2,}/g, ' ').trim();
  if (best.length > MAX_CONTENT_CHARS) best = `${best.slice(0, MAX_CONTENT_CHARS)}…`;
  return best;
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
    const body = await req.json();
    const rawUrl = (body?.url || '').toString().trim();
    if (!rawUrl) {
      return new Response(JSON.stringify({ error: 'Falta el campo url' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    let url: URL;
    try {
      url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
      return new Response(JSON.stringify({ error: 'La URL no es válida.' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'Solo se permiten enlaces http/https.' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const attempts: { url: string; ua: string }[] = [
      { url: url.href, ua: USER_AGENT },
      { url: url.href, ua: MOBILE_UA },
    ];

    let page = '';
    let fetchedUrl = '';
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.url, {
          headers: {
            'User-Agent': attempt.ua,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
          },
          redirect: 'follow',
        });
        if (res.ok) {
          const ctype = res.headers.get('content-type') || '';
          if (!/html/i.test(ctype) && !/xml/i.test(ctype)) {
            return new Response(
              JSON.stringify({ error: 'El enlace no devuelve una página HTML (probablemente un archivo o imagen).' }),
              { status: 422, headers: jsonHeaders }
            );
          }
          page = await res.text();
          fetchedUrl = res.url || attempt.url;
          break;
        }
        console.error(`scrape-url: ${attempt.url} -> HTTP ${res.status}`);
      } catch (err) {
        console.error('scrape-url fetch fail:', attempt.url, err);
      }
    }

    if (!page) {
      return new Response(
        JSON.stringify({ error: 'No se pudo obtener la página. El sitio puede estar bloqueando el acceso.' }),
        { status: 502, headers: jsonHeaders }
      );
    }

    let title =
      metaContent(page, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      metaContent(page, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
      metaContent(page, /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    if (!title) {
      const m = page.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      title = m ? stripTags(m[1]) : '';
    }
    if (!title) {
      const m = page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = m ? stripTags(m[1]).slice(0, 200) : '';
    }

    const description =
      metaContent(page, /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      metaContent(page, /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
      metaContent(page, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      metaContent(page, /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);

    const content = extractBodyText(page);
    const image = ogImage(page);

    if (!title && !description && !content) {
      return new Response(
        JSON.stringify({ error: 'No se pudo extraer contenido de esa página.' }),
        { status: 422, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        url: fetchedUrl || url.href,
        title,
        description,
        content,
        image,
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    console.error('scrape-url error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});