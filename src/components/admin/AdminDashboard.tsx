import React, { useState, useEffect } from 'react';
import { Product, Category, AffiliateConfig } from '../../types/product';
import { BlogPost } from '../../types/blog';
import { AdminProductEditorModal } from './AdminProductEditorModal';
import { ConfirmActionModal } from './ConfirmActionModal';
import { BlogManager } from './BlogManager';
import { BUILD_SHA } from '../../lib/build';
import { fetchPageViews, fetchEventClicks, daysAgoKey, PageViewRow, EventClickRow } from '../../lib/analytics';
import { 
  Plus, Search, Edit3, Trash2, ExternalLink, 
  Tag, LogOut, ArrowUpRight,
  Copy, RotateCcw, Check, Layers, AlertCircle, Newspaper,
  Eye, MousePointerClick
} from 'lucide-react';

type AdminTab = 'products' | 'blog';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  affiliateConfig: AffiliateConfig;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onResetDefaultCatalog: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onReturnToStore: () => void;
  onTrackClick: (product: Product) => void;
  blogPosts: BlogPost[];
  onSaveBlogPost: (post: BlogPost) => void;
  onDeleteBlogPost: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  affiliateConfig,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onResetDefaultCatalog,
  onOpenSettings,
  onLogout,
  onReturnToStore,
  onTrackClick,
  blogPosts,
  onSaveBlogPost,
  onDeleteBlogPost
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
  const [eventClicks, setEventClicks] = useState<EventClickRow[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPageViews(), fetchEventClicks()])
      .then(([views, clicks]) => {
        if (!active) return;
        setPageViews(views);
        setEventClicks(clicks);
      })
      .catch((e) => console.error('Error cargando analíticas:', e));
    return () => { active = false; };
  }, []);

  const analytics = (() => {
    const cutoffKey = daysAgoKey(29);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29);
    const cutoffTime = cutoff.getTime();
    let visitsTotal = 0, visits30 = 0, clicksTotal = 0, clicks30 = 0;
    for (const row of pageViews) {
      visitsTotal += row.views;
      if (row.view_date >= cutoffKey) visits30 += row.views;
    }
    for (const row of eventClicks) {
      clicksTotal += 1;
      if (new Date(row.created_at).getTime() >= cutoffTime) clicks30 += 1;
    }
    return { visitsTotal, visits30, clicksTotal, clicks30 };
  })();

  // Custom Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: 'duplicate' | 'delete' | 'reset';
    itemTitle: string;
    itemId?: string;
    product?: Product;
  } | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQ =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsEditorOpen(true);
  };

  // Triggers for Confirm Modal
  const promptDuplicate = (p: Product) => {
    setConfirmModalState({
      isOpen: true,
      type: 'duplicate',
      itemTitle: p.title,
      product: p
    });
  };

  const promptDelete = (p: Product) => {
    setConfirmModalState({
      isOpen: true,
      type: 'delete',
      itemTitle: p.title,
      itemId: p.id
    });
  };

  const promptReset = () => {
    setConfirmModalState({
      isOpen: true,
      type: 'reset',
      itemTitle: 'Catálogo de Ejemplo'
    });
  };

  // Confirm Modal Executions
  const handleConfirmAction = () => {
    if (!confirmModalState) return;

    if (confirmModalState.type === 'duplicate' && confirmModalState.product) {
      const p = confirmModalState.product;
      const duplicated: Product = {
        ...p,
        id: `prod-${Date.now()}`,
        title: `${p.title} (Copia)`
      };
      onAddProduct(duplicated);
      showNotification(`Producto "${duplicated.title}" duplicado exitosamente.`);
    } else if (confirmModalState.type === 'delete' && confirmModalState.itemId) {
      onDeleteProduct(confirmModalState.itemId);
      showNotification(`Producto "${confirmModalState.itemTitle}" eliminado del catálogo.`);
    } else if (confirmModalState.type === 'reset') {
      onResetDefaultCatalog();
      showNotification('Catálogo restablecido al estado inicial.');
    }

    setConfirmModalState(null);
  };

  return (
    <div className="admin-dashboard">
      {/* Top Navbar Admin */}
      <header className="admin-nav">
        <div className="container admin-nav-container">
          <div className="admin-brand" onClick={onReturnToStore} style={{ cursor: 'pointer' }} title="Ir al Front Landing Principal">
            <div className="admin-logo-circle">
              <img src={affiliateConfig.logoUrl || '/logo-koraselect.png'} alt="KORASELECT" className="admin-logo-mark" />
            </div>
            <div>
              <span className="brand-name font-heading">KORASELECT ADMIN</span>
            </div>
          </div>

          <div className="admin-nav-actions">
            <span className="admin-build-tag" title="Versión del código desplegada">build {BUILD_SHA.slice(0, 7)}</span>

            <button className="btn-view-store" onClick={onReturnToStore}>
              <span>Ver Tienda Pública</span>
              <ArrowUpRight size={16} />
            </button>

            <button className="btn-icon-tag" onClick={onOpenSettings} title="Ajustes de Tag de Afiliado">
              <Tag size={16} />
              <span>Tag: {affiliateConfig.tag}</span>
            </button>

            <button className="btn-logout" onClick={onLogout} title="Cerrar Sesión Administrativa">
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="admin-toast-banner animate-fade-in">
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Admin Dashboard Container */}
      <main className="container dashboard-content">
        <h1 className="dashboard-content-title font-heading">Panel de Control</h1>
        {/* Metric Cards Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box products">
              <Layers size={22} />
            </div>
            <div className="metric-data">
              <div className="metric-num">{products.length}</div>
              <div className="metric-label">Productos Publicados</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box tag">
              <Tag size={22} />
            </div>
            <div className="metric-data">
              <div className="metric-num">{affiliateConfig.tag}</div>
              <div className="metric-label">Amazon Tracking Tag Activo</div>
            </div>
          </div>

          <div className="metric-card clickable" onClick={() => setActiveTab('blog')} title="Ir a Gestión del Blog">
            <div className="metric-icon-box blog">
              <Newspaper size={22} />
            </div>
            <div className="metric-data">
              <div className="metric-num">{blogPosts.length}</div>
              <div className="metric-label">Entradas de Blog Publicadas</div>
            </div>
          </div>

          <div className="metric-card clickable" onClick={() => setActiveTab('blog')} title="Visitas a las entradas del blog">
            <div className="metric-icon-box views">
              <Eye size={22} />
            </div>
            <div className="metric-data">
              <div className="metric-num">{analytics.visits30}</div>
              <div className="metric-label">Visitas al Blog (30 días) · {analytics.visitsTotal} total</div>
            </div>
          </div>

          <div className="metric-card" title="Clics en productos desde la tienda y el blog">
            <div className="metric-icon-box clicks">
              <MousePointerClick size={22} />
            </div>
            <div className="metric-data">
              <div className="metric-num">{analytics.clicks30}</div>
              <div className="metric-label">Clics en Productos (30 días) · {analytics.clicksTotal} total</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={16} />
            <span>Catálogo de Productos</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            <Newspaper size={16} />
            <span>Blog & Guías</span>
            <span className="admin-tab-count">{blogPosts.length}</span>
          </button>
        </div>

        {/* Tab: Productos */}
        {activeTab === 'products' && (
        <div className="table-wrapper-card">
          <div className="table-toolbar">
            <div>
              <h2 className="toolbar-title font-heading">Gestión de Catálogo</h2>
              <p className="toolbar-sub">Publica, edita, duplica o elimina productos en tiempo real.</p>
            </div>

            <div className="toolbar-actions-right">
              <button className="btn-reset-catalog" onClick={promptReset} title="Restablecer datos originales">
                <RotateCcw size={15} />
                <span>Restablecer Ejemplo</span>
              </button>

              <button className="btn-amazon btn-publish-new" onClick={handleOpenCreate}>
                <Plus size={18} />
                <span>+ Publicar Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter bar inside admin */}
          <div className="admin-filters-bar">
            <div className="admin-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, subtítulo o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-cat-select">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CRUD Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto / Imagen</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Badge A+</th>
                  <th>Enlace Amazon</th>
                  <th>Acciones CRUD</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty-td">
                      <AlertCircle size={24} className="mx-auto mb-2 text-amber-500" />
                      <div>No se encontraron productos coincidentes en el catálogo.</div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const catObj = categories.find(c => c.id === p.category);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="prod-cell-info">
                            <img 
                              src={p.mainImage || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80'} 
                              alt={p.title} 
                              className="table-thumb" 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80';
                              }}
                            />
                            <div>
                              <div className="prod-cell-title font-heading">{p.title}</div>
                              <div className="prod-cell-sub">{p.subtitle}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-sage">{catObj?.name || p.category}</span>
                        </td>
                        <td>
                          <div className="price-cell-value">${p.price.toFixed(2)}</div>
                        </td>
                        <td>
                          <span className="badge-blush">{p.badge || 'A+ Content'}</span>
                        </td>
                        <td>
                          <a
                            href={p.amazonUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="amazon-link-pill"
                          >
                            <span>Link Afiliado</span>
                            <ExternalLink size={12} />
                          </a>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button 
                              className="action-btn edit" 
                              onClick={() => handleOpenEdit(p)}
                              title="Editar producto (Update)"
                            >
                              <Edit3 size={15} />
                              <span>Editar</span>
                            </button>

                            <button 
                              className="action-btn duplicate" 
                              onClick={() => promptDuplicate(p)}
                              title="Duplicar producto (Clone)"
                            >
                              <Copy size={15} />
                            </button>

                            <button
                              className="action-btn delete"
                              onClick={() => promptDelete(p)}
                              title="Eliminar producto (Delete)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Tab: Blog */}
        {activeTab === 'blog' && (
          <BlogManager
            posts={blogPosts}
            products={products}
            onSavePost={(post) => {
              onSaveBlogPost(post);
            }}
            onDeletePost={onDeleteBlogPost}
            affiliateTag={affiliateConfig.tag}
            onTrackClick={onTrackClick}
          />
        )}
      </main>

      {/* Editor Modal */}
      {isEditorOpen && (
        <AdminProductEditorModal
          productToEdit={editingProduct}
          categories={categories}
          affiliateTag={affiliateConfig.tag}
          onSaveProduct={(savedProd) => {
            if (editingProduct) {
              onUpdateProduct(savedProd);
              showNotification(`Producto "${savedProd.title}" actualizado con éxito.`);
            } else {
              onAddProduct(savedProd);
              showNotification(`Nuevo producto "${savedProd.title}" publicado en el catálogo.`);
            }
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Custom Popup Confirmation Modal */}
      {confirmModalState && (
        <ConfirmActionModal
          isOpen={confirmModalState.isOpen}
          type={confirmModalState.type}
          itemTitle={confirmModalState.itemTitle}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmModalState(null)}
        />
      )}

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background-color: var(--bg-main);
          padding-bottom: 60px;
        }

        .admin-toast-banner {
          position: fixed;
          top: 80px;
          right: 24px;
          background-color: #2e7d32;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: var(--shadow-md);
          z-index: 1000;
        }

        .admin-nav {
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .admin-nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-logo-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .admin-logo-mark {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .admin-brand .brand-name {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: block;
          line-height: 1.1;
        }

        .admin-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-build-tag {
          font-size: 0.7rem;
          color: var(--text-light);
          background: rgba(0, 0, 0, 0.06);
          padding: 3px 10px;
          border-radius: var(--border-radius-pill);
          opacity: 0.9;
          white-space: nowrap;
        }

        .btn-view-store {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--border-radius-pill);
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-dark);
          transition: all var(--transition-fast);
        }

        .btn-view-store:hover {
          background-color: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .btn-icon-tag {
          background-color: #fff3e0;
          color: #e65100;
          border: 1px solid #ffe0b2;
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-logout {
          background-color: #ffebee;
          color: #c62828;
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dashboard-content {
          margin-top: 32px;
        }

        .dashboard-content-title {
          font-size: 1.6rem;
          margin: 0 0 20px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }

        .metric-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-icon-box.products { background-color: #f3e5f5; color: #7b1fa2; }
        .metric-icon-box.clicks { background-color: #e3f2fd; color: #1976d2; }
        .metric-icon-box.revenue { background-color: #e8f5e9; color: #2e7d32; }
        .metric-icon-box.tag { background-color: #fff3e0; color: #f57c00; }

        .metric-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1.1;
        }

        .metric-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .table-wrapper-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 28px;
          box-shadow: var(--shadow-sm);
        }

        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .toolbar-actions-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-reset-catalog {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .toolbar-title {
          font-size: 1.5rem;
        }

        .toolbar-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .admin-filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .admin-search-box {
          flex: 1;
          min-width: 260px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-search-box input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          font-size: 0.88rem;
        }

        .admin-cat-select select {
          padding: 10px 16px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          font-size: 0.88rem;
        }

.table-responsive {
          overflow-x: auto;
        }

.admin-table {
          width: 100%;
          min-width: 820px;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background-color: var(--bg-main);
          padding: 12px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }

        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
          font-size: 0.88rem;
        }

        .prod-cell-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .table-thumb {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-sm);
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .prod-cell-title {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .prod-cell-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

.price-cell-value {
          font-weight: 700;
          color: var(--text-dark);
          white-space: nowrap;
        }

.amazon-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: #fff3e0;
          color: #e68100;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: var(--border-radius-pill);
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

.amazon-link-pill:hover {
          background-color: #ffe4c4;
          color: #b45309;
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-btn {
          padding: 6px 12px;
          border-radius: var(--border-radius-pill);
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .action-btn.edit {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
        }

        .action-btn.duplicate {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .action-btn.delete {
          background-color: #ffebee;
          color: #c62828;
        }

        .table-empty-td {
          text-align: center;
          padding: 40px !important;
          color: var(--text-muted);
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0;
        }

        .admin-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: var(--border-radius-pill) var(--border-radius-pill) 0 0;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 600;
          border: 1px solid transparent;
          border-bottom: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .admin-tab:hover {
          color: var(--text-dark);
          background-color: var(--bg-card);
        }

        .admin-tab.active {
          background-color: var(--bg-card);
          border-color: var(--border-color);
          border-bottom: 2px solid var(--text-dark);
          color: var(--text-dark);
        }

        .admin-tab-count {
          background-color: var(--text-dark);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .metric-card.clickable {
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .metric-card.clickable:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .metric-icon-box.blog {
          background-color: #ede7f6;
          color: #5e35b1;
        }

        .metric-icon-box.views {
          background-color: #e0f2f1;
          color: #00695c;
        }

        .icon-circle.delete {
          background-color: #ffebee;
          color: #c62828;
        }
      `}</style>
    </div>
  );
};
