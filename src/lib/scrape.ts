import { supabase } from './supabase';

export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  content: string;
  image: string;
}

/**
 * Consulta la Edge Function `scrape-url` para extraer el título,
 * descripción, imagen y contenido de una página web a partir de su URL.
 * Usado para alimentar a la IA con el contexto de un artículo de referencia.
 */
export const scrapeUrl = async (url: string): Promise<ScrapeResult> => {
  const { data, error } = await supabase.functions.invoke('scrape-url', {
    body: { url }
  });

  if (error) {
    const message = (data as { error?: string } | null)?.error || error.message || 'Error de conexión';
    throw new Error(message);
  }

  return data as ScrapeResult;
};