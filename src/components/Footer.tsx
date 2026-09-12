import React from 'react';
import { ShoppingBag, ShieldCheck, Heart, ExternalLink, Lock, Newspaper } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const goTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-section">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div 
              className="brand-logo mb-2" 
              onClick={() => goTo('/')}
              style={{ cursor: 'pointer' }}
              title="Ir al inicio de la Portada Principal"
            >
              <div className="logo-icon-wrapper">
                <ShoppingBag size={20} />
              </div>
              <span className="brand-name font-heading">KORASELECT</span>
            </div>
            <p className="footer-tagline">
              Curaduría de productos disponibles en Amazon, organizados por categorías para ayudarte a elegir mejor.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h5 className="group-title font-heading">Colecciones</h5>
              <ul>
                <li><a href="#maletas" onClick={(e) => { e.preventDefault(); goTo('/'); }}>Maletas y Equipaje</a></li>
                <li><a href="#botellas" onClick={(e) => { e.preventDefault(); goTo('/'); }}>Botellas y Termos</a></li>
                <li><a href="#estuches" onClick={(e) => { e.preventDefault(); goTo('/'); }}>Estuches y Neceseres</a></li>
                <li><a href="#organizacion" onClick={(e) => { e.preventDefault(); goTo('/'); }}>Organización</a></li>
              </ul>
            </div>

            <div className="link-group">
              <h5 className="group-title font-heading">Contenido</h5>
              <ul>
                <li>
                  <a href="/blog" onClick={(e) => { e.preventDefault(); goTo('/blog'); }}><Newspaper size={12} /> Blog & Guías de Compra</a>
                </li>
                <li><a href="https://affiliate-program.amazon.com/" target="_blank" rel="noopener noreferrer">Amazon Associates Portal <ExternalLink size={12} /></a></li>
              </ul>
            </div>

            <div className="link-group">
              <h5 className="group-title font-heading">Legal & Políticas</h5>
              <ul>
                <li><a href="https://www.amazon.com/ConditionsOfUse" target="_blank" rel="noopener noreferrer">Condiciones de Uso de Amazon <ExternalLink size={12} /></a></li>
                <li><a href="https://www.amazon.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad de Amazon <ExternalLink size={12} /></a></li>
                <li><a href="https://affiliate-program.amazon.com/" target="_blank" rel="noopener noreferrer">Programa de Afiliados <ExternalLink size={12} /></a></li>
                <li><a href="#admin" onClick={(e) => { e.preventDefault(); goTo('#admin'); }} style={{ fontWeight: 600, color: 'var(--text-dark)' }}><Lock size={12} /> Acceso Panel Admin</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mandatory Amazon Affiliate Disclosure */}
        <div className="amazon-disclosure-box">
          <ShieldCheck size={18} className="disclosure-icon" />
          <p>
            <strong>Divulgación de Afiliado:</strong> <strong>KORASELECT</strong> participa en el Programa de Afiliados de Amazon Services LLC, un programa de publicidad para afiliados diseñado para ofrecer a sitios web un modo de obtener comisiones por publicidad, publicitando e incluyendo enlaces a Amazon.com y sitios afiliados. Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.
          </p>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} KORASELECT. Todos los derechos reservados.</span>
          <span className="crafted-with">
            Diseñado con <Heart size={14} fill="#e53935" stroke="#e53935" /> para ayudarte a encontrar los mejores productos en Amazon
          </span>
        </div>
      </div>

      <style>{`
        .footer-section {
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          padding: 60px 0 30px 0;
          margin-top: 80px;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-brand {
          max-width: 400px;
        }

        .footer-tagline {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 10px;
          line-height: 1.6;
        }

        .footer-links {
          display: flex;
          gap: 60px;
          justify-content: flex-end;
        }

        .group-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .link-group ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-group a {
          font-size: 0.85rem;
          color: var(--text-muted);
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .link-group a:hover {
          color: var(--text-dark);
        }

        .amazon-disclosure-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 16px 20px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: flex-start;
          gap: 14px;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 30px;
        }

        .disclosure-icon {
          color: #c29b68;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .crafted-with {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .footer-top {
            grid-template-columns: 1fr;
          }
          .footer-links {
            justify-content: flex-start;
            gap: 30px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};
