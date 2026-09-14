export interface ColorOption {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface ProductHighlight {
  icon?: string;
  title: string;
  description: string;
}

export interface Hotspot {
  id: string;
  xPercent: number; // 0-100 position
  yPercent: number; // 0-100 position
  title: string;
  description: string;
}

export interface ProductVideo {
  url: string;
  title?: string;
  thumbnail?: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  amazonUrl: string;
  asin?: string;
  mainImage: string;
  galleryImages?: string[];
  videos?: ProductVideo[];
  colors?: ColorOption[];
  dimensions?: string;
  capacity?: string;
  highlights: ProductHighlight[];
  hotspots?: Hotspot[];
  badge?: string; // e.g. "A+ Premium", "Best Seller", "Familia Must-Have"
  description: string;
  aPlusContent?: {
    heroTitle: string;
    heroSubtitle: string;
    bannerImage: string;
    features: { title: string; desc: string; icon: string }[];
    steps?: { step: number; title: string; desc: string; image?: string }[];
    whyChoose?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AffiliateConfig {
  tag: string;
  currency: string;
  siteName: string;
  siteTagline: string;
  defaultCommissionRate: number;
  customBannerText?: string;
  logoUrl?: string;
}
