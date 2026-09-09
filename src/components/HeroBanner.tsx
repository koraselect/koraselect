import React from 'react';
import { ArrowDownRight, Award, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  isAdminAuthenticated: boolean;
  customBannerText?: string;
  onExploreClick: () => void;
  onOpenAdmin: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ isAdminAuthenticated, customBannerText, onExploreClick, onOpenAdmin }) => {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* Left Column: Content */}
        <div className="hero-content">
          <div className="badge-premium mb-4">
            <Sparkles size={14} className="text-amber-400" />
            <span>{customBannerText || 'Selección Curada de Amazon Afiliados'}</span>
          </div>

          <h1 className="hero-title font-heading">
            Catálogo Editorial <br /> & Collage por Categorías
          </h1>

          <p className="hero-subtitle">
            Crea, sube y comparte listas de productos con formato <strong>A+ Premium Content</strong>. 
            Maximiza tus conversión de regalías en Amazon convirtiendo listas convencionales en vitrinas visuales irresistibles.
          </p>

          {/* Key Value Props (Directly inspired by Image 4 specifications) */}
          <div className="value-props">
            <div className="prop-item">
              <CheckCircle2 size={18} className="prop-icon" />
              <span><strong>Luxury Positioning:</strong> Estética prémium minimalista</span>
            </div>
            <div className="prop-item">
              <CheckCircle2 size={18} className="prop-icon" />
              <span><strong>Tag Automático:</strong> Inserción de tu código de regalia</span>
            </div>
            <div className="prop-item">
              <CheckCircle2 size={18} className="prop-icon" />
              <span><strong>Vistas A+ Content:</strong> Despiece interactivo de atributos</span>
            </div>
          </div>

          <div className="hero-ctas">
            <button className="btn-editorial hero-btn-main" onClick={onExploreClick}>
              <span>Explorar Collages</span>
              <ArrowDownRight size={18} />
            </button>
            <button className="btn-secondary-hero" onClick={onOpenAdmin} title="Inicia sesión en el Panel Admin para subir tus listas">
              <span>{isAdminAuthenticated ? '+ Subir Lista en Dashboard' : 'Acceso Creadores / Admin'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Arch & Collage Highlight matching Image 1, 3 & 5 */}
        <div className="hero-visual">
          <div className="hero-card-stack">
            {/* Arched image container */}
            <div className="hero-arch-container arch-frame">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80"
                alt="Rainro & Co Family Travel"
                className="hero-img"
              />
              <div className="hero-overlay-badge">
                <Award size={16} />
                <span>Featured Collection: Rainro & Co</span>
              </div>
            </div>

            {/* Floating Mini Spec Card matching Image 1 bottom right */}
            <div className="floating-spec-card">
              <div className="spec-color-pills">
                <span className="pill-dot beige" title="Butter Beige"></span>
                <span className="pill-dot black" title="Obsidian Black"></span>
                <span className="pill-dot blush" title="Whisper Blush"></span>
              </div>
              <div className="spec-text">
                <div className="spec-title">Premium Color Collection</div>
                <div className="spec-sub">Modern colors for every journey</div>
              </div>
            </div>

            {/* Floating Feature Circle */}
            <div className="floating-badge-circle">
              <ShieldCheck size={20} />
              <div className="circle-text">Wheel Brake System</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 60px 0 40px 0;
          position: relative;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          align-items: center;
        }

        .mb-4 {
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 3.2rem;
          line-height: 1.15;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 20px;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          max-width: 540px;
          line-height: 1.6;
        }

        .value-props {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 32px;
        }

        .prop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          color: var(--text-dark);
        }

        .prop-icon {
          color: #4e6151;
          flex-shrink: 0;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-btn-main {
          padding: 14px 28px;
          font-size: 1rem;
        }

        .btn-secondary-hero {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 14px 24px;
          border-radius: var(--border-radius-pill);
          transition: all var(--transition-fast);
        }

        .btn-secondary-hero:hover {
          border-color: var(--text-dark);
          background-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        /* Right side visuals */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .hero-card-stack {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .hero-arch-container {
          width: 100%;
          height: 480px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          position: relative;
          background-color: var(--bg-sand);
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hero-arch-container:hover .hero-img {
          transform: scale(1.03);
        }

        .hero-overlay-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          padding: 8px 16px;
          border-radius: var(--border-radius-pill);
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-dark);
        }

        .floating-spec-card {
          position: absolute;
          bottom: -20px;
          left: -30px;
          background-color: var(--bg-card);
          padding: 16px 20px;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 2;
          animation: fadeIn 0.8s ease-out;
        }

        .spec-color-pills {
          display: flex;
          gap: 6px;
        }

        .pill-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .pill-dot.beige { background-color: #EBE3D5; }
        .pill-dot.black { background-color: #2B2B2B; }
        .pill-dot.blush { background-color: #F0D9D5; }

        .spec-title {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-dark);
        }

        .spec-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .floating-badge-circle {
          position: absolute;
          top: 40px;
          right: -24px;
          background: var(--bg-sage);
          color: #2d3e32;
          padding: 14px;
          border-radius: 50%;
          width: 95px;
          height: 95px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: var(--shadow-md);
          border: 2px solid #ffffff;
          z-index: 2;
        }

        .circle-text {
          font-size: 0.65rem;
          font-weight: 700;
          line-height: 1.1;
          margin-top: 4px;
        }

        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-title {
            font-size: 2.4rem;
          }
          .hero-subtitle {
            margin: 0 auto 24px auto;
          }
          .value-props {
            align-items: center;
          }
          .hero-ctas {
            justify-content: center;
          }
          .hero-visual {
            margin-top: 20px;
          }
          .floating-spec-card {
            left: 10px;
          }
          .floating-badge-circle {
            right: 10px;
          }
        }
      `}</style>
    </section>
  );
};
