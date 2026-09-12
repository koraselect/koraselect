import React from 'react';
import { Product } from '../types/product';
import {
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { getAffiliateUrl, AMAZON_CTA_TEXT, AMAZON_REL } from '../utils/affiliate';

interface AplusProductCardProps {
  product: Product;
  affiliateTag: string;
  onOpenDetailModal: (product: Product) => void;
  onTrackClick: (product: Product) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80';

export const AplusProductCard: React.FC<AplusProductCardProps> = ({
  product,
  affiliateTag,
  onOpenDetailModal,
  onTrackClick
}) => {
  const aPlus = product.aPlusContent;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackClick(product);
  };

  return (
    <div className="aplus-card animate-fade-in">
      {/* Module 1: Hero Banner Brand Narrative */}
      <div className="aplus-card-module aplus-card-hero">
        <img
          src={aPlus?.bannerImage || product.mainImage || FALLBACK_IMAGE}
          alt="A+ Hero Banner"
          className="aplus-card-hero-img"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="aplus-card-hero-overlay">
          <span className="aplus-card-eyebrow font-heading">KORASELECT Selection</span>
          <h3 className="aplus-card-hero-title font-heading">
            {aPlus?.heroTitle || product.title}
          </h3>
          <p className="aplus-card-hero-sub">
            {aPlus?.heroSubtitle || product.subtitle}
          </p>
          <div className="aplus-card-rating-pill">
            <Star size={13} fill="#FFB800" stroke="#FFB800" />
            <span>{product.rating}</span>
            <span className="aplus-card-reviews">({product.reviewsCount} reseñas)</span>
          </div>
          {product.badge && (
            <span className="badge-blush aplus-badge-chip">{product.badge}</span>
          )}
        </div>
      </div>

      {/* Module 2: Steps / Feature Breakdown */}
      {aPlus?.steps && aPlus.steps.length > 0 ? (
        <div className="aplus-card-module">
          <div className="aplus-module-title font-heading">Cómo Funciona</div>
          <div className="aplus-steps-grid">
            {aPlus.steps.map((st) => (
              <div key={st.step} className="aplus-step">
                <div className="aplus-step-badge">Paso {st.step}</div>
                <div className="aplus-step-icon">
                  <ShieldCheck size={24} />
                </div>
                <div className="aplus-step-title">{st.title}</div>
                <div className="aplus-step-desc">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : product.highlights && product.highlights.length > 0 ? (
        <div className="aplus-card-module">
          <div className="aplus-module-title font-heading">Características Destacadas</div>
          <p className="aplus-module-sub">Diseño y funcionalidad pensados para cada detalle</p>
          <div className="aplus-features-grid">
            {product.highlights.map((h, i) => (
              <div key={i} className="aplus-feature">
                <div className="aplus-feature-icon">
                  <CheckCircle2 size={22} />
                </div>
                <div className="aplus-feature-title">{h.title}</div>
                <div className="aplus-feature-desc">{h.description}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Module 3: Why Choose + Main Image */}
      <div className="aplus-card-module aplus-card-split">
        <div className="aplus-split-info">
          <h4 className="aplus-module-title font-heading">
            Why Families Choose {product.title.split(' ')[0]}
          </h4>

          <div className="aplus-checklist">
            {(aPlus?.whyChoose || product.highlights.map((h) => h.title)).map((item, idx) => (
              <div key={idx} className="aplus-check-item">
                <CheckCircle2 size={17} className="aplus-check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {product.dimensions && (
            <div className="aplus-card-spec">
              <Award size={18} />
              <div>
                <strong>Medidas de Cabina:</strong> {product.dimensions}
              </div>
            </div>
          )}
        </div>

        <div className="aplus-split-img">
          <div className="arch-frame aplus-card-arch">
            <img
              src={product.mainImage || FALLBACK_IMAGE}
              alt={`${product.title} - Detalle`}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </div>
        </div>
      </div>

      {/* Module 4: Color Collection */}
      {product.colors && product.colors.length > 0 && (
        <div className="aplus-card-module aplus-card-colors">
          <h4 className="aplus-module-title font-heading">Colores Destacados</h4>
          <p className="aplus-module-sub">Colores modernos para cada ocasión</p>
          <div className="aplus-colors-showcase">
            {product.colors.map((c, i) => (
              <div key={i} className="aplus-color-item">
                <div className="aplus-color-circle" style={{ backgroundColor: c.hex }}></div>
                <span className="aplus-color-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Bar: Price & CTAs */}
      <div className="aplus-card-footer">
        <div className="aplus-card-price">
          <span className="aplus-price-label">Precio Amazon:</span>
          <span className="aplus-price-current">${product.price.toFixed(2)}</span>
          <span className="aplus-price-note">El precio y la disponibilidad pueden variar en Amazon.</span>
        </div>

        <div className="aplus-card-ctas">
          <button
            className="aplus-view-btn"
            onClick={() => onOpenDetailModal(product)}
            title="Ver despiece interactivo A+ Content"
          >
            <Layers size={15} />
            <span>Ver despiece A+</span>
          </button>

          <a
            className="btn-amazon aplus-buy-btn"
            href={getAffiliateUrl(product.amazonUrl, affiliateTag)}
            target="_blank"
            rel={AMAZON_REL}
            onClick={handleBuy}
          >
            <span>{AMAZON_CTA_TEXT}</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <style>{`
        .aplus-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-normal);
        }

        .aplus-card:hover {
          box-shadow: var(--shadow-lg);
        }

        .aplus-card-module {
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 24px;
        }

        .aplus-module-title {
          font-size: 1.25rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 6px;
        }

        .aplus-module-sub {
          text-align: center;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 18px;
        }

        /* Hero */
        .aplus-card-hero {
          position: relative;
          padding: 0;
          min-height: 300px;
          display: flex;
          align-items: center;
        }

        .aplus-card-hero-img {
          width: 100%;
          height: 100%;
          min-height: 300px;
          object-fit: cover;
          position: absolute;
          inset: 0;
        }

        .aplus-card-hero-overlay {
          position: relative;
          z-index: 2;
          background: linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.78) 55%, rgba(255,255,255,0) 100%);
          padding: 32px;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .aplus-card-eyebrow {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .aplus-card-hero-title {
          font-size: 1.7rem;
          line-height: 1.2;
        }

        .aplus-card-hero-sub {
          font-size: 0.9rem;
          color: var(--text-dark);
          max-width: 440px;
        }

        .aplus-card-rating-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.84rem;
          font-weight: 700;
          background-color: var(--bg-main);
          padding: 4px 12px;
          border-radius: var(--border-radius-pill);
        }

        .aplus-card-reviews {
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .aplus-badge-chip {
          margin-top: 2px;
        }

        /* Steps */
        .aplus-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .aplus-step {
          background-color: var(--bg-main);
          padding: 20px;
          border-radius: var(--border-radius-sm);
          text-align: center;
          position: relative;
        }

        .aplus-step-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-sage);
          padding: 2px 8px;
          border-radius: var(--border-radius-pill);
        }

        .aplus-step-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
          color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .aplus-step-title {
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .aplus-step-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Features */
        .aplus-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .aplus-feature {
          background-color: var(--bg-main);
          padding: 20px;
          border-radius: var(--border-radius-sm);
          text-align: center;
        }

        .aplus-feature-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--bg-sage-light);
          color: #3b5042;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
        }

        .aplus-feature-title {
          font-weight: 700;
          font-size: 0.92rem;
          margin-bottom: 4px;
        }

        .aplus-feature-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Split */
        .aplus-card-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: center;
        }

        .aplus-split-info h4 {
          text-align: left;
        }

        .aplus-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 16px 0 20px 0;
        }

        .aplus-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
        }

        .aplus-check-icon {
          color: #2e7d32;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .aplus-card-spec {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--bg-sage-light);
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
        }

        .aplus-card-spec svg {
          flex-shrink: 0;
        }

        .aplus-card-arch {
          height: 260px;
        }

        .aplus-card-arch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Colors */
        .aplus-colors-showcase {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .aplus-color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .aplus-color-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .aplus-color-name {
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Footer */
        .aplus-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 24px;
          background-color: var(--bg-card);
          flex-wrap: wrap;
        }

        .aplus-card-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .aplus-price-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .aplus-price-current {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1;
        }

        .aplus-price-note {
          font-size: 0.68rem;
          color: var(--text-light);
          line-height: 1.3;
          margin-top: 3px;
        }

        .aplus-card-ctas {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .aplus-view-btn {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.84rem;
          padding: 11px 18px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .aplus-view-btn:hover {
          border-color: var(--text-dark);
          background-color: #ffffff;
        }

        .aplus-buy-btn {
          padding: 11px 18px;
          font-size: 0.84rem;
          text-align: center;
          white-space: normal;
        }

        @media (max-width: 768px) {
          .aplus-card-hero-overlay {
            background: rgba(255,255,255,0.94);
            padding: 20px;
            max-width: 100%;
          }
          .aplus-card-split {
            grid-template-columns: 1fr;
          }
          .aplus-card-arch {
            height: 220px;
          }
          .aplus-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .aplus-card-ctas {
            width: 100%;
          }
          .aplus-card-ctas .aplus-view-btn,
          .aplus-card-ctas .aplus-buy-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};