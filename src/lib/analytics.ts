import { supabase } from './supabase';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface PageViewRow {
  page: string;
  view_date: string;
  views: number;
}

export interface EventClickRow {
  slug: string | null;
  event: string;
  created_at: string;
}

const ADMIN_AUTH_KEY = 'luxe_admin_auth';
const VIEW_SESSION_PREFIX = 'kora_seen_post_';

export const isAdminSession = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

export const localDateKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const daysAgoKey = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateKey(d);
};

export const trackPostView = async (slug: string): Promise<void> => {
  if (!slug || isAdminSession()) return;
  const page = `/blog/${slug}`;

  try {
    if (window.sessionStorage.getItem(VIEW_SESSION_PREFIX + slug)) return;
    window.sessionStorage.setItem(VIEW_SESSION_PREFIX + slug, '1');
  } catch { /* sessionStorage no disponible: se registra igual */ }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_post', { slug, page_path: page });
    }
  } catch { /* GA4 no cargado: no bloquea el conteo */ }

  try {
    await supabase.rpc('increment_page_view', { p_page: page });
  } catch (e) {
    console.error('Error registrando visita de entrada:', e);
  }
};

export const trackLinkClick = async (params: {
  event?: string;
  slug?: string | null;
  productId?: string | null;
  productAsin?: string | null;
  productTitle?: string | null;
  destinationUrl?: string | null;
}): Promise<void> => {
  if (isAdminSession()) return;
  try {
    await supabase.rpc('log_event', {
      p_event: params.event || 'product_click',
      p_slug: params.slug || null,
      p_product_id: params.productId || null,
      p_product_asin: params.productAsin || null,
      p_product_title: params.productTitle || null,
      p_destination_url: params.destinationUrl || null
    });
  } catch (e) {
    console.error('Error registrando clic de producto:', e);
  }
};

export const fetchPageViews = async (): Promise<PageViewRow[]> => {
  const { data, error } = await supabase
    .from('page_views')
    .select('page, view_date, views');
  if (error) throw error;
  return (data || []) as PageViewRow[];
};

export const fetchEventClicks = async (): Promise<EventClickRow[]> => {
  const { data, error } = await supabase
    .from('event_clicks')
    .select('slug, event, created_at');
  if (error) throw error;
  return (data || []) as EventClickRow[];
};