import React from 'react';
import { Product } from '../types/product';
import { Star, Eye, ExternalLink, Check } from 'lucide-react';

interface GridProductCardProps {
  product: Product;
  affiliateTag: string;
  onOpenDetailModal: (product: Product) => void;
  onTrackClick: (product: Product) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80';

export const GridProductCard: React.FC<GridProductCardProps> = ({
  product,
  affiliateTag,
  onOpenDetailModal,
  onTrackClick
}) => {
  const getAffiliateUrl = (baseUrl: string) => {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('tag', affiliateTag);
      return url.toString();
    } catch {
      return `${baseUrl}?tag=${affiliateTag}`;
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackClick(product);
    window.open(getAffiliateUrl(product.amazonUrl), '_blank', 'noopener,noreferrer');
  };

  const activeImage =
    product.mainImage && product.mainImage.trim() !== ''
      ? product.mainImage
      : FALLBACK_IMAGE;

  return (
    <div className="grid-card animate-fade-in">
      {/* Image Box with Badge & Rating Overlays */}
      <div className="grid-card-image-box" onClick={() => onOpenDetailModal(product)}>
        <img
          src={activeImage}
          alt={product.title}
          className="grid-card-img"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="grid-card-top">
          {product.badge ? (
            <span className="badge-sage grid-badge">{product.badge}</span>
          ) : (
            <span className="badge-blush grid-badge">Recomendado</span>
          )}
        </div>
        <div className="grid-card-rating">
          <Star size={12} fill="#FFB800" stroke="#FFB800" />
          <span>{product.rating}</span>
          <span className="grid-reviews">({product.reviewsCount})</span>
        </div>
        <button
          className="grid-pop-open"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetailModal(product);
          }}
          title="Ver despiece A+"
        >
          <Eye size={15} />
        </button>
      </div>

      {/* Compact Body */}
      <div className="grid-card-body">
        <h3 className="grid-card-title font-heading" onClick={() => onOpenDetailModal(product)}>
          {product.title}
        </h3>

        {product.highlights && product.highlights.length > 0 && (
          <div className="grid-card-highlights">
            {product.highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="grid-highlight-tag">
                <Check size={11} className="grid-highlight-icon" />
                <span>{h.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Price & Buy */}
      <div className="grid-card-footer">
        <div className="grid-card-price">
          <span className="grid-price-current">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="grid-price-original">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <div className="grid-card-actions">
          <button
            className="btn-amazon grid-buy-btn"
            onClick={handleBuyClick}
          >
            <span>Comprar</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .grid-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }

        .grid-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: #d8cebe;
        }

        .grid-card-image-box {
          position: relative;
          height: 200px;
          overflow: hidden;
          cursor: pointer;
          background-color: var(--bg-card-subtle);
        }

        .grid-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .grid-card-image-box:hover .grid-card-img {
          transform: scale(1.06);
        }

        .grid-card-top {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          max-width: 70%;
        }

        .grid-badge {
          font-size: 0.68rem;
          padding: 3px 9px;
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .grid-card-rating {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--text-dark);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          padding: 3px 9px;
          border-radius: var(--border-radius-pill);
          box-shadow: var(--shadow-sm);
        }

        .grid-reviews {
          font-weight: 400;
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .grid-pop-open {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(30, 30, 30, 0.85);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(-6px);
          transition: all var(--transition-fast);
        }

        .grid-card-image-box:hover .grid-pop-open {
          opacity: 1;
          transform: translateY(0);
        }

        .grid-card-body {
          flex: 1;
          padding: 14px 16px 6px 16px;
        }

        .grid-card-title {
          font-size: 0.98rem;
          font-weight: 700;
          line-height: 1.3;
          cursor: pointer;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
          transition: color var(--transition-fast);
        }

        .grid-card-title:hover {
          color: #8c6a38;
        }

        .grid-card-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .grid-highlight-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          background-color: var(--bg-main);
          font-size: 0.68rem;
          padding: 2px 7px;
          border-radius: var(--border-radius-sm);
          color: var(--text-dark);
          font-weight: 500;
          white-space: nowrap;
        }

        .grid-highlight-icon {
          color: #2e7d32;
          flex-shrink: 0;
        }

        .grid-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          margin-top: 12px;
        }

        .grid-card-price {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .grid-price-current {
          font-size: 1.12rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .grid-price-original {
          font-size: 0.7rem;
          color: var(--text-light);
          text-decoration: line-through;
          margin-top: 2px;
        }

        .grid-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .grid-buy-btn {
          padding: 8px 14px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};