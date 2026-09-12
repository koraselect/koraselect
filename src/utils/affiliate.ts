export const AMAZON_CTA_TEXT = 'Ver precio';

export const AMAZON_REL = 'sponsored nofollow';

export const getAffiliateUrl = (baseUrl: string, tag: string): string => {
  try {
    const url = new URL(baseUrl);
    const host = url.hostname.replace(/^www\./i, '');
    // Los enlaces cortos de Amazon (amzn.to) ya traen el tag incrustado.
    // Si la URL ya tiene parámetro "tag", se respeta tal cual para no
    // duplicar tags y arriesgar la atribución de la comisión.
    const hasOwnTag = /^amzn\.to$/i.test(host) || url.searchParams.has('tag');
    if (!hasOwnTag) {
      url.searchParams.set('tag', tag);
    }
    return url.toString();
  } catch {
    return baseUrl.includes('tag=') ? baseUrl : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}tag=${tag}`;
  }
};