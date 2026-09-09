import React from 'react';
import { ShoppingBag, Search, PlusCircle, Settings, Tag, TrendingUp, Lock, UserCheck, Shield } from 'lucide-react';
import { AffiliateConfig } from '../types/product';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  affiliateConfig: AffiliateConfig;
  isAdminAuthenticated: boolean;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onReturnToStore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  affiliateConfig,
  isAdminAuthenticated,
  onOpenSettings,
  onOpenAdmin,
  onReturnToStore
}) => {
  const handleLogoClick = () => {
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
            <ShoppingBag className="logo-icon" size={22} />
          </div>
          <div>
            <span className="brand-name font-heading">{affiliateConfig.siteName || 'LUXE COLLAGE'}</span>
            <span className="brand-tagline">{affiliateConfig.siteTagline || 'Amazon Afiliados A+'}</span>
          </div>
        </div>

        {/* Search Input for Products, Collections, ASIN */}
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

        {/* Action Controls & Affiliate Badge */}
        <div className="header-actions">
          {/* Conditional Admin vs Regular User Controls */}
          {isAdminAuthenticated ? (
            <>
              {/* Affiliate Tag Badge (ONLY for Logged-In Admin) */}
              <div 
                className="affiliate-tag-chip clickable"
                onClick={onOpenSettings}
                title="Abrir Panel Lateral de Configuración para Modificar Tag"
              >
                <Tag size={14} className="tag-icon" />
                <span className="tag-label">TAG:</span>
                <span className="tag-value">{affiliateConfig.tag}</span>
                <div className="stat-preview">
                  <TrendingUp size={13} />
                  <span>{affiliateConfig.totalClicks} clics</span>
                </div>
              </div>

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
          background-color: var(--text-dark);
          color: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
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

        .affiliate-tag-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--border-radius-pill);
          font-size: 0.85rem;
          transition: all var(--transition-fast);
        }

        .affiliate-tag-chip:hover {
          border-color: var(--color-amazon);
          box-shadow: var(--shadow-sm);
        }

        .tag-icon {
          color: var(--color-amazon);
        }

        .tag-label {
          font-weight: 500;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .tag-value {
          font-weight: 700;
          color: var(--text-dark);
          background: #fff3e0;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .stat-preview {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 6px;
          padding-left: 8px;
          border-left: 1px solid var(--border-color);
          font-size: 0.75rem;
          color: #2e7d32;
          font-weight: 600;
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

        @media (max-width: 900px) {
          .header-container {
            flex-wrap: wrap;
          }
          .search-bar {
            order: 3;
            max-width: 100%;
            width: 100%;
            margin-top: 8px;
          }
          .stat-preview {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
