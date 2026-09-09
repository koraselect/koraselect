import React, { useState, useEffect } from 'react';
import { Product, AffiliateConfig } from './types/product';
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

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Layers, Sparkles, PlusCircle } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Affiliate Configuration State
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(() => {
    const saved = localStorage.getItem('luxe_affiliate_config');
    const defaultConfig = saved ? JSON.parse(saved) : INITIAL_AFFILIATE_CONFIG;
    
    // Check URL search param ?tag=...
    const urlParams = new URLSearchParams(window.location.search);
    const urlTag = urlParams.get('tag');
    if (urlTag) {
      defaultConfig.tag = urlTag;
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('luxe_affiliate_config', JSON.stringify(affiliateConfig));
  }, [affiliateConfig]);

  // 2. Products Catalog State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('luxe_products_catalog');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('luxe_products_catalog', JSON.stringify(products));
  }, [products]);

  // 3. Routing & View State (Store vs Admin)
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return hash.includes('admin') || search.includes('mode=admin') ? 'admin' : 'store';
  });

  // Listen to hash change in URL (e.g. #admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || search.includes('mode=admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('store');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 4. Admin Auth State
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
    window.location.hash = '';
    setCurrentView('store');
  };

  // 5. Store UI State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'collage' | 'grid' | 'aplus'>('collage');

  // Modals
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Track Affiliate Clicks
  const handleTrackClick = (product: Product) => {
    setAffiliateConfig((prev) => {
      const estimatedCommission = prev.estimatedCommissions + (product.price * 0.06);
      return {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        estimatedCommissions: estimatedCommission
      };
    });
  };

  // Product CRUD Handlers with immediate LocalStorage sync
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => {
      const updated = [newProd, ...prev];
      localStorage.setItem('luxe_products_catalog', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      localStorage.setItem('luxe_products_catalog', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('luxe_products_catalog', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetDefaultCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.setItem('luxe_products_catalog', JSON.stringify(INITIAL_PRODUCTS));
  };

  // Enhanced Filter Products (Title, Subtitle, Description, ASIN, Badge, Category Name)
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

  // RENDER ADMIN VIEW
  if (currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onReturnToStore={() => {
            window.location.hash = '';
            setCurrentView('store');
          }}
        />
      );
    }

    return (
      <AdminDashboard
        products={products}
        categories={CATEGORIES}
        affiliateConfig={affiliateConfig}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddProduct={handleAddProduct}
        onResetDefaultCatalog={handleResetDefaultCatalog}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleAdminLogout}
        onReturnToStore={() => {
          window.location.hash = '';
          setCurrentView('store');
        }}
      />
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
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentView('admin');
        }}
        onReturnToStore={() => {
          window.location.hash = '';
          setCurrentView('store');
        }}
      />

      {/* Hero Banner */}
      <HeroBanner
        isAdminAuthenticated={isAdminAuthenticated}
        customBannerText={affiliateConfig.customBannerText}
        onExploreClick={scrollToCatalog}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentView('admin');
        }}
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
              <p>Inicia sesión en tu Panel Administrativo para agregar y gestionar productos en el catálogo.</p>
              <button 
                className="btn-amazon mt-4" 
                onClick={() => {
                  window.location.hash = 'admin';
                  setCurrentView('admin');
                }}
              >
                <PlusCircle size={18} />
                <span>Ir al Dashboard Admin para Subir Productos</span>
              </button>
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
      <Footer />

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
          onSaveConfig={setAffiliateConfig}
          onClose={() => setIsSettingsModalOpen(false)}
        />
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
