import React, { useState } from 'react';
import { Product } from '../types/product';
import { ExternalLink, Star, Eye, Check, Info } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  affiliateTag: string;
  onOpenDetailModal: (product: Product) => void;
  onTrackClick: (product: Product) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  affiliateTag,
  onOpenDetailModal,
  onTrackClick
}) => {
  // Color selection state (default null so mainImage is always shown initially)
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const selectedVariantColor =
    selectedColorIndex !== null && product.colors && product.colors[selectedColorIndex]
      ? product.colors[selectedColorIndex]
      : null;

  // Active image: if user actively selected a color variant with a valid image, use it; otherwise use product.mainImage
  const activeImage =
    selectedVariantColor?.imageUrl && selectedVariantColor.imageUrl.trim() !== ''
      ? selectedVariantColor.imageUrl
      : product.mainImage && product.mainImage.trim() !== ''
      ? product.mainImage
      : FALLBACK_IMAGE;

  // Append affiliate tag to Amazon URL dynamically
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

  return (
    <div className="product-card animate-fade-in">
      {/* Top Card Header Badge */}
      <div className="card-top-bar">
        {product.badge ? (
          <span className="badge-sage">{product.badge}</span>
        ) : (
          <span className="badge-blush">Recomendado</span>
        )}
        <div className="rating-pill">
          <Star size={13} fill="#FFB800" stroke="#FFB800" />
          <span>{product.rating}</span>
          <span className="reviews-count">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Image Showcase Container */}
      <div className="card-image-box" onClick={() => onOpenDetailModal(product)}>
        <img 
          src={activeImage} 
          alt={product.title} 
          className="card-img" 
          onError={(e) => {
            // Fallback gracefully if custom image URL fails or returns error
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        
        {/* Hotspot overlays if available */}
        {product.hotspots && product.hotspots.length > 0 && (
          <div className="hotspots-overlay">
            {product.hotspots.map((hs) => (
              <div
                key={hs.id}
                className="hotspot-dot"
                style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
                title={`${hs.title}: ${hs.description}`}
              >
                <div className="hotspot-pulse"></div>
              </div>
            ))}
          </div>
        )}

        {/* Quick View Button Overlay */}
        <button 
          className="quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetailModal(product);
          }}
        >
          <Eye size={15} />
          <span>Vista A+ Content</span>
        </button>
      </div>

      {/* Color Swatches if available */}
      {product.colors && product.colors.length > 0 && (
        <div className="color-swatches">
          <span className="color-label">Colores:</span>
          <div className="swatch-list">
            {product.colors.map((col, idx) => (
              <button
                key={idx}
                className={`swatch-btn ${selectedColorIndex === idx ? 'active' : ''}`}
                style={{ backgroundColor: col.hex }}
                onClick={() => setSelectedColorIndex(idx)}
                title={col.name}
              />
            ))}
          </div>
          <span className="selected-color-name">
            {selectedVariantColor ? selectedVariantColor.name : product.colors[0].name}
          </span>
        </div>
      )}

      {/* Card Content Body */}
      <div className="card-body">
        <h3 className="card-title font-heading" onClick={() => onOpenDetailModal(product)}>
          {product.title}
        </h3>
        <p className="card-subtitle">{product.subtitle}</p>

        {/* Highlights List */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="card-highlights">
            {product.highlights.slice(0, 3).map((h, i) => (
              <div key={i} className="highlight-tag">
                <Check size={12} className="highlight-icon" />
                <span>{h.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Dimensions badge if available */}
        {product.dimensions && (
          <div className="dimensions-info">
            <Info size={12} />
            <span>Medidas: {product.dimensions}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Price & Amazon Affiliate CTA */}
      <div className="card-footer">
        <div className="price-box">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button className="btn-amazon" onClick={handleBuyClick}>
          <span>Comprar en Amazon</span>
          <ExternalLink size={15} />
        </button>
      </div>

      <style>{`
        .product-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: #d8cebe;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .rating-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dark);
          background-color: var(--bg-main);
          padding: 3px 8px;
          border-radius: var(--border-radius-pill);
        }

        .reviews-count {
          color: var(--text-muted);
          font-weight: 400;
          font-size: 0.72rem;
        }

        .card-image-box {
          width: 100%;
          height: 250px;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          position: relative;
          background-color: var(--bg-card-subtle);
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.03);
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .card-image-box:hover .card-img {
          transform: scale(1.05);
        }

        .quick-view-btn {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          background-color: rgba(30, 30, 30, 0.9);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(4px);
          transition: all var(--transition-fast);
        }

        .card-image-box:hover .quick-view-btn {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .hotspots-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hotspot-dot {
          position: absolute;
          width: 16px;
          height: 16px;
          background-color: #ffffff;
          border: 2px solid var(--text-dark);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: auto;
          cursor: pointer;
        }

        .hotspot-pulse {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: rgba(255, 153, 0, 0.6);
          animation: pulseGlow 1.8s infinite;
        }

        .color-swatches {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 6px 0;
          font-size: 0.78rem;
        }

        .color-label {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .swatch-list {
          display: flex;
          gap: 6px;
        }

        .swatch-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
          transition: transform 0.15s ease;
        }

        .swatch-btn:hover {
          transform: scale(1.2);
        }

        .swatch-btn.active {
          box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--text-dark);
        }

        .selected-color-name {
          font-size: 0.72rem;
          color: var(--text-dark);
          font-weight: 500;
          margin-left: auto;
        }

        .card-body {
          flex: 1;
          margin-top: 10px;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 6px;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .card-title:hover {
          color: #8c6a38;
        }

        .card-subtitle {
          font-size: 0.84rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .card-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .highlight-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          background-color: var(--bg-main);
          font-size: 0.73rem;
          padding: 3px 8px;
          border-radius: var(--border-radius-sm);
          color: var(--text-dark);
          font-weight: 500;
        }

        .highlight-icon {
          color: #2e7d32;
        }

        .dimensions-info {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: var(--text-muted);
          background-color: var(--bg-sage-light);
          padding: 4px 10px;
          border-radius: var(--border-radius-sm);
          margin-bottom: 14px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
          margin-top: auto;
          gap: 12px;
        }

        .price-box {
          display: flex;
          flex-direction: column;
        }

        .current-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-dark);
          line-height: 1;
        }

        .original-price {
          font-size: 0.78rem;
          color: var(--text-light);
          text-decoration: line-through;
          margin-top: 2px;
        }

        .product-card .btn-amazon {
          padding: 10px 18px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
