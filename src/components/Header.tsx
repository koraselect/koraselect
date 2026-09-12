import React from 'react';
import { Search, PlusCircle, Settings, Lock, UserCheck, LogOut } from 'lucide-react';
import { AffiliateConfig } from '../types/product';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  affiliateConfig: AffiliateConfig;
  isAdminAuthenticated: boolean;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onLogout?: () => void;
  onReturnToStore?: () => void;
  showSearch?: boolean;
  activeRoute?: 'store' | 'blog';
  onNavigateHome?: () => void;
  onNavigateBlog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  affiliateConfig,
  isAdminAuthenticated,
  onOpenSettings,
  onOpenAdmin,
  onLogout,
  onReturnToStore,
  showSearch = true,
  activeRoute = 'store',
  onNavigateHome,
  onNavigateBlog
}) => {
  const handleLogoClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onReturnToStore) {
      onReturnToStore();
    }
  };

  const handleNavClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (path === '/blog' && onNavigateBlog) {
      onNavigateBlog();
      return;
    }
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onReturnToStore) {
      onReturnToStore();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Auto-scroll smoothly to catalog section when user starts searching
    if (val.trim().length > 0) {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="header-nav">
      <div className="container header-container">
        {/* Logo - Redirects to Front Landing */}
        <div className="brand-logo" onClick={handleLogoClick} title="Ir a la Portada Principal (Front Landing)">
          <div className="logo-icon-wrapper">
            <img src="/logo-koraselect.png" alt={affiliateConfig.siteName || 'KORASELECT'} className="logo-mark" />
          </div>
          <div>
            <span className="brand-name font-heading">{affiliateConfig.siteName || 'KORASELECT'}</span>
            <span className="brand-tagline">{affiliateConfig.siteTagline || 'Ofertas Curadas de Amazon'}</span>
          </div>
        </div>

        {/* Nav Links: Inicio / Blog */}
        <nav className="header-nav-links">
          <a
            href="/"
            className={`nav-link ${activeRoute === 'store' ? 'active' : ''}`}
            onClick={handleNavClick('/')}
            title="Ir a la tienda"
          >
            Inicio
          </a>
          <a
            href="/blog"
            className={`nav-link ${activeRoute === 'blog' ? 'active' : ''}`}
            onClick={handleNavClick('/blog')}
            title="Blog, reseñas y guías de compra"
          >
            Blog & Guías
          </a>
        </nav>

        {/* Search Input for Products, Collections, ASIN */}
        {showSearch && (
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por producto, colección, ASIN (ej: B08X1L9999)..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')} title="Limpiar búsqueda">
                ×
              </button>
            )}
          </div>
        )}

        {/* Action Controls & Affiliate Badge */}
        <div className="header-actions">
          {/* Conditional Admin vs Regular User Controls */}
          {isAdminAuthenticated ? (
            <>
              {/* Button visible ONLY for Logged-In Admin users */}
              <button 
                className="btn-add-list admin-active-btn" 
                onClick={onOpenAdmin} 
                title="Publicar productos en el Dashboard Admin"
              >
                <PlusCircle size={18} />
                <span>+ Subir Lista</span>
              </button>

              <button 
                className="btn-admin-pill" 
                onClick={onOpenAdmin} 
                title="Ir al Dashboard Administrativo"
              >
                <UserCheck size={15} />
                <span>Dashboard Admin</span>
              </button>

              {/* Settings Gear Button (ONLY for Logged-In Admin) */}
              <button 
                className="btn-icon-only" 
                onClick={onOpenSettings} 
                title="Abrir Panel Lateral de Configuración (Admin)"
              >
                <Settings size={20} />
              </button>

              {/* Logout Button */}
              <button 
                className="btn-logout" 
                onClick={onLogout} 
                title="Cerrar sesión de administrador"
              >
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </>
          ) : (
            /* Regular User: Show Admin Login Lock Button */
            <button 
              className="btn-admin-login-lock" 
              onClick={onOpenAdmin} 
              title="Acceso Administrador para gestionar listas y configuración"
            >
              <Lock size={15} />
              <span>Acceso Admin</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .header-nav {
          background-color: rgba(247, 244, 239, 0.92);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
          transition: all var(--transition-fast);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .logo-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .logo-mark {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .brand-name {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: block;
          line-height: 1.1;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .search-bar {
          flex: 1;
          max-width: 460px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-bar input {
          width: 100%;
          padding: 12px 18px 12px 42px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
          background-color: var(--bg-card);
          font-family: var(--font-body);
          font-size: 0.88rem;
          color: var(--text-dark);
          transition: all var(--transition-fast);
        }

        .search-bar input:focus {
          border-color: var(--text-dark);
          box-shadow: 0 0 0 3px rgba(30, 30, 30, 0.08);
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .header-nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link {
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--text-dark);
          background-color: var(--bg-card);
        }

        .nav-link.active {
          color: var(--text-dark);
          background-color: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .clear-search {
          position: absolute;
          right: 14px;
          font-size: 1.2rem;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-add-list {
          background-color: var(--text-dark);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 10px 18px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-fast);
        }

        .btn-add-list:hover {
          background-color: #383838;
          transform: translateY(-1px);
        }

        .btn-admin-pill {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 9px 16px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .btn-admin-pill:hover {
          background-color: #c8e6c9;
        }

        .btn-admin-login-lock {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .btn-admin-login-lock:hover {
          border-color: var(--text-dark);
          background-color: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .btn-icon-only {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background-color: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dark);
          transition: all var(--transition-fast);
        }

        .btn-icon-only:hover {
          background-color: var(--bg-main);
          border-color: var(--text-dark);
        }

        .btn-logout {
          background-color: #fff3e0;
          border: 1px solid #ffcc80;
          color: #e65100;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .btn-logout:hover {
          background-color: #ffe0b2;
          border-color: #e65100;
        }

        @media (max-width: 900px) {
          .header-container {
            flex-wrap: wrap;
          }
          .header-nav-links {
            order: 3;
            width: 100%;
            justify-content: center;
          }
          .search-bar {
            order: 4;
            max-width: 100%;
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>
    </header>
  );
};
