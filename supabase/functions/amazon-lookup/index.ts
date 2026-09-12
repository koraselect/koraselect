// ============================================================
// Supabase Edge Function: amazon-lookup
// Recibe la URL de un producto de Amazon y extrae ASIN, título,
// precio, imagen, rating y número de reseñas desde la página
// pública del producto. Best-effort (sin API oficial).
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

function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1].toUpperCase();
  }
  const bare = url.match(/\b([A-Z0-9]{10})\b/);
  return bare ? bare[1].toUpperCase() : null;
}

function amazonBaseFromUrl(url: string): string {
  const host = url.match(/^https?:\/\/([^/]+)/i)?.[1] || '';
  if (/^([a-z0-9-]+\.)*amazon\.(com|com\.mx|es|co\.uk|ca|de|in|fr|it|com\.br|nl|com\.au|jp|se|pl|ae|eg|tr)$/i.test(host)) {
    return `https://www.${host.replace(/^www\./i, '')}`;
  }
  return 'https://www.amazon.com';
}

function stripTags(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePriceText(text: string | null | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.,]/g, '');
  const match = cleaned.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return Number.isFinite(num) && num > 0 ? num : null;
}

function parseJsonLd(html: string): Record<string, unknown> | null {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const raw = JSON.parse(m[1]);
      const items = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const rec = item as Record<string, unknown>;
        const t = rec['@type'];
        const types = Array.isArray(t) ? (t as unknown[]) : [t];
        if (types.includes('Product') || (rec.name && rec.offers)) return rec;
      }
    } catch {
      // ignorar bloques que no son JSON
    }
  }
  return null;
}

function jsonLdPrice(item: Record<string, unknown> | null): number | null {
  if (!item || !item.offers) return null;
  const raw = item.offers;
  const offers: Record<string, unknown>[] = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [raw as Record<string, unknown>];
  for (const o of offers) {
    if (!o) continue;
    const inner = Array.isArray(o.offers) ? (o.offers as Record<string, unknown>[]) : [o];
    for (const entry of inner) {
      if (!entry || typeof entry !== 'object') continue;
      for (const key of ['lowPrice', 'price', 'highPrice']) {
        const v = (entry as Record<string, unknown>)[key];
        if (typeof v === 'number' && v > 0) return v;
        if (typeof v === 'string') {
          const n = parsePriceText(v);
          if (n) return n;
        }
      }
    }
  }
  return null;
}

function extractImage(page: string, ld: Record<string, unknown> | null): string {
  let img = '';
  if (ld?.image) img = Array.isArray(ld.image) ? String(ld.image[0]) : String(ld.image);
  if (!img.startsWith('http')) {
    const dyn = page.match(/data-a-dynamic-image="(\{[^}]*\})/);
    if (dyn) {
      try {
        const map: Record<string, unknown> = JSON.parse(dyn[1]);
        const keys = Object.keys(map);
        const best = keys
          .filter((k) => !/_(AC_UL|AC_Uy|AC_Ux|CR_|US_)/i.test(k))
          .sort((a, b) => {
            const na = Number(a.match(/_SL(\d+)/)?.[1] || 0);
            const nb = Number(b.match(/_SL(\d+)/)?.[1] || 0);
            return nb - na;
          });
        img = best[0] || keys[0] || '';
      } catch {
        // atributo inválido
      }
    }
  }
  if (!img.startsWith('http')) img = page.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i)?.[1] || '';
  if (!img.startsWith('http')) img = page.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/i)?.[1] || '';
  if (!img.startsWith('http')) img = page.match(/id="landingImage"[^>]*src="([^"]+)"/i)?.[1] || '';
  if (!img.startsWith('http')) {
    const clean = page.replace(/\\\//g, '/');
    const urls = [...clean.matchAll(/https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9._-]+)/g)]
      .map((m) => m[1].replace(/[)_"',<>&;]+$/, ''))
      .filter((id) => id.length <= 40 && !/\.\.\.$/.test(id))
      .map((id) => `https://m.media-amazon.com/images/I/${id}`);
    const best = urls
      .filter((u) => !/_(AC_UL|AC_Uy|AC_Ux|CR_|US_)/i.test(u))
      .sort((a, b) => {
        const na = Number(a.match(/_SL(\d+)/)?.[1] || 0);
        const nb = Number(b.match(/_SL(\d+)/)?.[1] || 0);
        return nb - na;
      });
    img = best[0] || urls[0] || '';
  }
  if (img.startsWith('//')) img = `https:${img}`;
  return img;
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

    const asin = extractAsin(rawUrl);
    if (!asin) {
      return new Response(JSON.stringify({ error: 'No se pudo identificar el ASIN del producto en la URL.' }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const base = amazonBaseFromUrl(rawUrl);
    const attempts: { url: string; ua: string }[] = [
      { url: `${base}/dp/${asin}`, ua: USER_AGENT },
      { url: `${base}/gp/aw/d/${asin}`, ua: MOBILE_UA },
    ];

    let page = '';
    let fetchedUrl = '';
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt.url, {
          headers: {
            'User-Agent': attempt.ua,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });
        if (res.ok) {
          page = await res.text();
          fetchedUrl = attempt.url;
          break;
        }
        console.error(`amazon-lookup: ${attempt.url} -> HTTP ${res.status}`);
      } catch (err) {
        console.error('amazon-lookup fetch fail:', attempt.url, err);
      }
    }

    if (!page) {
      return new Response(
        JSON.stringify({ error: 'Amazon no respondió (posible bloqueo temporal). Intenta nuevamente en unos segundos.' }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const ld = parseJsonLd(page);

    let title = ld?.name ? String(ld.name) : '';
    if (!title) title = stripTags(page.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    if (!title) title = stripTags(page.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i)?.[1] || '');
    if (title.startsWith('Amazon.com:')) title = '';

    const whole = page.match(/class="a-price-whole"[^>]*>(\d+)/i)?.[1];
    const fraction = page.match(/class="a-price-fraction"[^>]*>(\d+)/i)?.[1];

    const price =
      jsonLdPrice(ld) ??
      parsePriceText(page.match(/id="corePriceDisplay_desktop_feature_div"[\s\S]{0,4000}?class="a-offscreen">([^<]+)</i)?.[1]) ??
      parsePriceText(page.match(/id="apexPriceToPay"[\s\S]{0,3000}?class="a-offscreen">([^<]+)</i)?.[1]) ??
      parsePriceText(page.match(/id="price_inside_buybox"[^>]*>([^<]+)</i)?.[1]) ??
      parsePriceText(page.match(/class="a-offscreen">([^<]+)</i)?.[1]) ??
      parsePriceText(page.match(/id="priceblock_ourprice"[^>]*>([^<]+)</i)?.[1]) ??
      parsePriceText(page.match(/id="priceblock_dealprice"[^>]*>([^<]+)</i)?.[1]) ??
      (whole ? parseFloat(`${whole}.${fraction || '00'}`) : null);

    let image = extractImage(page, ld);

    let rating: number | null = null;
    const ratingMatch = page.match(/id="acrPopover"[^>]*title="([^"]*)"/i)?.[1] || '';
    const ratingNum = ratingMatch.match(/(\d(?:[.,]\d)?)\s*out of/i);
    if (ratingNum) rating = parseFloat(ratingNum[1].replace(',', '.'));
    if (rating === null && ld?.aggregateRating) {
      const rv = (ld.aggregateRating as Record<string, unknown>)?.ratingValue;
      if (typeof rv === 'number' && rv > 0) rating = rv;
    }
    if (rating !== null && (rating < 0 || rating > 5)) rating = null;

    let reviewsCount: number | null = null;
    const revMatch = page.match(/id="acrCustomerReviewText"[^>]*>([^<]*)/i)?.[1] || '';
    const revDigits = revMatch.replace(/[^0-9]/g, '');
    if (revDigits) reviewsCount = parseInt(revDigits, 10);
    if ((reviewsCount === null || reviewsCount === 0) && ld?.aggregateRating) {
      const rc = (ld.aggregateRating as Record<string, unknown>)?.reviewCount;
      if (typeof rc === 'number' && rc > 0) reviewsCount = rc;
    }

    if (!title && !price && !image) {
      return new Response(
        JSON.stringify({ error: 'No se pudo extraer el producto (Amazon puede estar mostrando captcha). Prueba con otro enlace.' }),
        { status: 422, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        asin,
        url: fetchedUrl || rawUrl,
        title,
        price,
        image,
        rating,
        reviewsCount,
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    console.error('amazon-lookup error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: jsonHeaders });
  }
});