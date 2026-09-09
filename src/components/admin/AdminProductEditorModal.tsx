import React, { useState } from 'react';
import { Product, Category, ColorOption, ProductHighlight } from '../../types/product';
import { X, Save, Eye, Link, Upload, Plus, Trash2, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Layers, Shield } from 'lucide-react';
import { ProductCard } from '../ProductCard';

interface AdminProductEditorModalProps {
  productToEdit?: Product | null;
  categories: Category[];
  affiliateTag: string;
  onSaveProduct: (product: Product) => void;
  onClose: () => void;
}

export const AdminProductEditorModal: React.FC<AdminProductEditorModalProps> = ({
  productToEdit,
  categories,
  affiliateTag,
  onSaveProduct,
  onClose
}) => {
  const isEditing = !!productToEdit;

  // Step state (1: Info Básica, 2: Colores y Medidas, 3: Destacados y A+, 4: Previsualización)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [subtitle, setSubtitle] = useState(productToEdit?.subtitle || '');
  const [category, setCategory] = useState(productToEdit?.category || categories[1]?.id || 'viaje-familiar');
  const [price, setPrice] = useState(productToEdit?.price ? productToEdit.price.toString() : '');
  const [originalPrice, setOriginalPrice] = useState(productToEdit?.originalPrice ? productToEdit.originalPrice.toString() : '');
  const [rating, setRating] = useState(productToEdit?.rating ? productToEdit.rating.toString() : '4.9');
  const [reviewsCount, setReviewsCount] = useState(productToEdit?.reviewsCount ? productToEdit.reviewsCount.toString() : '24');
  const [amazonUrl, setAmazonUrl] = useState(productToEdit?.amazonUrl || '');
  const [mainImage, setMainImage] = useState(productToEdit?.mainImage || '');
  const [badge, setBadge] = useState(productToEdit?.badge || 'A+ Premium');
  const [dimensions, setDimensions] = useState(productToEdit?.dimensions || '');
  const [capacity, setCapacity] = useState(productToEdit?.capacity || '');

  // Colors State
  const [colors, setColors] = useState<ColorOption[]>(
    productToEdit?.colors && productToEdit.colors.length > 0
      ? productToEdit.colors
      : [{ name: 'Butter Beige', hex: '#EBE3D5' }, { name: 'Obsidian Black', hex: '#2B2B2B' }]
  );
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#BAC7BE');

  // Highlights State
  const [highlights, setHighlights] = useState<ProductHighlight[]>(
    productToEdit?.highlights && productToEdit.highlights.length > 0
      ? productToEdit.highlights
      : [{ title: 'Seguridad Certificada', description: 'Material ultra resistente' }]
  );
  const [highlightInput, setHighlightInput] = useState('');

  // A+ Content State
  const [aPlusTitle, setAPlusTitle] = useState(productToEdit?.aPlusContent?.heroTitle || 'Luxury Design. Made For Real Travel.');
  const [aPlusSubtitle, setAPlusSubtitle] = useState(productToEdit?.aPlusContent?.heroSubtitle || 'Equipaje prémium diseñado para familias modernas');

  // Add Color Handlers
  const handleAddColor = () => {
    if (!colorNameInput.trim()) return;
    setColors([...colors, { name: colorNameInput.trim(), hex: colorHexInput }]);
    setColorNameInput('');
  };

  const handleRemoveColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  // Add Highlight Handlers
  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights([...highlights, { title: highlightInput.trim(), description: 'Característica destacada' }]);
    setHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSave = () => {
    if (!title || !price || !amazonUrl) {
      alert('Por favor completa los campos obligatorios: Título, Precio y Enlace de Amazon.');
      setCurrentStep(1);
      return;
    }

    const finalProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      title,
      subtitle: subtitle || 'Selección especial para Amazon Afiliados',
      category,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      rating: parseFloat(rating) || 4.9,
      reviewsCount: parseInt(reviewsCount, 10) || 10,
      amazonUrl,
      mainImage: mainImage || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80',
      badge: badge || 'A+ Content',
      dimensions,
      capacity,
      highlights,
      colors,
      description: `${title} - ${subtitle}`,
      aPlusContent: {
        heroTitle: aPlusTitle,
        heroSubtitle: aPlusSubtitle,
        bannerImage: mainImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
        features: productToEdit?.aPlusContent?.features || [
          { title: 'Estilo & Funcionalidad', desc: 'Materiales seleccionados de alta gama', icon: 'Shield' }
        ],
        steps: productToEdit?.aPlusContent?.steps,
        whyChoose: productToEdit?.aPlusContent?.whyChoose || [
          'Calificación destacada en Amazon Afiliados',
          'Material ultrarresistente y ligero',
          'Garantía oficial y envío rápido'
        ]
      }
    };

    onSaveProduct(finalProduct);
    onClose();
  };

  // Live draft object for Step 4 Preview
  const draftProduct: Product = {
    id: 'draft-preview',
    title: title || 'Título de Producto de Ejemplo',
    subtitle: subtitle || 'Subtítulo corto o frase destacada...',
    category,
    price: parseFloat(price) || 189.99,
    originalPrice: originalPrice ? parseFloat(originalPrice) : 229.00,
    rating: parseFloat(rating) || 4.9,
    reviewsCount: parseInt(reviewsCount, 10) || 24,
    amazonUrl: amazonUrl || 'https://www.amazon.com/',
    mainImage: mainImage || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80',
    badge: badge || 'Vista Previa',
    dimensions: dimensions || '19.7 in x 14.6 in',
    capacity,
    highlights,
    colors,
    description: title
  };

  return (
    <div className="modal-backdrop step-wizard-backdrop" onClick={onClose}>
      <div className="modal-container wizard-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Wizard Header */}
        <div className="wizard-header">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-premium">{isEditing ? 'Editar Producto (CRUD)' : 'Nuevo Producto (CRUD)'}</span>
          </div>
          <h2 className="wizard-title font-heading">{isEditing ? `Editar: ${productToEdit.title}` : 'Publicar Producto en Catálogo'}</h2>

          {/* Steps Indicator Bar */}
          <div className="steps-bar">
            <div className={`step-pill ${currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : ''}`} onClick={() => setCurrentStep(1)}>
              <span className="step-num">1</span>
              <span className="step-name">Básico</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-pill ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}`} onClick={() => setCurrentStep(2)}>
              <span className="step-num">2</span>
              <span className="step-name">Variantes & Medidas</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-pill ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}`} onClick={() => setCurrentStep(3)}>
              <span className="step-num">3</span>
              <span className="step-name">Destacados & A+</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-pill ${currentStep === 4 ? 'active' : ''}`} onClick={() => setCurrentStep(4)}>
              <span className="step-num">4</span>
              <span className="step-name">Previsualizar</span>
            </div>
          </div>
        </div>

        {/* Wizard Body according to step */}
        <div className="wizard-body">
          {/* STEP 1: INFORMACIÓN BÁSICA */}
          {currentStep === 1 && (
            <div className="step-pane animate-fade-in">
              <h3 className="pane-title font-heading">Paso 1: Información Principal del Producto</h3>
              
              <div className="form-grid">
                <div className="form-group col-span-2">
                  <label>Título del Producto *</label>
                  <input
                    type="text"
                    placeholder="Ej: Rainro & Co - Maleta Ride-on 42L"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Subtítulo o Resumen Corto</label>
                  <input
                    type="text"
                    placeholder="Ej: Diseñada por padres para viajes en familia"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría Collage *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.filter(c => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="189.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio Anterior / Tachado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="229.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Etiqueta / Badge</label>
                  <input
                    type="text"
                    placeholder="A+ Premium, Best Seller"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
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
                  <label>URL de Imagen Principal</label>
                  <div className="input-with-icon">
                    <Upload size={16} className="input-icon" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VARIANTES Y MEDIDAS */}
          {currentStep === 2 && (
            <div className="step-pane animate-fade-in">
              <h3 className="pane-title font-heading">Paso 2: Especificaciones & Variantes de Color</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Dimensiones / Medidas</label>
                  <input
                    type="text"
                    placeholder="19.7 in (50 cm) x 14.6 in (37 cm)"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Capacidad de Carga / Volumen</label>
                  <input
                    type="text"
                    placeholder="42L (3-5 Días de Viaje)"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>

                {/* Color Variants Box */}
                <div className="form-group col-span-2 section-box">
                  <label className="section-label font-heading">Gestión de Muestras de Color</label>
                  <div className="swatches-preview-row">
                    {colors.map((c, i) => (
                      <div key={i} className="color-chip-card">
                        <span className="dot-color" style={{ backgroundColor: c.hex }}></span>
                        <span className="color-chip-name">{c.name}</span>
                        <button type="button" className="btn-del-swatch" onClick={() => handleRemoveColor(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="add-swatch-controls mt-2">
                    <input
                      type="text"
                      placeholder="Nombre (ej: Whisper Blush)"
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                    />
                    <input
                      type="color"
                      value={colorHexInput}
                      onChange={(e) => setColorHexInput(e.target.value)}
                      className="color-picker-input"
                    />
                    <button type="button" className="btn-add-mini" onClick={handleAddColor}>
                      <Plus size={14} />
                      <span>Agregar Color</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DESTACADOS Y A+ CONTENT */}
          {currentStep === 3 && (
            <div className="step-pane animate-fade-in">
              <h3 className="pane-title font-heading">Paso 3: Atributos Clave & Contenido A+</h3>

              <div className="form-grid">
                {/* Highlights */}
                <div className="form-group col-span-2 section-box">
                  <label className="section-label font-heading">Puntos Clave / Beneficios Destacados</label>
                  <div className="highlights-pills-row">
                    {highlights.map((h, i) => (
                      <div key={i} className="highlight-pill-card">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>{h.title}</span>
                        <button type="button" className="btn-del-swatch" onClick={() => handleRemoveHighlight(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="add-swatch-controls mt-2">
                    <input
                      type="text"
                      placeholder="Nuevo atributo (ej: Candado TSA Integrado)"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                    />
                    <button type="button" className="btn-add-mini" onClick={handleAddHighlight}>
                      <Plus size={14} />
                      <span>Agregar Atributo</span>
                    </button>
                  </div>
                </div>

                <div className="form-group col-span-2">
                  <label>Título A+ Content (Para Modal Desplegable)</label>
                  <input
                    type="text"
                    placeholder="Luxury Design. Made For Real Travel."
                    value={aPlusTitle}
                    onChange={(e) => setAPlusTitle(e.target.value)}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label>Subtítulo o Historia A+ Content</label>
                  <input
                    type="text"
                    placeholder="Equipaje prémium diseñado para familias modernas"
                    value={aPlusSubtitle}
                    onChange={(e) => setAPlusSubtitle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVISUALIZACIÓN Y CONFIRMACIÓN */}
          {currentStep === 4 && (
            <div className="step-pane animate-fade-in">
              <h3 className="pane-title font-heading">Paso 4: Previsualización Final & Confirmación</h3>
              <p className="pane-sub">Revisa cómo se verá la tarjeta en el collage de tu tienda pública antes de guardar.</p>

              <div className="step-preview-layout">
                <div className="preview-card-box">
                  <ProductCard
                    product={draftProduct}
                    affiliateTag={affiliateTag}
                    onOpenDetailModal={() => {}}
                    onTrackClick={() => {}}
                  />
                </div>

                <div className="preview-summary-box">
                  <h4 className="font-heading text-lg font-bold">Resumen de Publicación</h4>
                  <ul className="summary-list">
                    <li><strong>Categoría:</strong> {categories.find(c => c.id === category)?.name}</li>
                    <li><strong>Precio Final:</strong> ${parseFloat(price || '0').toFixed(2)}</li>
                    <li><strong>Link Amazon:</strong> {amazonUrl}</li>
                    <li><strong>Tag Inyectado:</strong> <code>tag={affiliateTag}</code></li>
                    <li><strong>Variantes de Color:</strong> {colors.length} seleccionadas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="wizard-footer">
          <button
            type="button"
            className="btn-secondary"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-editorial"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              >
                <span>Siguiente Paso</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-amazon btn-publish-wizard"
                onClick={handleSave}
              >
                <Save size={18} />
                <span>{isEditing ? 'Guardar Cambios' : 'Publicar Producto Ahora'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .step-wizard-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .wizard-modal {
          background-color: #ffffff;
          width: 100%;
          max-width: 860px;
          max-height: 90vh;
          border-radius: var(--border-radius-lg);
          padding: 36px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .modal-close-btn:hover {
          background-color: var(--text-dark);
          color: #ffffff;
          transform: scale(1.05);
        }

        .wizard-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 24px;
        }

        .wizard-title {
          font-size: 1.7rem;
          line-height: 1.25;
          margin-top: 6px;
        }

        .steps-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .step-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-muted);
          background-color: var(--bg-main);
          padding: 8px 16px;
          border-radius: var(--border-radius-pill);
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          border: 1px solid var(--border-color);
        }

        .step-pill.active {
          background-color: var(--text-dark);
          color: #ffffff;
          border-color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .step-pill.done {
          background-color: var(--bg-sage-light);
          color: #2e4d36;
          border-color: #c8e6c9;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .step-connector {
          flex: 1;
          height: 1px;
          background-color: var(--border-color);
          min-width: 16px;
        }

        .wizard-body {
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
          margin-bottom: 24px;
        }

        .pane-title {
          font-size: 1.3rem;
          margin-bottom: 20px;
          color: var(--text-dark);
        }

        .pane-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .section-box {
          background-color: var(--bg-main);
          padding: 18px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }

        .section-label {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: block;
        }

        .swatches-preview-row, .highlights-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 14px;
        }

        .color-chip-card, .highlight-pill-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          border-radius: var(--border-radius-pill);
          font-size: 0.82rem;
          box-shadow: var(--shadow-sm);
        }

        .dot-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
        }

        .btn-del-swatch {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .btn-del-swatch:hover {
          color: #c62828;
        }

        .add-swatch-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .color-picker-input {
          width: 44px;
          height: 42px;
          padding: 0 !important;
          border: none !important;
          cursor: pointer;
          background: transparent !important;
        }

        .btn-add-mini {
          background-color: var(--text-dark);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .btn-add-mini:hover {
          background-color: #383838;
        }

        .step-preview-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: flex-start;
        }

        .preview-summary-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: var(--border-radius-md);
        }

        .summary-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.9rem;
          margin-top: 14px;
        }

        .summary-list code {
          background-color: #fff3e0;
          padding: 2px 6px;
          border-radius: 4px;
          color: #e65100;
          font-weight: 700;
        }

        .wizard-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-publish-wizard {
          padding: 12px 28px;
        }
      `}</style>
    </div>
  );
};
