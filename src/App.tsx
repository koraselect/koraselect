import React, { useState, useEffect, useRef } from 'react';
import { Product, AffiliateConfig } from './types/product';
import { BlogPost } from './types/blog';
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_AFFILIATE_CONFIG } from './data/initialData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { GridProductCard } from './components/GridProductCard';
import { AplusProductCard } from './components/AplusProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CreateListModal } from './components/CreateListModal';
import { AffiliateSettingsModal } from './components/AffiliateSettingsModal';
import { Footer } from './components/Footer';
import { BlogIndexPage } from './components/Blog/BlogIndexPage';
import { BlogPostPage } from './components/Blog/BlogPostPage';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Layers, Sparkles, PlusCircle, ArrowLeft, ArrowRight, Search, X } from 'lucide-react';

// Data layer (Supabase)
import {
  fetchProducts,
  upsertProduct,
  deleteProduct,
  fetchAffiliateConfig,
  saveAffiliateConfig,
  fetchBlogPosts,
  upsertBlogPost,
  deleteBlogPost
} from './lib/db';
import { trackProductClick, trackPageView } from './lib/gtag';

export const App: React.FC = () => {
  // 1. Affiliate Configuration State (desde Supabase)
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(INITIAL_AFFILIATE_CONFIG);

  const applyAffiliateConfig = (next: AffiliateConfig) => {
    setAffiliateConfig(next);
    saveAffiliateConfig(next).catch((e) => console.error('Error guardando config:', e));
  };

  // 2. Products Catalog State (desde Supabase)
  const [products, setProducts] = useState<Product[]>([]);

  // 3. Blog Posts State (desde Supabase)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // 4. Loading State inicial
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [prods, config, posts]: [Product[], AffiliateConfig | null, BlogPost[]] = await Promise.all([
          fetchProducts(),
          fetchAffiliateConfig(),
          fetchBlogPosts()
        ]);
        if (!active) return;
        setProducts(prods);
        if (config) setAffiliateConfig(config);
        setBlogPosts(posts);
        setIsLoading(false);
      } catch (e) {
        if (!active) return;
        console.error('Error cargando datos iniciales:', e);
        setProducts(INITIAL_PRODUCTS);
        setLoadError('No se pudieron cargar los datos desde Supabase. Revisa las variables de entorno.');
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 5. Routing & View State (Store / Market / Admin / Blog / BlogPost)
  type Route =
    | { name: 'store' }
    | { name: 'market' }
    | { name: 'admin' }
    | { name: 'blog' }
    | { name: 'blogPost'; slug: string };

  const getPathnameRoute = (): Route => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin/')) return { name: 'admin' };
    if (path === '/market' || path.startsWith('/market/')) return { name: 'market' };
    const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
    if (blogMatch) return { name: 'blogPost', slug: blogMatch[1] };
    if (path.startsWith('/blog')) return { name: 'blog' };
    return { name: 'store' };
  };

  const parseRoute = (): Route => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash.includes('admin') || search.includes('mode=admin')) return { name: 'admin' };
    return getPathnameRoute();
  };

  const [route, setRoute] = useState<Route>(parseRoute);

  const navigateTo = (path: string) => {
    const clean = path === '#admin' || path === '#/admin' ? '/admin' : (path.startsWith('/') ? path : `/${path}`);
    window.history.pushState({}, '', clean);
    setRoute(getPathnameRoute());
    trackPageView();
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (window.location.hash.toLowerCase().includes('admin')) {
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  useEffect(() => {
    const handleUrlChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // 6. Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('luxe_admin_auth') === 'true';
  });

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('luxe_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('luxe_admin_auth');
    navigateTo('/');
  };

  // 7. Store UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'collage' | 'grid' | 'aplus'>('collage');

  // Modals
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // 8. Affiliate Click -> GA4 select_item (las métricas de ingresos se consultan en Amazon)
  const handleTrackClick = (product: Product) => {
    trackProductClick(product.title, product.category, product.amazonUrl);
  };

  // 9. Product CRUD Handlers (Supabase)
  const handleAddProduct = async (newProd: Product) => {
    try {
      await upsertProduct(newProd);
      setProducts((prev) => [newProd, ...prev]);
    } catch (e) {
      console.error('Error creando producto:', e);
      alert('No se pudo crear el producto. Intenta nuevamente.');
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      await upsertProduct(updatedProd);
      setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    } catch (e) {
      console.error('Error actualizando producto:', e);
      alert('No se pudo actualizar el producto. Intenta nuevamente.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Error eliminando producto:', e);
      alert('No se pudo eliminar el producto. Intenta nuevamente.');
    }
  };

  const handleResetDefaultCatalog = () => {
    alert('El catálogo de ejemplo ya no se usa. Los productos ahora se gestionan desde la tabla `products` en Supabase.');
  };

  // 10. Blog CRUD Handlers (Supabase)
  const handleSaveBlogPost = async (post: BlogPost) => {
    try {
      await upsertBlogPost(post);
      setBlogPosts((prev) => {
        const exists = prev.some((p) => p.slug === post.slug);
        return exists
          ? prev.map((p) => (p.slug === post.slug ? post : p))
          : [post, ...prev];
      });
    } catch (e) {
      console.error('Error guardando post:', e);
      alert('No se pudo guardar la entrada. Intenta nuevamente.');
    }
  };

  const handleDeleteBlogPost = async (slug: string) => {
    try {
      await deleteBlogPost(slug);
      setBlogPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (e) {
      console.error('Error eliminando post:', e);
      alert('No se pudo eliminar la entrada. Intenta nuevamente.');
    }
  };

  // 11. Enhanced Filter Products (Title, Subtitle, Description, ASIN, Badge, Category Name)
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const catName = CATEGORIES.find(c => c.id === prod.category)?.name || '';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      prod.title.toLowerCase().includes(q) ||
      prod.subtitle.toLowerCase().includes(q) ||
      prod.description.toLowerCase().includes(q) ||
      (prod.asin && prod.asin.toLowerCase().includes(q)) ||
      (prod.badge && prod.badge.toLowerCase().includes(q)) ||
      (prod.dimensions && prod.dimensions.toLowerCase().includes(q)) ||
      catName.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // En el home se muestran solo unas filas de productos; el botón lleva al Market completo.
  const HOME_PRODUCT_LIMIT = 8;

  const cardPropsFor = (prod: Product) => ({
    key: prod.id,
    product: prod,
    affiliateTag: affiliateConfig.tag,
    onOpenDetailModal: setActiveDetailProduct,
    onTrackClick: handleTrackClick
  });

  const productNode = (prod: Product) => {
    if (viewMode === 'grid') return <GridProductCard {...cardPropsFor(prod)} />;
    if (viewMode === 'aplus') return <AplusProductCard {...cardPropsFor(prod)} />;
    return <ProductCard {...cardPropsFor(prod)} />;
  };

  const catalogSection = (items: Product[], viewAll?: boolean) => (
    <main id="catalog-section" className="main-content">
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalProductsCount={filteredProducts.length}
      />

      <div className="container">
        {items.length === 0 ? (
          <div className="empty-catalog-box">
            <Sparkles size={36} className="empty-icon" />
            <h3 className="font-heading text-xl">No hay productos en esta selección</h3>
            {isAdminAuthenticated ? (
              <>
                <p>Agrega y gestiona productos del catálogo desde tu Panel Administrativo.</p>
                <button
                  className="btn-amazon mt-4"
                  onClick={() => navigateTo('/admin')}
                >
                  <PlusCircle size={18} />
                  <span>Ir al Dashboard Admin para Subir Productos</span>
                </button>
              </>
            ) : (
              <p>Vuelve a intentarlo en unos momentos o explora otras colecciones.</p>
            )}
          </div>
        ) : (
          <div className={`catalog-layout layout-${viewMode}`}>
            {items.map((prod) => productNode(prod))}
          </div>
        )}

        {viewAll && (
          <div className="view-all-row">
            <button className="btn-amazon view-all-btn" onClick={() => navigateTo('/market')}>
              <span>Ver todo el catálogo en el Market</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );

  const latestPosts = [...blogPosts]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  // --- Carrusel en movimiento de productos (home) ---
  const [carouselRunning, setCarouselRunning] = useState<boolean>(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselProducts = products.length > 0 ? [...products, ...products] : [];

  useEffect(() => {
    if (!carouselRunning) return;
    const el = carouselRef.current;
    if (!el || carouselProducts.length === 0) return;
    const id = window.setInterval(() => {
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half - 2) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += 0.9;
      }
    }, 24);
    return () => window.clearInterval(id);
  }, [carouselRunning, carouselProducts.length]);

  // RENDER LOADING
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Cargando tienda…</p>
        <style>{`
          .app-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background-color: var(--bg-main);
            color: var(--text-muted);
          }
          .spinner {
            width: 42px;
            height: 42px;
            border: 4px solid var(--border-color);
            border-top-color: var(--text-dark);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // RENDER ADMIN VIEW
  if (route.name === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onReturnToStore={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminDashboard
        products={products}
        categories={CATEGORIES}
        affiliateConfig={affiliateConfig}
        blogPosts={blogPosts}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddProduct={handleAddProduct}
        onResetDefaultCatalog={handleResetDefaultCatalog}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onSaveBlogPost={handleSaveBlogPost}
        onDeleteBlogPost={handleDeleteBlogPost}
        onLogout={handleAdminLogout}
        onReturnToStore={() => navigateTo('/')}
      />
    );
  }

  // RENDER BLOG / BLOG POST VIEWS
  if (route.name === 'blog' || route.name === 'blogPost') {
    return (
      <div className="app-main">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          affiliateConfig={affiliateConfig}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAdmin={() => navigateTo('/admin')}
          onLogout={handleAdminLogout}
          onReturnToStore={() => navigateTo('/')}
          showSearch={false}
          activeRoute="blog"
          onNavigateHome={() => navigateTo('/')}
          onNavigateBlog={() => navigateTo('/blog')}
        />

        {route.name === 'blogPost'
          ? (
            <BlogPostPage
              slug={route.slug}
              posts={blogPosts}
              affiliateTag={affiliateConfig.tag}
              onBack={() => navigateTo('/blog')}
              onTrackClick={handleTrackClick}
            />
          )
          : (
            <>
              <BlogIndexPage
                posts={blogPosts}
                onOpenPost={(slug) => navigateTo(`/blog/${slug}`)}
              />
              <Footer onNavigate={navigateTo} />
            </>
          )}

        {isSettingsModalOpen && (
          <AffiliateSettingsModal
            config={affiliateConfig}
            onSaveConfig={applyAffiliateConfig}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // RENDER MARKET (todo el catálogo publicado, estilo marketplace)
  if (route.name === 'market') {
    return (
      <div className="app-main">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          affiliateConfig={affiliateConfig}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAdmin={() => navigateTo('/admin')}
          onLogout={handleAdminLogout}
          onReturnToStore={() => navigateTo('/')}
          activeRoute="store"
          showSearch={false}
          onNavigateHome={() => navigateTo('/')}
          onNavigateBlog={() => navigateTo('/blog')}
        />

        {/* Barra de búsqueda estilo Gemini, centrada sobre el selector de categorías */}
        <div className="market-search-wrap">
          <div className="gemini-searchbar">
            <Search size={20} className="gemini-search-icon" />
            <input
              type="text"
              placeholder="Busca productos por nombre, ASIN o categoría en el Market…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="gemini-clear" onClick={() => setSearchQuery('')} title="Limpiar búsqueda">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {catalogSection(filteredProducts, false)}

        <Footer onNavigate={navigateTo} />

        <ProductDetailModal
          product={activeDetailProduct}
          affiliateTag={affiliateConfig.tag}
          onClose={() => setActiveDetailProduct(null)}
          onTrackClick={handleTrackClick}
        />

        {isSettingsModalOpen && (
          <AffiliateSettingsModal
            config={affiliateConfig}
            onSaveConfig={applyAffiliateConfig}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        )}
        {loadError && (
          <div className="toast-error">
            {loadError}
            <style>{`
              .toast-error {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #ffebee;
                color: #c62828;
                padding: 12px 20px;
                border-radius: var(--border-radius-pill);
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: var(--shadow-md);
                z-index: 1200;
                max-width: 90vw;
                text-align: center;
              }
            `}</style>
          </div>
        )}

        <style>{`
          .app-main {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .main-content {
            flex: 1;
          }

          /* ---- Barra de búsqueda estilo Gemini ---- */
          .market-search-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 36px 0 24px;
          }

          .gemini-searchbar {
            width: 75%;
            max-width: 820px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-pill);
            padding: 15px 24px;
            box-shadow: var(--shadow-md);
            transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          }

          .gemini-searchbar:focus-within {
            border-color: #c29b68;
            box-shadow: 0 0 0 4px rgba(194, 155, 104, 0.15), var(--shadow-md);
          }

          .gemini-search-icon {
            color: var(--text-muted);
            flex-shrink: 0;
          }

          .gemini-searchbar input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            font-family: var(--font-body);
            font-size: 1.02rem;
            color: var(--text-dark);
          }

          .gemini-searchbar input::placeholder {
            color: var(--text-muted);
          }

          .gemini-clear {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }

          .gemini-clear:hover {
            color: var(--text-dark);
          }

          .catalog-layout {
            display: grid;
            gap: 28px;
          }

          .catalog-layout.layout-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 18px;
          }

          .catalog-layout.layout-collage {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          }

          .catalog-layout.layout-aplus {
            grid-template-columns: 1fr;
            max-width: 980px;
            margin: 0 auto;
            gap: 40px;
          }

          .empty-catalog-box {
            text-align: center;
            padding: 80px 20px;
            background-color: var(--bg-card);
            border-radius: var(--border-radius-lg);
            border: 1px dashed var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: var(--text-muted);
          }

          .empty-icon {
            color: #c29b68;
          }

          .mt-4 {
            margin-top: 16px;
          }

          @media (max-width: 640px) {
            .gemini-searchbar {
              width: 100%;
              padding: 12px 18px;
            }
          }
        `}</style>
      </div>
    );
  }

  // RENDER PUBLIC STORE VIEW (home: últimos posts + filas destacadas)
  return (
    <div className="app-main">
      {/* Navbar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        affiliateConfig={affiliateConfig}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdmin={() => navigateTo('/admin')}
        onLogout={handleAdminLogout}
        onReturnToStore={() => navigateTo('/')}
        activeRoute="store"
        onNavigateHome={() => navigateTo('/')}
        onNavigateBlog={() => navigateTo('/blog')}
      />

      {/* Hero Banner */}
      <HeroBanner
        customBannerText={affiliateConfig.customBannerText}
        onExploreClick={scrollToCatalog}
      />

      {/* Últimos posts del blog */}
      {latestPosts.length > 0 && (
        <section className="home-blog-section">
          <div className="container">
            <div className="home-section-head">
              <div>
                <span className="blog-kicker">Blog & Guías</span>
                <h2 className="font-heading">Últimas publicaciones</h2>
              </div>
              <button className="home-view-all-link" onClick={() => navigateTo('/blog')}>
                Ver todos
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="home-blog-grid">
              {latestPosts.map((post) => (
                <article
                  key={post.slug}
                  className="home-blog-card"
                  onClick={() => navigateTo(`/blog/${post.slug}`)}
                >
                  <div className="home-blog-media">
                    <img src={post.coverImage} alt={post.title} loading="lazy" />
                    <span className="blog-card-category">{post.category}</span>
                  </div>
                  <div className="home-blog-body">
                    <h3 className="font-heading">{post.title}</h3>
                    <p className="home-blog-excerpt">{post.excerpt}</p>
                    <span className="home-blog-link">
                      Leer reseña / guía
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos destacados (solo unas filas) */}
      <section className="home-products-head">
        <div className="container">
          <span className="blog-kicker">Catálogo</span>
          <h2 className="font-heading">Productos destacados en la tienda</h2>
        </div>
      </section>

      {catalogSection(filteredProducts.slice(0, HOME_PRODUCT_LIMIT), true)}

      {/* Carrusel en movimiento con productos */}
      {carouselProducts.length > 0 && (
        <section className="home-carousel-section">
          <div className="container">
            <div className="home-section-head">
              <div>
                <span className="blog-kicker">En movimiento</span>
                <h2 className="font-heading">Sigue explorando la tienda</h2>
              </div>
              <div className="carousel-controls">
                <button
                  className="carousel-arrow"
                  onClick={() => carouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                  title="Desplazar a la izquierda"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  className="carousel-arrow"
                  onClick={() => carouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                  title="Desplazar a la derecha"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="carousel-viewport"
            ref={carouselRef}
            onMouseEnter={() => setCarouselRunning(false)}
            onMouseLeave={() => setCarouselRunning(true)}
          >
            <div className="carousel-track">
              {carouselProducts.map((prod, idx) => (
                <div className="carousel-cell" key={idx}>
                  <ProductCard {...cardPropsFor(prod)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer with Amazon Affiliate Legal Disclosure & Admin Link */}
      <Footer onNavigate={navigateTo} />

      {/* Modals */}
      <ProductDetailModal
        product={activeDetailProduct}
        affiliateTag={affiliateConfig.tag}
        onClose={() => setActiveDetailProduct(null)}
        onTrackClick={handleTrackClick}
      />

      {isCreateModalOpen && (
        <CreateListModal
          categories={CATEGORIES}
          onClose={() => setIsCreateModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}

      {isSettingsModalOpen && (
        <AffiliateSettingsModal
          config={affiliateConfig}
          onSaveConfig={applyAffiliateConfig}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
      {loadError && (
        <div className="toast-error">
          {loadError}
          <style>{`
            .toast-error {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #ffebee;
              color: #c62828;
              padding: 12px 20px;
              border-radius: var(--border-radius-pill);
              font-size: 0.85rem;
              font-weight: 600;
              box-shadow: var(--shadow-md);
              z-index: 1200;
              max-width: 90vw;
              text-align: center;
            }
          `}</style>
        </div>
      )}

      <style>{`
        .app-main {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
        }

        /* ---- Sección de últimos posts ---- */
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
          margin-bottom: 10px;
        }

        .home-blog-section {
          padding: 48px 0 8px;
        }

        .home-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .home-section-head h2 {
          font-size: 1.7rem;
          margin: 4px 0 0;
        }

        .home-view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          color: var(--text-dark);
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .home-view-all-link:hover {
          border-bottom-color: var(--text-dark);
        }

        .home-blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .home-blog-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .home-blog-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--text-dark);
        }

        .home-blog-media {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
        }

        .home-blog-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .home-blog-card:hover .home-blog-media img {
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

        .home-blog-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .home-blog-body h3 {
          font-size: 1.12rem;
          line-height: 1.3;
          margin: 0;
        }

        .home-blog-excerpt {
          color: var(--text-muted);
          font-size: 0.88rem;
          line-height: 1.55;
          margin: 0;
          flex: 1;
        }

        .home-blog-link {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-dark);
          font-size: 0.88rem;
          font-weight: 700;
        }

        /* ---- Encabezado de destacados ---- */
        .home-products-head {
          padding: 40px 0 0;
        }

        .home-products-head h2 {
          font-size: 1.7rem;
          margin: 4px 0 0;
        }

        /* ---- Botón Ver todo ---- */
        .view-all-row {
          display: flex;
          justify-content: center;
          padding: 34px 0 8px;
        }

        .view-all-btn {
          padding: 13px 28px;
          font-size: 1rem;
        }

        /* ---- Carrusel en movimiento ---- */
        .home-carousel-section {
          padding: 44px 0 64px;
        }

        .carousel-controls {
          display: flex;
          gap: 8px;
        }

        .carousel-arrow {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .carousel-arrow:hover {
          border-color: var(--text-dark);
          background: var(--text-dark);
          color: var(--bg-main);
        }

        .carousel-viewport {
          overflow-x: hidden;
          padding: 12px 0 6px;
        }

        .carousel-track {
          display: flex;
          width: max-content;
          align-items: stretch;
        }

        .carousel-cell {
          width: 300px;
          flex: none;
          margin-right: 20px;
          display: flex;
          align-self: stretch;
        }

        .carousel-cell .product-card {
          width: 100%;
          height: 100%;
        }

        .carousel-cell .card-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .carousel-cell .card-subtitle {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.36em;
        }

        .carousel-cell .card-highlights,
        .carousel-cell .dimensions-info,
        .carousel-cell .card-footer {
          display: none;
        }

        .catalog-layout {
          display: grid;
          gap: 28px;
        }

        .catalog-layout.layout-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }

        .catalog-layout.layout-collage {
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        }

        .catalog-layout.layout-aplus {
          grid-template-columns: 1fr;
          max-width: 980px;
          margin: 0 auto;
          gap: 40px;
        }

        .empty-catalog-box {
          text-align: center;
          padding: 80px 20px;
          background-color: var(--bg-card);
          border-radius: var(--border-radius-lg);
          border: 1px dashed var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .empty-icon {
          color: #c29b68;
        }

        .mt-4 {
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
};

export default App;