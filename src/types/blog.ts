export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface RichBlockBase {
  align?: TextAlign;
}

// El campo `text`/`items` puede contener HTML inline seguro
// (<strong>, <em>, <u>) producido por el editor rico o la IA.
export type BlogBlock =
  | { type: 'h2'; text: string; align?: TextAlign }
  | { type: 'p'; text: string; align?: TextAlign }
  | { type: 'list'; items: string[]; align?: TextAlign }
  | { type: 'quote'; text: string; align?: TextAlign }
  | {
      type: 'product';
      title: string;
      image: string;
      excerpt: string;
      amazonUrl: string;
      rating?: number;
      reviewsCount?: number;
    };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  body: BlogBlock[];
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
}