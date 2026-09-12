import React, { useState } from 'react';
import { Product, Category } from '../types/product';
import { X, Upload, Sparkles, Link, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateListModalProps {
  categories: Category[];
  affiliateTag: string;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  categories,
  affiliateTag,
  onClose,
  onAddProduct
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || 'viaje-familiar');
  const [price, setPrice] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('Top Seller');
  const [dimensions, setDimensions] = useState('');
  const [highlight1, setHighlight1] = useState('');
  const [highlight2, setHighlight2] = useState('');
  const [colorName, setColorName] = useState('Butter Beige');
  const [colorHex, setColorHex] = useState('#EBE3D5');

  // JSON Quick Import state
  const [jsonText, setJsonText] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleQuickTemplate = () => {
    setTitle('Cochecito Ligero Lux Cabin-Friendly');
    setSubtitle('Ultra compacto para viajar en avión con estilo minimalista');
    setCategory('viaje-familiar');
    setPrice('199.99');
    setAmazonUrl('https://www.amazon.com/dp/B08SAMPLE123');
    setImageUrl('https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80');
    setBadge('A+ Must-Have');
    setDimensions('20.5 in x 15 in x 9.8 in');
    setHighlight1('Plegado instantáneo con una sola mano');
    setHighlight2('Arnés de 5 puntos reforzado');
    setColorName('Oatmeal Beige');
    setColorHex('#DDD4C4');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !amazonUrl) {
      alert('Por favor completa el Título, Precio y Enlace de Amazon.');
      return;
    }

    const highlightsList = [];
    if (highlight1) highlightsList.push({ title: highlight1, description: 'Característica destacada' });
    if (highlight2) highlightsList.push({ title: highlight2, description: 'Alta durabilidad' });

    const colorsList = [];
    if (colorName) colorsList.push({ name: colorName, hex: colorHex });

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title,
      subtitle: subtitle || 'Selección especial para Amazon Afiliados',
      category,
      price: parseFloat(price) || 0,
      rating: 4.9,
      reviewsCount: 1,
      amazonUrl,
      mainImage: imageUrl || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80',
      badge: badge || 'Nuevo',
      dimensions,
      highlights: highlightsList,
      colors: colorsList,
      description: `${title} - ${subtitle}`,
      aPlusContent: {
        heroTitle: title,
        heroSubtitle: subtitle || 'Selección de calidad destacada en Amazon.',
        bannerImage: imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        features: [
          { title: 'Estilo & Calidad', desc: 'Materiales seleccionados con la más alta durabilidad.', icon: 'Check' }
        ],
        whyChoose: [
          'Calificación de 5 estrellas en Amazon',
          'Envío rápido Prime disponible',
          'Inclusión garantizada en listas de nuestra selección'
        ]
      }
    };

    onAddProduct(newProduct);
    triggerConfetti();
    onClose();
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => onAddProduct(item));
      } else {
        onAddProduct(parsed);
      }
      triggerConfetti();
      onClose();
    } catch {
      alert('El formato JSON no es válido. Asegúrate de ingresar un objeto o lista JSON válida.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container create-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <span className="badge-premium">Subir & Publicar</span>
            <button type="button" className="btn-auto-fill" onClick={handleQuickTemplate}>
              <Sparkles size={14} />
              <span>Autocompletar Ejemplo</span>
            </button>
          </div>
          <h2 className="modal-title font-heading">Subir Lista / Producto a tu Collage</h2>
          <p className="modal-sub">
            Agrega productos a tus listas por categoría. Todos los enlaces se publicarán automáticamente con tu Tag de Afiliado (<code>{affiliateTag}</code>).
          </p>

          {/* Mode Switcher */}
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              Formulario Guiado
            </button>
            <button
              className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              Importar JSON Masivo
            </button>
          </div>
        </div>

        {/* Form Body */}
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Título del Producto / Lista *</label>
                <input
                  type="text"
                  placeholder="Ej: Rainro & Co - Maleta Ride-on 42L"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label>Subtítulo o Frase Destacada</label>
                <input
                  type="text"
                  placeholder="Ej: Diseñada por padres para viajes familiares sin estrés"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Categoría Collage *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Precio ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="189.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label>Enlace de Amazon Afiliados *</label>
                <div className="input-with-icon">
                  <Link size={16} className="input-icon" />
                  <input
                    type="url"
                    placeholder="https://www.amazon.com/dp/B08X1L9999"
                    value={amazonUrl}
                    onChange={(e) => setAmazonUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group col-span-2">
                <label>URL de Imagen del Producto</label>
                <div className="input-with-icon">
                  <Upload size={16} className="input-icon" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Etiqueta / Badge</label>
                <input
                  type="text"
                  placeholder="Ej: Top Seller, Best Seller"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Medidas / Dimensiones</label>
                <input
                  type="text"
                  placeholder="19.7 in x 14.6 in x 10.6 in"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Característica 1</label>
                <input
                  type="text"
                  placeholder="Ej: Sistema de frenos en ruedas"
                  value={highlight1}
                  onChange={(e) => setHighlight1(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Característica 2</label>
                <input
                  type="text"
                  placeholder="Ej: Tamaño Aprobado para Cabina"
                  value={highlight2}
                  onChange={(e) => setHighlight2(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Color Principal (Nombre)</label>
                <input
                  type="text"
                  placeholder="Butter Beige"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Código HEX del Color</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-amazon btn-submit">
                <Plus size={18} />
                <span>Publicar en mi Collage</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="json-import-container">
            <textarea
              className="json-textarea"
              placeholder='Pega aquí tu lista JSON de productos de Amazon...'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={10}
            />
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn-editorial" onClick={handleJsonImport}>
                <Check size={18} />
                <span>Importar Colección JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .create-modal {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          border-radius: var(--border-radius-lg);
          padding: 32px;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .modal-title {
          font-size: 1.6rem;
          margin-top: 10px;
        }

        .modal-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .btn-auto-fill {
          background-color: var(--bg-sage-light);
          color: #38503d;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all var(--transition-fast);
        }

        .btn-auto-fill:hover {
          background-color: var(--bg-sage);
        }

        .tab-switcher {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          background-color: var(--bg-main);
          padding: 4px;
          border-radius: var(--border-radius-pill);
          width: fit-content;
        }

        .tab-btn {
          padding: 6px 16px;
          border-radius: var(--border-radius-pill);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .tab-btn.active {
          background-color: var(--bg-card);
          color: var(--text-dark);
          font-weight: 700;
          box-shadow: var(--shadow-sm);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .col-span-2 {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-dark);
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-dark);
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: var(--text-dark);
          background-color: #ffffff;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon input {
          width: 100%;
          padding-left: 38px;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .color-picker-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-picker {
          width: 40px;
          height: 38px;
          padding: 0 !important;
          border: none !important;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .btn-secondary {
          padding: 10px 20px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.88rem;
        }

        .btn-submit {
          padding: 10px 24px;
        }

        .json-textarea {
          width: 100%;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--bg-main);
          padding: 16px;
          font-family: monospace;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
