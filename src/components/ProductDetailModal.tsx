import React from 'react';
import { Product } from '../types/product';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Heart, Award, ArrowRight } from 'lucide-react';
import { getAffiliateUrl, AMAZON_CTA_TEXT, AMAZON_REL } from '../utils/affiliate';

interface ProductDetailModalProps {
  product: Product | null;
  affiliateTag: string;
  onClose: () => void;
  onTrackClick: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  affiliateTag,
  onClose,
  onTrackClick
}) => {
  if (!product) return null;

  const aPlus = product.aPlusContent;

  const handleBuy = (e: React.MouseEvent) => {
    onTrackClick(product);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container aplus-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Top Header */}
        <div className="aplus-header">
          <span className="badge-premium">KORASELECT Selection</span>
          <h2 className="aplus-title font-heading">{product.title}</h2>
          <p className="aplus-subtitle">{product.subtitle}</p>
        </div>

        {/* Main A+ Content Sections (Inspired by Image 2) */}
        <div className="aplus-body">
          {/* Module 1: Hero Banner Brand Narrative */}
          <div className="aplus-module module-hero">
            <img 
              src={aPlus?.bannerImage || product.mainImage || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80'} 
              alt="A+ Hero Banner" 
              className="module-banner-img"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80';
              }}
            />
            <div className="module-hero-overlay">
              <span className="hero-brand-tag font-heading">KORASELECT Selection</span>
              <h3 className="hero-heading font-heading">
                {aPlus?.heroTitle || 'Luxury Design. Made For Real Travel.'}
              </h3>
              <p className="hero-text">
                {aPlus?.heroSubtitle || product.description}
              </p>
            </div>
          </div>

          {/* Module 2: Feature Breakdown Grid (Wheel Brake System / Steps) */}
          {aPlus?.steps && aPlus.steps.length > 0 && (
            <div className="aplus-module module-steps">
              <div className="module-section-title font-heading">Wheel Brake System</div>
              <p className="module-section-sub">Engineered for safe starts and secure stops</p>

              <div className="steps-grid">
                {aPlus.steps.map((st) => (
                  <div key={st.step} className="step-card">
                    <div className="step-badge">Paso {st.step}</div>
                    <div className="step-icon-circle">
                      <ShieldCheck size={28} />
                    </div>
                    <div className="step-title">{st.title}</div>
                    <div className="step-desc">{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 3: Key Benefits list & Specifications */}
          <div className="aplus-module module-split">
            <div className="split-col info-col">
              <h4 className="split-title font-heading">
                Why Families Choose {product.title.split(' ')[0]}
              </h4>
              
              <div className="checklist">
                {(aPlus?.whyChoose || [
                  'Diseño ergonómico pensado para padres en movimiento',
                  'Frenos de seguridad en ruedas traseras',
                  'Bolsillos impermeables y compartimentos con cremallera',
                  'Cumple con los requerimientos de cabina internacionales'
                ]).map((item, idx) => (
                  <div key={idx} className="check-item">
                    <CheckCircle2 size={18} className="check-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {product.dimensions && (
                <div className="spec-box-highlight">
                  <Award size={18} />
                  <div>
                    <strong>Medidas de Cabina:</strong> {product.dimensions}
                  </div>
                </div>
              )}
            </div>

            <div className="split-col img-col">
              <div className="arch-frame split-arch">
                <img src={product.mainImage} alt="Product Detail" />
              </div>
            </div>
          </div>

          {/* Module 4: Color Collection Swatches (matching Image 1 & 2 bottom) */}
          {product.colors && product.colors.length > 0 && (
            <div className="aplus-module module-colors">
              <h4 className="font-heading colors-title">Colores Destacados</h4>
              <p className="colors-sub">Modern colors for every family journey</p>

              <div className="colors-showcase">
                {product.colors.map((c, i) => (
                  <div key={i} className="color-item-card">
                    <div className="color-preview-circle" style={{ backgroundColor: c.hex }}></div>
                    <span className="color-item-name">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom CTA Bar */}
        <div className="aplus-footer-bar">
          <div className="footer-price">
            <span className="label">Precio Amazon:</span>
            <div>
              <span className="price">${product.price.toFixed(2)}</span>
              <span className="price-note">El precio y la disponibilidad pueden variar en Amazon.</span>
            </div>
          </div>

          <div className="footer-ctas">
            <a
              className="btn-amazon buy-modal-btn"
              href={getAffiliateUrl(product.amazonUrl, affiliateTag)}
              target="_blank"
              rel={AMAZON_REL}
              onClick={handleBuy}
            >
              <span>{AMAZON_CTA_TEXT}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .aplus-modal {
          background-color: var(--bg-main);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: var(--border-radius-lg);
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
        }

        .modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: transform var(--transition-fast);
        }

        .modal-close-btn:hover {
          transform: scale(1.1);
          background-color: #ffffff;
        }

        .aplus-header {
          padding: 32px 32px 16px 32px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-card);
        }

        .aplus-title {
          font-size: 1.8rem;
          margin-top: 10px;
          line-height: 1.25;
        }

        .aplus-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .aplus-body {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .aplus-module {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 24px;
          overflow: hidden;
        }

        .module-hero {
          position: relative;
          padding: 0;
          min-height: 280px;
          display: flex;
          align-items: center;
        }

        .module-banner-img {
          width: 100%;
          height: 100%;
          min-height: 280px;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }

        .module-hero-overlay {
          position: relative;
          z-index: 2;
          background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0) 100%);
          padding: 32px;
          max-width: 520px;
        }

        .hero-brand-tag {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          display: block;
          margin-bottom: 6px;
        }

        .hero-heading {
          font-size: 1.6rem;
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .hero-text {
          font-size: 0.9rem;
          color: var(--text-dark);
        }

        .module-section-title {
          font-size: 1.3rem;
          font-weight: 700;
          text-align: center;
        }

        .module-section-sub {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .step-card {
          background-color: var(--bg-main);
          padding: 20px;
          border-radius: var(--border-radius-sm);
          text-align: center;
          position: relative;
        }

        .step-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-sage);
          padding: 2px 8px;
          border-radius: var(--border-radius-pill);
        }

        .step-icon-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
          color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .step-title {
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .step-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .module-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }

        .split-title {
          font-size: 1.3rem;
          margin-bottom: 16px;
        }

        .checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
        }

        .check-icon {
          color: #2e7d32;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .spec-box-highlight {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--bg-sage-light);
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
        }

        .split-arch {
          height: 260px;
        }

        .split-arch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .colors-title {
          text-align: center;
          font-size: 1.2rem;
        }

        .colors-sub {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .colors-showcase {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .color-item-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .color-preview-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .color-item-name {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .aplus-footer-bar {
          position: sticky;
          bottom: 0;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .footer-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .footer-price .label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .footer-price .price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1;
        }

        .footer-price .price-note {
          display: block;
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .footer-ctas .buy-modal-btn {
          white-space: normal;
          text-align: center;
        }

        @media (max-width: 768px) {
          .aplus-header, .aplus-body, .aplus-footer-bar {
            padding-left: 16px;
            padding-right: 16px;
          }
          .module-split {
            grid-template-columns: 1fr;
          }
          .module-hero-overlay {
            background: rgba(255,255,255,0.92);
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};
