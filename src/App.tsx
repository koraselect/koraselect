import React, { useState, useEffect } from 'react';
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
import { Layers, Sparkles, PlusCircle } from 'lucide-react';

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

  // 5. Routing & View State (Store / Admin / Blog / BlogPost)
  type Route =
    | { name: 'store' }
    | { name: 'admin' }
    | { name: 'blog' }
    | { name: 'blogPost'; slug: string };

  const getPathnameRoute = (): Route => {
    const path = window.location.pathname;
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
    if (path.startsWith('#')) {
      window.location.hash = path.slice(1);
      setRoute({ name: 'admin' });
      return;
    }
    const clean = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState({}, '', clean);
    setRoute(getPathnameRoute());
    trackPageView();
    window.scrollTo({ top: 0 });
  };

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
          onOpenAdmin={() => navigateTo('#admin')}
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
            <BlogIndexPage
              posts={blogPosts}
              onOpenPost={(slug) => navigateTo(`/blog/${slug}`)}
            />
          )}

        <Footer onNavigate={navigateTo} />

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

  // RENDER PUBLIC STORE VIEW
  return (
    <div className="app-main">
      {/* Navbar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        affiliateConfig={affiliateConfig}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdmin={() => navigateTo('#admin')}
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

      {/* Catalog & Filter Section */}
      <main id="catalog-section" className="main-content">
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalProductsCount={filteredProducts.length}
        />

        {/* Product Showcase */}
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="empty-catalog-box">
              <Sparkles size={36} className="empty-icon" />
              <h3 className="font-heading text-xl">No hay productos en esta selección</h3>
              {isAdminAuthenticated ? (
                <>
                  <p>Agrega y gestiona productos del catálogo desde tu Panel Administrativo.</p>
                  <button 
                    className="btn-amazon mt-4" 
                    onClick={() => navigateTo('#admin')}
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
              {filteredProducts.map((prod) => {
                const cardProps = {
                  key: prod.id,
                  product: prod,
                  affiliateTag: affiliateConfig.tag,
                  onOpenDetailModal: setActiveDetailProduct,
                  onTrackClick: handleTrackClick
                };

                if (viewMode === 'grid') {
                  return <GridProductCard {...cardProps} />;
                }
                if (viewMode === 'aplus') {
                  return <AplusProductCard {...cardProps} />;
                }
                return <ProductCard {...cardProps} />;
              })}
            </div>
          )}
        </div>
      </main>

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
          affiliateTag={affiliateConfig.tag}
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