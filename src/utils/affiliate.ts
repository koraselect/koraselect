export const AMAZON_CTA_TEXT = 'Ver precio';

export const AMAZON_REL = 'sponsored nofollow';

// Los enlaces de los productos son los links de afiliado completos del usuario
// (ej: amzn.to). Se usan tal cual, sin alterar nada, para no perder la comisión.
export const getAffiliateUrl = (baseUrl: string, _tag: string): string => baseUrl;