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
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const UA_LIST = [USER_AGENT, CHROME_UA, MOBILE_UA];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

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

// Recoge todas las URLs contenidas en los bloques `data-a-dynamic-image`
// de la página (la galería de imágenes del producto). El HTML de Amazon
// codifica las comillas como &quot;, por lo que se decodifican antes de parsear.
function collectDynamicImageUrls(page: string): string[] {
  const clean = page.replace(/\\\//g, '/');
  const urls = new Set<string>();
  const re = /data-a-dynamic-image="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    try {
      const map = JSON.parse(decodeHtmlEntities(m[1])) as Record<string, unknown>;
      for (const k of Object.keys(map)) {
        if (k.startsWith('http')) urls.add(k);
      }
    } catch {
      // atributo inválido
    }
  }
  return [...urls];
}

function galleryImageBaseId(url: string): string {
  const m = url.match(/images\/I\/([^.]+)[._]/);
  return m ? m[1] : url;
}

function galleryImageSize(url: string): number {
  const m = url.match(/_S[LXUY](\d+)_/);
  return m ? Number(m[1]) : 0;
}

function isThumbnailVariant(url: string): boolean {
  return /_(AC_UL|AC_Uy|AC_Ux|CR_|US_|SR)/i.test(url);
}

// Devuelve las imágenes reales del producto (host m.media-amazon.com),
// una sola versión por foto (la de mayor resolución), ordenadas de mayor a menor.
function extractGalleryImages(page: string): string[] {
  const byBase = new Map<string, string>();
  for (const url of collectDynamicImageUrls(page)) {
    if (!url.includes('m.media-amazon.com') || isThumbnailVariant(url)) continue;
    const base = galleryImageBaseId(url);
    const current = byBase.get(base);
    if (!current || galleryImageSize(url) > galleryImageSize(current)) {
      byBase.set(base, url);
    }
  }
  return [...byBase.values()].sort((a, b) => galleryImageSize(b) - galleryImageSize(a));
}

// Extrae los bullets de la sección "About this item" de Amazon.
// En el HTML aparecen como spans `.a-list-item` dentro del bloque
// `#feature-bullets`. Se devuelven en orden, sin duplicados.
function extractAboutThisItem(page: string): string[] {
  const clean = page.replace(/\\\//g, '/');
  const headerIdx = clean.search(/<div[^>]*id=["']feature-bullets["']/i);
  const headingIdx = headerIdx === -1 ? clean.search(/<h\d[^>]*>[^<]*About this item/i) : -1;
  const start = headerIdx !== -1 ? headerIdx : headingIdx;
  if (start === -1) return [];

  let section = clean.slice(start, start + 12000);
  const cutoff = section.search(/id=["'](productDetails|twister|aplus|productDescription)|<div[^>]*id=["']detailBullets/i);
  if (cutoff !== -1) section = section.slice(0, cutoff);

  const bullets: string[] = [];
  const re = /<span[^>]*class=["'][^"']*\ba-list-item\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null) {
    let b = stripTags(m[1]);
    if (!b || b.length < 3) continue;
    b = b.replace(/read more.*$/i, '').replace(/\s+/g, ' ').trim();
    if (!b || bullets.includes(b)) continue;
    bullets.push(b);
  }
  return bullets.slice(0, 15);
}

// Extrae un subtítulo corto del producto a partir del meta description
// de Amazon (por ejemplo: "for Wide Mouth and Regular Mouth Mason Jar").
function extractSubtitle(page: string, productTitle: string): string {
  const rawDesc =
    page.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] || '';
  let s = stripTags(rawDesc);
  s = decodeHtmlEntities(s);
  const cleanTitle = stripTags(productTitle);
  if (cleanTitle && s.startsWith(`Amazon.com: ${cleanTitle}`)) {
    const rest = s.slice(`Amazon.com: ${cleanTitle}`.length).trim();
    s = rest.startsWith('|') ? rest.slice(1).trim() : rest;
  } else if (s.startsWith('Amazon.com:')) {
    s = s.slice('Amazon.com:'.length).trim();
    const barIdx = s.indexOf('|');
    if (barIdx !== -1) s = s.slice(barIdx + 1).trim();
  }
  s = s.replace(/\s*:\s*[^:]*$/, '').trim();
  if (!s) return '';
  return s.length > 170 ? `${s.slice(0, 167)}…` : s;
}

function extractImage(page: string, ld: Record<string, unknown> | null): string {
  let img = '';
  if (ld?.image) img = Array.isArray(ld.image) ? String(ld.image[0]) : String(ld.image);
  if (!img.startsWith('http')) {
    const gallery = extractGalleryImages(page);
    img = gallery[0] || '';
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
      .filter((u) => !isThumbnailVariant(u))
      .sort((a, b) => galleryImageSize(b) - galleryImageSize(a));
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
    const attemptUrls = [
      `${base}/dp/${asin}`,
      `${base}/gp/aw/d/${asin}`,
      rawUrl,
    ];

    let page = '';
    let fetchedUrl = '';
    fetchLoop: for (const url of attemptUrls) {
      for (const ua of UA_LIST) {
        for (let attempt = 0; attempt < 2; attempt++) {
          if (attempt > 0) await sleep(700 * attempt);
          try {
            const res = await fetch(url, {
              headers: {
                'User-Agent': ua,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Referer: 'https://www.amazon.com/',
              },
              redirect: 'follow',
            });
            if (res.ok) {
              page = await res.text();
              fetchedUrl = url;
              break fetchLoop;
            }
            if (res.status === 404 || res.status === 410) break; // producto inválido, no reintentar esta combo
            console.error(`amazon-lookup: ${url} (${ua}) -> HTTP ${res.status}`);
          } catch (err) {
            console.error('amazon-lookup fetch fail:', url, err);
          }
        }
      }
      await sleep(500);
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
        subtitle: extractSubtitle(page, title),
        features: extractAboutThisItem(page),
        price,
        image,
        images: extractGalleryImages(page),
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