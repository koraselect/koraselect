import { FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AmazonLookupResult {
  asin: string;
  url: string;
  title: string;
  subtitle?: string;
  price: number | null;
  image: string;
  images: string[];
  rating: number | null;
  reviewsCount: number | null;
}

const readErrorBody = async (response: Response): Promise<string> => {
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.error === 'string') return parsed.error;
    } catch {
      // cuerpo no JSON
    }
    return text.trim() || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

/**
 * Consulta la Edge Function `amazon-lookup` para extraer los datos
 * públicos de un producto de Amazon a partir de su URL.
 */
export const lookupAmazonProduct = async (url: string): Promise<AmazonLookupResult> => {
  const { data, error } = await supabase.functions.invoke('amazon-lookup', {
    body: { url }
  });

  if (error) {
    if (error instanceof FunctionsHttpError && error.context) {
      throw new Error(await readErrorBody(error.context as Response));
    }
    if (error instanceof FunctionsRelayError && error.context) {
      throw new Error(await readErrorBody(error.context as Response));
    }
    throw new Error(error.message || 'Error de conexión con la función de Amazon.');
  }

  return data as AmazonLookupResult;
};