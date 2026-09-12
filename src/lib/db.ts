import { supabase } from './supabase';
import { Product, AffiliateConfig } from '../types/product';
import { BlogPost } from '../types/blog';

// ---------- Productos ----------

interface ProductRow {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  price: number;
  original_price: number | null;
  rating: number | null;
  reviews_count: number | null;
  amazon_url: string;
  asin: string | null;
  main_image: string | null;
  badge: string | null;
  dimensions: string | null;
  capacity: string | null;
  gallery_images: unknown;
  colors: unknown;
  highlights: unknown;
  hotspots: unknown;
  description: string | null;
  a_plus_content: unknown;
}

const rowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle || '',
  category: row.category,
  price: row.price,
  originalPrice: row.original_price ?? undefined,
  rating: row.rating ?? 4.9,
  reviewsCount: row.reviews_count ?? 0,
  amazonUrl: row.amazon_url,
  asin: row.asin || undefined,
  mainImage: row.main_image || '',
  galleryImages: Array.isArray(row.gallery_images) ? (row.gallery_images as string[]) : undefined,
  colors: Array.isArray(row.colors) ? (row.colors as Product['colors']) : undefined,
  highlights: Array.isArray(row.highlights) ? (row.highlights as Product['highlights']) : [],
  hotspots: Array.isArray(row.hotspots) ? (row.hotspots as Product['hotspots']) : undefined,
  badge: row.badge || undefined,
  dimensions: row.dimensions || undefined,
  capacity: row.capacity || undefined,
  description: row.description || '',
  aPlusContent: row.a_plus_content ? (row.a_plus_content as Product['aPlusContent']) : undefined
});

const productToRow = (p: Product): Record<string, unknown> => ({
  id: p.id,
  title: p.title,
  subtitle: p.subtitle || null,
  category: p.category,
  price: p.price,
  original_price: p.originalPrice ?? null,
  rating: p.rating ?? 4.9,
  reviews_count: p.reviewsCount ?? 0,
  amazon_url: p.amazonUrl,
  asin: p.asin || null,
  main_image: p.mainImage || null,
  badge: p.badge || null,
  dimensions: p.dimensions || null,
  capacity: p.capacity || null,
  gallery_images: p.galleryImages && p.galleryImages.length ? p.galleryImages : [],
  colors: p.colors && p.colors.length ? p.colors : [],
  highlights: p.highlights && p.highlights.length ? p.highlights : [],
  hotspots: p.hotspots && p.hotspots.length ? p.hotspots : [],
  description: p.description || '',
  a_plus_content: p.aPlusContent || null
});

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToProduct);
};

export const upsertProduct = async (product: Product): Promise<void> => {
  const { error } = await supabase.rpc('upsert_product', {
    p_product: productToRow(product)
  });
  if (error) throw error;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_product', { p_id: id });
  if (error) throw error;
};

// ---------- Configuración de afiliado ----------

const AFFILIATE_CONFIG_KEY = 'affiliate_config';

export const fetchAffiliateConfig = async (): Promise<AffiliateConfig | null> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', AFFILIATE_CONFIG_KEY)
    .maybeSingle();
  if (error) throw error;
  return data ? (data.value as AffiliateConfig) : null;
};

export const saveAffiliateConfig = async (
  config: AffiliateConfig
): Promise<void> => {
  const { error } = await supabase.rpc('update_setting', {
    p_key: AFFILIATE_CONFIG_KEY,
    p_value: config
  });
  if (error) throw error;
};

// ---------- Blog ----------

interface BlogPostRow {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  date: string | null;
  read_time: string | null;
  cover_image: string | null;
  body: unknown;
}

const rowToBlogPost = (row: BlogPostRow): BlogPost => ({
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt || '',
  category: row.category || 'General',
  date: row.date || new Date().toISOString().slice(0, 10),
  readTime: row.read_time || '5 min',
  coverImage: row.cover_image || '',
  body: Array.isArray(row.body) ? (row.body as BlogPost['body']) : []
});

const blogPostToRow = (post: BlogPost): Record<string, unknown> => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt || null,
  category: post.category || 'General',
  date: post.date,
  read_time: post.readTime,
  cover_image: post.coverImage || null,
  body: post.body || []
});

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToBlogPost);
};

export const upsertBlogPost = async (post: BlogPost): Promise<void> => {
  const { error } = await supabase.rpc('upsert_blog_post', {
    p_post: blogPostToRow(post)
  });
  if (error) throw error;
};

export const deleteBlogPost = async (slug: string): Promise<void> => {
  const { error } = await supabase.rpc('delete_blog_post', { p_slug: slug });
  if (error) throw error;
};

// ---------- Admin ----------

export const verifyAdmin = async (
  username: string,
  password: string
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('verify_admin', {
    p_username: username.trim(),
    p_password: password
  });
  if (error) return false;
  return Array.isArray(data) ? data.length > 0 : !!data;
};