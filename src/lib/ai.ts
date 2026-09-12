import { supabase } from './supabase';
import { BlogPost, BlogBlock } from '../types/blog';
import { Product } from '../types/product';

export interface AIGenerateResult {
  success: boolean;
  engine: 'groq' | 'gemini';
  blocks?: BlogBlock[];
  error?: string;
}

interface GeneratePostRequest {
  title: string;
  topic?: string;
  blogCategory?: string;
  products: Pick<Product, 'title' | 'asin' | 'amazonUrl' | 'price' | 'rating' | 'reviewsCount' | 'mainImage'>[];
  existingPost?: BlogPost | null;
}

export const generatePostWithAI = async (
  req: GeneratePostRequest
): Promise<AIGenerateResult> => {
  const { data, error } = await supabase.functions.invoke('generate-post', {
    body: {
      title: req.title,
      topic: req.topic || '',
      blogCategory: req.blogCategory || '',
      products: req.products.map((p) => ({
        title: p.title,
        asin: p.asin || '',
        amazonUrl: p.amazonUrl,
        price: p.price,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        mainImage: p.mainImage
      })),
      existingPost: req.existingPost
        ? {
            title: req.existingPost.title,
            excerpt: req.existingPost.excerpt,
            category: req.existingPost.category,
            body: req.existingPost.body
          }
        : null
    }
  });

  if (error) {
    return { success: false, engine: 'groq', error: error.message };
  }

  const result = data as { engine?: string; blocks?: BlogBlock[]; error?: string };
  if (!result.blocks) {
    return {
      success: false,
      engine: (result.engine as 'groq' | 'gemini') || 'groq',
      error: result.error || 'La IA no devolvió bloques de contenido.'
    };
  }

  return {
    success: true,
    engine: (result.engine as 'groq' | 'gemini') || 'groq',
    blocks: result.blocks
  };
};

export interface AIImproveResult {
  success: boolean;
  engine?: 'groq' | 'gemini';
  titles?: string[];
  subtitles?: string[];
  error?: string;
}

export const improveAplusCopy = async (req: {
  product: Pick<Product, 'title' | 'subtitle' | 'category' | 'badge' | 'price'> & { brand?: string };
  currentTitle: string;
  currentSubtitle: string;
}): Promise<AIImproveResult> => {
  const { data, error } = await supabase.functions.invoke('improve-copy', {
    body: {
      product: {
        title: req.product.title,
        subtitle: req.product.subtitle || '',
        category: req.product.category || '',
        badge: req.product.badge || '',
        brand: req.product.brand || '',
        price: req.product.price
      },
      currentTitle: req.currentTitle,
      currentSubtitle: req.currentSubtitle
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as { engine?: string; titles?: string[]; subtitles?: string[]; error?: string };
  if (!result.titles || !result.subtitles) {
    return {
      success: false,
      engine: (result.engine as 'groq' | 'gemini') || 'groq',
      error: result.error || 'La IA no devolvió sugerencias.'
    };
  }

  return {
    success: true,
    engine: (result.engine as 'groq' | 'gemini') || 'groq',
    titles: result.titles,
    subtitles: result.subtitles
  };
};