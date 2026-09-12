import React, { useEffect } from 'react';
import { ArrowRight, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { BlogPost } from '../../types/blog';

interface BlogIndexPageProps {
  posts: BlogPost[];
  onOpenPost: (slug: string) => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const BlogIndexPage: React.FC<BlogIndexPageProps> = ({ posts, onOpenPost }) => {
  const sortedPosts = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

  useEffect(() => {
    document.title = 'Blog & Guías de Compra · KORASELECT';
    return () => {
      document.title = 'KORASELECT';
    };
  }, []);

  return (
    <main className="blog-index main-content">
      <div className="container blog-index-container">
        {/* Blog Header */}
        <section className="blog-hero">
          <span className="blog-kicker">Blog & Guías de Compra</span>
          <h1 className="font-heading">Reseñas y guías para elegir mejor</h1>
          <p className="blog-hero-sub">
            Investigamos, seleccionamos y probamos productos disponibles en Amazon para que ahorres tiempo y tomes decisiones informadas.
          </p>

          <div className="blog-disclosure">
            <ShieldCheck size={16} />
            <span>
              Aviso de Afiliación: Este blog contiene enlaces de afiliados. Como Afiliado de Amazon, KORASELECT obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. Esto no representa ningún costo adicional para ti.
            </span>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="blog-posts-grid">
          {sortedPosts.length === 0 ? (
            <div className="blog-empty-public">
              <ShieldCheck size={28} />
              <h3 className="font-heading">Pronto habrá contenido</h3>
              <p>Estamos preparando nuevas reseñas y guías de compra. ¡Vuelve pronto!</p>
            </div>
          ) : (
            sortedPosts.map((post) => (
            <article
              key={post.slug}
              className="blog-post-card"
              onClick={() => onOpenPost(post.slug)}
            >
              <div className="blog-card-media">
                <img src={post.coverImage} alt={post.title} loading="lazy" />
                <span className="blog-card-category">{post.category}</span>
              </div>

              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="blog-meta-item"><Calendar size={13} /> {formatDate(post.date)}</span>
                  <span className="blog-meta-item"><Clock size={13} /> {post.readTime} de lectura</span>
                </div>

                <h3 className="font-heading">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>

                <button
                  className="blog-card-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPost(post.slug);
                  }}
                >
                  Leer reseña / guía
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
            ))
          )}
        </section>
      </div>

      <style>{`
        .blog-index {
          flex: 1;
          padding: 48px 0 64px;
        }

        .blog-index-container {
          max-width: 960px;
        }

        .blog-hero {
          margin-bottom: 40px;
        }

        .blog-kicker {
          display: inline-block;
          background: #fff3e0;
          color: #e65100;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: var(--border-radius-pill);
          margin-bottom: 14px;
        }

        .blog-hero h1 {
          font-size: 2.2rem;
          margin: 0 0 10px;
        }

        .blog-hero-sub {
          color: var(--text-muted);
          font-size: 1.02rem;
          max-width: 640px;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .blog-disclosure {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f9f9f9;
          border-left: 4px solid #111;
          padding: 12px 16px;
          font-size: 0.9rem;
          color: #444;
          line-height: 1.5;
          max-width: 720px;
        }

        .blog-disclosure svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .blog-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .blog-post-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .blog-post-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--text-dark);
        }

        .blog-card-media {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
        }

        .blog-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .blog-post-card:hover .blog-card-media img {
          transform: scale(1.05);
        }

        .blog-card-category {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(30, 30, 30, 0.82);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: var(--border-radius-pill);
          backdrop-filter: blur(4px);
        }

        .blog-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .blog-card-meta {
          display: flex;
          gap: 14px;
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .blog-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .blog-card-body h3 {
          font-size: 1.18rem;
          line-height: 1.3;
          margin: 0;
        }

        .blog-card-excerpt {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0;
          flex: 1;
        }

        .blog-card-link {
          display: flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          background: none;
          border: none;
          padding: 0;
          color: var(--text-dark);
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .blog-card-link:hover {
          border-bottom-color: var(--text-dark);
        }

        .blog-empty-public {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--text-muted);
          padding: 60px 24px;
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-lg);
          background-color: var(--bg-card);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .blog-empty-public h3 {
          font-size: 1.2rem;
          color: var(--text-dark);
          margin: 0;
        }

        .blog-empty-public p {
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .blog-hero h1 {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </main>
  );
};