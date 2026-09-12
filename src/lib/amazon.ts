import { supabase } from './supabase';

export interface AmazonLookupResult {
  asin: string;
  url: string;
  title: string;
  price: number | null;
  image: string;
  images: string[];
  rating: number | null;
  reviewsCount: number | null;
}

/**
 * Consulta la Edge Function `amazon-lookup` para extraer los datos
 * públicos de un producto de Amazon a partir de su URL.
 */
export const lookupAmazonProduct = async (url: string): Promise<AmazonLookupResult> => {
  const { data, error } = await supabase.functions.invoke('amazon-lookup', {
    body: { url }
  });

  if (error) {
    const message = (data as { error?: string } | null)?.error || error.message || 'Error de conexión';
    throw new Error(message);
  }

  return data as AmazonLookupResult;
};