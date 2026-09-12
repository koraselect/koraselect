export const AMAZON_CTA_TEXT = 'Ver precio';

export const AMAZON_REL = 'sponsored nofollow';

export const getAffiliateUrl = (baseUrl: string, tag: string): string => {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('tag', tag);
    return url.toString();
  } catch {
    return `${baseUrl}?tag=${tag}`;
  }
};