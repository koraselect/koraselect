import React, { useState } from 'react';
import { AffiliateConfig } from '../types/product';
import { X, Tag, DollarSign, MousePointerClick, Check, Copy, Globe, Code, RefreshCw, Save, ShieldCheck } from 'lucide-react';

interface AffiliateSettingsModalProps {
  config: AffiliateConfig;
  onSaveConfig: (newConfig: AffiliateConfig) => void;
  onClose: () => void;
}

export const AffiliateSettingsModal: React.FC<AffiliateSettingsModalProps> = ({
  config,
  onSaveConfig,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'affiliate' | 'branding' | 'embed'>('affiliate');

  // Form state
  const [tag, setTag] = useState(config.tag || 'neostore-20');
  const [currency, setCurrency] = useState(config.currency || 'USD');
  const [commissionRate, setCommissionRate] = useState(config.defaultCommissionRate ? config.defaultCommissionRate.toString() : '6.0');
  const [siteName, setSiteName] = useState(config.siteName || 'LUXE COLLAGE');
  const [siteTagline, setSiteTagline] = useState(config.siteTagline || 'Amazon Afiliados A+ Premium Selection');
  const [customBannerText, setCustomBannerText] = useState(config.customBannerText || 'Selección Curada de Amazon Afiliados');

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'MXN': return '$';
      default: return '$';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) {
      alert('Por favor ingresa tu Tag de Amazon Afiliados.');
      return;
    }

    onSaveConfig({
      ...config,
      tag: tag.trim(),
      currency,
      defaultCommissionRate: parseFloat(commissionRate) || 6.0,
      siteName: siteName.trim() || 'LUXE COLLAGE',
      siteTagline: siteTagline.trim() || 'Amazon Afiliados A+',
      customBannerText: customBannerText.trim()
    });

    onClose();
  };

  const handleResetMetrics = () => {
    if (window.confirm('¿Deseas reiniciar el contador de clics y ganancias a cero?')) {
      onSaveConfig({
        ...config,
        totalClicks: 0,
        estimatedCommissions: 0
      });
    }
  };

  const handleCopyLink = () => {
    const currentUrl = `${window.location.origin}?tag=${tag}`;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const embedCode = `<iframe src="${window.location.origin}?tag=${tag}" width="100%" height="800" frameborder="0" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="drawer-backdrop animate-fade-in" onClick={onClose}>
      <aside className="right-drawer-panel animate-slide-left" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-700" />
              <span className="badge-sage">Ajustes Admin</span>
            </div>
            <button className="drawer-close-btn" onClick={onClose} title="Cerrar Panel Lateral">
              <X size={20} />
            </button>
          </div>

          <h2 className="drawer-title font-heading mt-2">Configuración del Sitio</h2>
          <p className="drawer-sub">Panel exclusivo de administración lateral</p>

          {/* Drawer Navigation Tabs */}
          <div className="drawer-tabs">
            <button
              className={`drawer-tab-btn ${activeTab === 'affiliate' ? 'active' : ''}`}
              onClick={() => setActiveTab('affiliate')}
            >
              <Tag size={14} />
              <span>Tag & Moneda</span>
            </button>
            <button
              className={`drawer-tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
              onClick={() => setActiveTab('branding')}
            >
              <Globe size={14} />
              <span>Branding</span>
            </button>
            <button
              className={`drawer-tab-btn ${activeTab === 'embed' ? 'active' : ''}`}
              onClick={() => setActiveTab('embed')}
            >
              <Code size={14} />
              <span>Analíticas & Code</span>
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="drawer-body">
          {/* Quick Metrics Bar */}
          <div className="drawer-metrics-row">
            <div className="mini-metric">
              <MousePointerClick size={16} className="text-blue-600" />
              <div>
                <div className="metric-val">{config.totalClicks}</div>
                <div className="metric-lbl">Clics Totales</div>
              </div>
            </div>

            <div className="mini-metric">
              <DollarSign size={16} className="text-emerald-600" />
              <div>
                <div className="metric-val">{getCurrencySymbol(currency)}{config.estimatedCommissions.toFixed(2)}</div>
                <div className="metric-lbl">Comisiones</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="drawer-form">
            {/* TAB 1: TAG & REGALÍAS */}
            {activeTab === 'affiliate' && (
              <div className="tab-pane animate-fade-in">
                <div className="form-group mb-4">
                  <label>Amazon Associates Tag (Tracking ID) *</label>
                  <div className="input-with-icon">
                    <Tag size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="ejemplo-20"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      required
                    />
                  </div>
                  <span className="helper-text">
                    Parámetro automático: <code>?tag={tag || 'tu-tag-20'}</code>
                  </span>
                </div>

                <div className="form-group mb-4">
                  <label>Moneda del Sitio</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD ($ - Dólar US)</option>
                    <option value="EUR">EUR (€ - Euro EU)</option>
                    <option value="GBP">GBP (£ - Libra UK)</option>
                    <option value="MXN">MXN ($ - Peso MX)</option>
                  </select>
                </div>

                <div className="form-group mb-4">
                  <label>Comisión Promedio Estimada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="6.0"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: BRANDING & NOMBRE */}
            {activeTab === 'branding' && (
              <div className="tab-pane animate-fade-in">
                <div className="form-group mb-4">
                  <label>Nombre de la Tienda / Marca *</label>
                  <input
                    type="text"
                    placeholder="LUXE COLLAGE"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label>Eslogan o Tagline Principal</label>
                  <input
                    type="text"
                    placeholder="Amazon Afiliados A+ Premium Selection"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                  />
                </div>

                <div className="form-group mb-4">
                  <label>Texto de Insignia en Banner Hero</label>
                  <input
                    type="text"
                    placeholder="Selección Curada de Amazon Afiliados"
                    value={customBannerText}
                    onChange={(e) => setCustomBannerText(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: EMBEBIDO & ANALÍTICAS */}
            {activeTab === 'embed' && (
              <div className="tab-pane animate-fade-in">
                <div className="share-card mb-4">
                  <strong>Enlace Directo con Tag:</strong>
                  <span className="share-url-text">{window.location.origin}?tag={tag}</span>
                  <button type="button" className="btn-copy-drawer mt-2" onClick={handleCopyLink}>
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Directo'}</span>
                  </button>
                </div>

                <div className="form-group mb-4">
                  <label>Código iFrame para Embeber en Blogs / Wordpress</label>
                  <textarea
                    rows={4}
                    className="code-textarea"
                    value={embedCode}
                    readOnly
                  />
                  <button type="button" className="btn-copy-drawer mt-2" onClick={handleCopyEmbed}>
                    {copiedEmbed ? <Check size={14} /> : <Code size={14} />}
                    <span>{copiedEmbed ? '¡Código iFrame Copiado!' : 'Copiar iFrame'}</span>
                  </button>
                </div>

                <button type="button" className="btn-reset-stat-drawer" onClick={handleResetMetrics}>
                  <RefreshCw size={14} />
                  <span>Reiniciar Métricas de Clics</span>
                </button>
              </div>
            )}

            <div className="drawer-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-editorial btn-save-drawer">
                <Save size={16} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </aside>

      <style>{`
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
          justify-content: flex-end;
        }

        .right-drawer-panel {
          background-color: #ffffff;
          width: 100%;
          max-width: 440px;
          height: 100vh;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          position: relative;
          border-left: 1px solid var(--border-color);
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-card-subtle);
        }

        .drawer-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .drawer-close-btn:hover {
          background-color: var(--text-dark);
          color: #ffffff;
        }

        .drawer-title {
          font-size: 1.4rem;
        }

        .drawer-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .drawer-tabs {
          display: flex;
          gap: 6px;
          margin-top: 14px;
          background-color: var(--bg-main);
          padding: 4px;
          border-radius: var(--border-radius-pill);
        }

        .drawer-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: var(--border-radius-pill);
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .drawer-tab-btn.active {
          background-color: var(--bg-card);
          color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .drawer-metrics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mini-metric {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-val {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1;
        }

        .metric-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .drawer-form {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .mb-4 {
          margin-bottom: 16px;
        }

        .share-card {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 14px;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
        }

        .share-url-text {
          font-family: monospace;
          color: var(--text-muted);
          word-break: break-all;
          margin: 4px 0;
        }

        .btn-copy-drawer {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--border-radius-pill);
          font-size: 0.78rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
        }

        .btn-reset-stat-drawer {
          background-color: #ffebee;
          color: #c62828;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
        }

        .drawer-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-save-drawer {
          padding: 10px 20px;
        }
      `}</style>
    </div>
  );
};
