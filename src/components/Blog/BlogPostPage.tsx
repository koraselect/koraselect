import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/product';
import { BlogBlock, BlogPost } from '../../types/blog';
import { getAffiliateUrl, AMAZON_CTA_TEXT, AMAZON_REL } from '../../utils/affiliate';

interface BlogPostPageProps {
  slug: string;
  posts: BlogPost[];
  affiliateTag: string;
  onBack: () => void;
  onTrackClick: (product: Product) => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

const ProductBlock: React.FC<{ block: Extract<BlogBlock, { type: 'product' }>; tag: string; onTrackClick: (p: Product) => void }> = ({ block, tag, onTrackClick }) => {
  const fakeProduct: Product = {
    id: block.amazonUrl,
    title: block.title,
    subtitle: block.excerpt,
    category: 'all',
    price: 0,
    rating: block.rating ?? 0,
    reviewsCount: block.reviewsCount ?? 0,
    amazonUrl: block.amazonUrl,
    mainImage: block.image,
    highlights: [],
    description: block.excerpt
  };

  return (
    <div className="blog-product-card">
      <div className="blog-product-media">
        <img src={block.image} alt={block.title} loading="lazy" />
      </div>
      <div className="blog-product-info">
        <span className="blog-product-tag">Recomendado en esta guía</span>
        <h4 className="font-heading">{block.title}</h4>
        <p>{block.excerpt}</p>
        {block.rating && (
          <div className="blog-product-rating">
            <span className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(block.rating!) ? '#f5a742' : '#ddd'} stroke="#f5a742" />
              ))}
            </span>
            {block.reviewsCount && <span className="reviews-count">{block.reviewsCount.toLocaleString('es-MX')} reviews</span>}
          </div>
        )}
        <a
          className="btn-amazon blog-product-cta"
          href={getAffiliateUrl(block.amazonUrl, tag)}
          target="_blank"
          rel={AMAZON_REL}
          onClick={() => onTrackClick(fakeProduct)}
        >
          <span>{AMAZON_CTA_TEXT}</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, posts, affiliateTag, onBack, onTrackClick }) => {
  const post = posts.find((p) => p.slug === slug) || null;

  useEffect(() => {
    document.title = post ? `${post.title} · KORASELECT` : 'Artículo no encontrado · KORASELECT';
    return () => {
      document.title = 'KORASELECT';
    };
  }, [post]);

  if (!post) {
    return (
      <main className="blog-post main-content">
        <div className="container blog-post-container">
          <section className="blog-not-found">
            <h1 className="font-heading">Artículo no encontrado</h1>
            <p>Lo sentimos, no pudimos encontrar esta entrada del blog.</p>
            <button className="btn-amazon" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Volver al blog</span>
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="blog-post main-content">
      <div className="container blog-post-container">
        {/* Back Link */}
        <button className="blog-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Volver al blog</span>
        </button>

        {/* Post Header */}
        <header className="blog-post-header">
          <span className="blog-post-category">{post.category}</span>
          <h1 className="font-heading">{post.title}</h1>
          <div className="blog-post-meta">
            <span><Calendar size={14} /> {formatDate(post.date)}</span>
            <span><Clock size={14} /> {post.readTime} de lectura</span>
          </div>
        </header>

        {/* Cover Image */}
        <figure className="blog-post-cover">
          <img src={post.coverImage} alt={post.title} />
        </figure>

        {/* Mandatory Affiliate Disclosure */}
        <div className="blog-affiliate-notice">
          <ShieldCheck size={17} />
          <span>
            <strong>Aviso de Afiliación:</strong> Este artículo contiene enlaces de afiliados. Como Afiliado de Amazon, KORASELECT obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. Esto no representa ningún costo adicional para ti.
          </span>
        </div>

        {/* Body Blocks */}
        <div className="blog-post-body">
          {post.body.map((block, i) => {
            switch (block.type) {
              case 'h2':
                return <h2 key={i} className="font-heading" style={{ textAlign: block.align || 'left' }} dangerouslySetInnerHTML={{ __html: block.text }} />;
              case 'p':
                return <p key={i} style={{ textAlign: block.align || 'left' }} dangerouslySetInnerHTML={{ __html: block.text }} />;
              case 'list':
                return (
                  <ul key={i} style={{ textAlign: block.align || 'left' }}>
                    {block.items.map((item, j) => (
                      <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                );
              case 'quote':
                return (
                  <blockquote key={i} style={{ textAlign: block.align || 'left' }}>
                    <span className="quote-mark">“</span>
                    <span dangerouslySetInnerHTML={{ __html: block.text }} />
                  </blockquote>
                );
              case 'product':
                return (
                  <ProductBlock
                    key={i}
                    block={block}
                    tag={affiliateTag}
                    onTrackClick={onTrackClick}
                  />
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Post Footer */}
        <footer className="blog-post-footer">
          <p className="blog-price-disclaimer">
            El precio y la disponibilidad de los productos pueden variar en Amazon. Si usas los enlaces de esta guía podríamos recibir una comisión sin costo adicional para ti.
          </p>
          <button className="btn-amazon" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Volver al blog</span>
          </button>
        </footer>
      </div>

      <style>{`
        .blog-post {
          flex: 1;
          padding: 36px 0 64px;
        }

        .blog-post-container {
          max-width: 780px;
        }

        .blog-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0 0 20px;
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .blog-back-btn:hover {
          color: var(--text-dark);
        }

        .blog-post-header {
          margin-bottom: 22px;
        }

        .blog-post-category {
          display: inline-block;
          background: #fff3e0;
          color: #e65100;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: var(--border-radius-pill);
          margin-bottom: 12px;
        }

        .blog-post-header h1 {
          font-size: 2rem;
          line-height: 1.25;
          margin: 0 0 12px;
        }

        .blog-post-meta {
          display: flex;
          gap: 18px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .blog-post-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .blog-post-cover {
          margin: 0 0 24px;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .blog-post-cover img {
          width: 100%;
          height: auto;
          display: block;
        }

        .blog-affiliate-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f9f9f9;
          border-left: 4px solid #111;
          padding: 12px 16px;
          margin-bottom: 28px;
          font-size: 0.9rem;
          color: #444;
          line-height: 1.5;
        }

        .blog-affiliate-notice svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .blog-post-body {
          font-size: 1.02rem;
          line-height: 1.7;
          color: var(--text-dark);
        }

        .blog-post-body h2 {
          font-size: 1.45rem;
          margin: 32px 0 12px;
        }

        .blog-post-body p {
          margin: 0 0 16px;
        }

        .blog-post-body ul {
          margin: 0 0 18px;
          padding-left: 22px;
        }

        .blog-post-body li {
          margin-bottom: 8px;
        }

        .blog-post-body blockquote {
          position: relative;
          margin: 24px 0;
          padding: 18px 22px 18px 48px;
          background: var(--bg-card);
          border-left: 4px solid var(--text-dark);
          border-radius: 0 var(--border-radius-m) var(--border-radius-m) 0;
          font-size: 1rem;
          color: var(--text-dark);
        }

        .blog-post-body .quote-mark {
          position: absolute;
          left: 14px;
          top: 8px;
          font-size: 2.4rem;
          line-height: 1;
          color: var(--text-muted);
        }

        .blog-product-card {
          display: flex;
          gap: 18px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 18px;
          margin: 22px 0;
          align-items: center;
        }

        .blog-product-media {
          flex: 0 0 150px;
          width: 150px;
          height: 130px;
          border-radius: var(--border-radius-m);
          overflow: hidden;
          background: #fff;
        }

        .blog-product-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-product-info h4 {
          font-size: 1.08rem;
          margin: 4px 0 8px;
        }

        .blog-product-info p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 10px;
        }

        .blog-product-tag {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-amazon);
        }

        .blog-product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .blog-product-rating .stars {
          display: flex;
          gap: 1px;
        }

        .blog-product-rating .reviews-count {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .blog-product-cta {
          padding: 10px 16px;
          font-size: 0.82rem;
          white-space: normal;
          text-align: center;
        }

        .blog-post-footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .blog-price-disclaimer {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .blog-not-found {
          text-align: center;
          padding: 80px 20px;
        }

        .blog-not-found h1 {
          font-size: 1.8rem;
        }

        @media (max-width: 640px) {
          .blog-post-header h1 {
            font-size: 1.55rem;
          }
          .blog-product-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .blog-product-media {
            flex: none;
            width: 100%;
            height: 180px;
          }
        }
      `}</style>
    </main>
  );
};