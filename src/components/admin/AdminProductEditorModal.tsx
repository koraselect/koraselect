import React, { useState } from 'react';
import { Product, Category, ColorOption, ProductHighlight, ProductVideo } from '../../types/product';
import { X, Save, Eye, Link, Upload, Plus, Trash2, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Layers, Shield, Loader2, AlertCircle, PlayCircle, ZoomIn, Check } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { lookupAmazonProduct } from '../../lib/amazon';
import { improveAplusCopy } from '../../lib/ai';

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
  const [badge, setBadge] = useState(productToEdit?.badge || 'Top Seller');
  const [dimensions, setDimensions] = useState(productToEdit?.dimensions || '');
  const [capacity, setCapacity] = useState(productToEdit?.capacity || '');
  const [asin, setAsin] = useState(productToEdit?.asin || '');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Galería y Videos State
  const [galleryImages, setGalleryImages] = useState<string[]>(productToEdit?.galleryImages || []);
  const [galleryInput, setGalleryInput] = useState('');
  const [videos, setVideos] = useState<ProductVideo[]>(productToEdit?.videos || []);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');

  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return;
    const url = galleryInput.trim();
    if (!galleryImages.includes(url)) setGalleryImages([...galleryImages, url]);
    setGalleryInput('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleAddVideo = () => {
    if (!videoUrlInput.trim()) return;
    setVideos([...videos, { url: videoUrlInput.trim(), title: videoTitleInput.trim() || undefined }]);
    setVideoUrlInput('');
    setVideoTitleInput('');
  };

  const handleRemoveVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  // Visor ampliado (lightbox) para fotos de galería / principal
  const [lightbox, setLightbox] = useState<{ kind: 'gallery' | 'main'; index: number } | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');

  const openLightbox = (kind: 'gallery' | 'main', index: number) => {
    setReplaceUrl(kind === 'gallery' ? galleryImages[index] : mainImage);
    setLightbox({ kind, index });
  };

  const applyReplaceFromLightbox = () => {
    if (!lightbox) return;
    const u = replaceUrl.trim();
    if (!u) return;
    if (lightbox.kind === 'gallery') {
      setGalleryImages(galleryImages.map((g, i) => (i === lightbox.index ? u : g)));
    } else {
      setMainImage(u);
    }
    setLightbox(null);
  };

  const removeFromLightbox = () => {
    if (!lightbox) return;
    if (lightbox.kind === 'gallery') {
      setGalleryImages(galleryImages.filter((_, i) => i !== lightbox.index));
    } else {
      setMainImage('');
    }
    setLightbox(null);
  };

  const useAsMainFromLightbox = () => {
    if (!lightbox || lightbox.kind !== 'gallery') return;
    const img = galleryImages[lightbox.index];
    if (!img) return;
    setMainImage(img);
    setGalleryImages(galleryImages.filter((g) => g !== img));
    setLightbox(null);
  };

  const lightboxPrev = () => {
    if (!lightbox || lightbox.kind !== 'gallery') return;
    setLightbox({ kind: 'gallery', index: (lightbox.index - 1 + galleryImages.length) % galleryImages.length });
    setReplaceUrl(galleryImages[(lightbox.index - 1 + galleryImages.length) % galleryImages.length]);
  };

  const lightboxNext = () => {
    if (!lightbox || lightbox.kind !== 'gallery') return;
    setLightbox({ kind: 'gallery', index: (lightbox.index + 1) % galleryImages.length });
    setReplaceUrl(galleryImages[(lightbox.index + 1) % galleryImages.length]);
  };

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
  const [aPlusSubtitle, setAPlusSubtitle] = useState(productToEdit?.aPlusContent?.heroSubtitle || 'Descripción del producto en Amazon');

  // IA para el copy A+ (título / subtítulo)
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{ titles: string[]; subtitles: string[]; engine?: string } | null>(null);

  const handleGenerateCopy = async () => {
    setCopyLoading(true);
    setCopyError('');
    try {
      const res = await improveAplusCopy({
        product: {
          title,
          subtitle,
          category,
          badge,
          price: parseFloat(price) || 0
        },
        currentTitle: aPlusTitle,
        currentSubtitle: aPlusSubtitle
      });
      if (!res.success) {
        setCopyError(res.error || 'No se pudo generar el copy con IA.');
        return;
      }
      setAiSuggestions({ titles: res.titles || [], subtitles: res.subtitles || [], engine: res.engine });
    } catch (e) {
      setCopyError(e instanceof Error ? e.message : 'No se pudo generar el copy con IA.');
    } finally {
      setCopyLoading(false);
    }
  };

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

  // Autorelleno desde enlace de Amazon
  const handleAutoFillFromAmazon = async () => {
    setLookupError('');
    const url = amazonUrl.trim();
    if (!url) {
      setLookupError('Pega primero el enlace del producto de Amazon.');
      return;
    }
    setLookupLoading(true);
    try {
      const data = await lookupAmazonProduct(url);
      if (data.title && !title) setTitle(data.title);
      if (data.price !== null && data.price > 0) setPrice(data.price.toString());
      if (data.rating !== null && data.rating > 0) setRating(data.rating.toString());
      if (data.reviewsCount !== null && data.reviewsCount > 0) setReviewsCount(data.reviewsCount.toString());
      if (data.image) setMainImage(data.image);
      if (data.asin) setAsin(data.asin);
      const extras = (data.images || [])
        .filter((u: string) => u !== data.image)
        .filter((u: string) => u.startsWith('http') && !galleryImages.includes(u));
      if (extras.length > 0) setGalleryImages([...galleryImages, ...extras]);
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : 'No se pudo extraer el producto de Amazon.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Submit Handler
  const handleSave = () => {
    if (!title || !amazonUrl) {
      alert('Por favor completa los campos obligatorios: Título y Enlace de Amazon.');
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
      asin: asin || undefined,
      mainImage: mainImage || 'https://images.unsplash.com/photo-1565026057447-b8899f291105?auto=format&fit=crop&w=1000&q=80',
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      videos: videos.length > 0 ? videos : undefined,
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
    galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
    videos: videos.length > 0 ? videos : undefined,
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
                  <label>Precio Referencial ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="189.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="helper-text">Opcional. Solo referencia interna: no se muestra en la web pública.</span>
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
                    placeholder="Top Seller, Best Seller"
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
                  <button
                    type="button"
                    className="btn-autofill-amazon"
                    onClick={handleAutoFillFromAmazon}
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
                    <span>{lookupLoading ? 'Extrayendo datos de Amazon…' : 'Autorellenar desde Amazon'}</span>
                  </button>
                  {lookupError && (
                    <span className="autofill-error">
                      <AlertCircle size={13} />
                      {lookupError}
                    </span>
                  )}
                  <span className="helper-text">
                    Pega aquí tu link de afiliado completo (recomendado: amzn.to o el link que generas en Amazon
                    Associates). Se publicará tal cual, sin modificaciones, para no perder la comisión.
                  </span>
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
                  {mainImage && (
                    <button
                      type="button"
                      className="main-image-preview"
                      onClick={() => openLightbox('main', 0)}
                      title="Ampliar imagen principal"
                    >
                      <img src={mainImage} alt="Imagen principal" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                      <span>
                        <ZoomIn size={14} />
                        Ver imagen principal
                      </span>
                    </button>
                  )}
                </div>

                <div className="form-group col-span-2">
                  <label>Galería de Fotos y Videos (opcional)</label>
                  <p className="helper-text" style={{ marginTop: '-6px', marginBottom: '8px' }}>
                    El botón "Autorellenar" ya agrega todas las fotos de Amazon. También puedes pegar más imágenes y
                    videos (YouTube o .mp4) que se muestran al abrir el producto.
                  </p>

                  {galleryImages.length > 0 && (
                    <div className="gallery-list">
                      {galleryImages.map((g, i) => (
                        <div key={`${g}-${i}`} className="gallery-item">
                          <button
                            type="button"
                            className="gallery-thumb-btn"
                            onClick={() => openLightbox('gallery', i)}
                            title="Ampliar imagen"
                          >
                            <img src={g} alt={`Galería ${i + 1}`} className="gallery-thumb" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                          </button>
                          <span className="gallery-url" title={g}>{g}</span>
                          <span className="gallery-copy" title="Ampliar" onClick={() => openLightbox('gallery', i)}>
                            <ZoomIn size={14} />
                          </span>
                          <button type="button" className="gallery-remove" onClick={() => handleRemoveGalleryImage(i)} title="Quitar imagen">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="input-with-icon" style={{ marginBottom: '8px' }}>
                    <Upload size={16} className="input-icon" />
                    <input
                      type="url"
                      placeholder="https://m.media-amazon.com/images/I/... (URL de foto adicional)"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryImage(); } }}
                    />
                  </div>
                  <button type="button" className="btn-add-item" onClick={handleAddGalleryImage}>
                    <Plus size={14} />
                    Agregar Imagen
                  </button>

                  {videos.length > 0 && (
                    <div className="gallery-list" style={{ marginTop: '8px' }}>
                      {videos.map((v, i) => (
                        <div key={i} className="gallery-item">
                          <PlayCircle size={15} className="gallery-play-icon" />
                          <div className="gallery-video-info">
                            <span className="gallery-url">{v.title || v.url}</span>
                          </div>
                          <button type="button" className="gallery-remove" onClick={() => handleRemoveVideo(i)} title="Quitar video">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="video-add-row">
                    <input
                      type="url"
                      placeholder="URL del video (YouTube o .mp4)"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideo(); } }}
                    />
                    <input
                      type="text"
                      placeholder="Título (opcional)"
                      value={videoTitleInput}
                      onChange={(e) => setVideoTitleInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideo(); } }}
                    />
                    <button type="button" className="btn-add-item" onClick={handleAddVideo}>
                      <Plus size={14} />
                      Agregar Video
                    </button>
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

                <div className="aplus-header form-group col-span-2">
                  <div>
                    <label>Título A+ Content (Para Modal Desplegable)</label>
                    <button
                      type="button"
                      className="btn-ai-copy"
                      onClick={handleGenerateCopy}
                      disabled={copyLoading}
                      title="Redactar con IA un título y subtítulo atractivos"
                    >
                      {copyLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                      <span>{copyLoading ? 'Redactando con IA...' : 'Redactar con IA'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Luxury Design. Made For Real Travel."
                    value={aPlusTitle}
                    onChange={(e) => setAPlusTitle(e.target.value)}
                  />
                  {aiSuggestions && aiSuggestions.titles.length > 0 && !copyLoading && (
                    <div className="ai-suggestions">
                      <span className="ai-suggestions-label">Sugerencias de título:</span>
                      {aiSuggestions.titles.map((t, i) => (
                        <button key={i} type="button" className="ai-suggestion" onClick={() => setAPlusTitle(t)} title={t}>
                          <Sparkles size={12} />
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="aplus-header form-group col-span-2">
                  <div>
                    <label>Subtítulo o Historia A+ Content</label>
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción del producto en Amazon"
                    value={aPlusSubtitle}
                    onChange={(e) => setAPlusSubtitle(e.target.value)}
                  />
                  {aiSuggestions && aiSuggestions.subtitles.length > 0 && !copyLoading && (
                    <div className="ai-suggestions">
                      <span className="ai-suggestions-label">Sugerencias de subtítulo:</span>
                      {aiSuggestions.subtitles.map((s, i) => (
                        <button key={i} type="button" className="ai-suggestion" onClick={() => setAPlusSubtitle(s)} title={s}>
                          <Sparkles size={12} />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {copyError && (
                  <div className="form-group col-span-2">
                    <p className="form-error-text">
                      <AlertCircle size={13} />
                      {copyError}
                    </p>
                  </div>
                )}
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
                    <li><strong>Precio Referencial:</strong> {price ? `$${parseFloat(price).toFixed(2)}` : 'No definido (no se publica)'}</li>
                    <li><strong>Link Amazon:</strong> {amazonUrl}</li>
                    <li><strong>Link de Afiliado:</strong> se publica tal cual (sin modificaciones)</li>
                    <li><strong>Galería:</strong> {galleryImages.length} foto(s) adicional(es) · {videos.length} video(s)</li>
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

        .btn-autofill-amazon {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          align-self: flex-start;
          margin-top: 2px;
          background-color: #fff3e0;
          color: #b45309;
          border: 1px solid #fed7aa;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .btn-autofill-amazon:hover:not(:disabled) {
          background-color: #ffe4c4;
        }

        .btn-autofill-amazon:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .gallery-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }

        .gallery-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 6px 10px;
        }

        .gallery-thumb {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-sm);
          object-fit: contain;
          background-color: #f5f5f5;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .gallery-thumb-btn {
          padding: 0;
          border: none;
          background: none;
          cursor: zoom-in;
          display: flex;
          flex-shrink: 0;
          transition: opacity var(--transition-fast);
        }

        .gallery-thumb-btn:hover {
          opacity: 0.8;
        }

        .gallery-play-icon {
          color: #d32f2f;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .gallery-video-info {
          overflow: hidden;
        }

        .gallery-url {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gallery-remove {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: #ffebee;
          color: #c62828;
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .gallery-remove:hover {
          background: #ffcdd2;
        }

        .btn-add-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background-color: var(--bg-main);
          border: 1px dashed var(--border-color);
          color: var(--text-dark);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: var(--border-radius-pill);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-add-item:hover {
          border-color: var(--text-dark);
        }

        .video-add-row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .video-add-row input {
          flex: 1;
          min-width: 160px;
        }

        .autofill-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #c62828;
          font-size: 0.78rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        /* Lightbox del formulario */
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.75);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .lightbox {
          background-color: var(--bg-card);
          border-radius: var(--border-radius-lg);
          width: 100%;
          max-width: 640px;
          max-height: 92vh;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .lightbox-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .lightbox-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lightbox-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .lightbox-close:hover {
          background: #ffebee;
          color: #c62828;
        }

        .lightbox-stage {
          position: relative;
          background-color: #e8e8e8;
          border-radius: var(--border-radius-md);
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lightbox-stage img {
          max-width: 100%;
          max-height: 48vh;
          object-fit: contain;
          display: block;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.9);
          color: var(--text-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .lightbox-nav.prev {
          left: 10px;
        }

        .lightbox-nav.next {
          right: 10px;
        }

        .lightbox-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lightbox-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-dark);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .lightbox-action:hover {
          border-color: var(--text-dark);
        }

        .lightbox-action.primary {
          background: #e3f2fd;
          border-color: #90caf9;
          color: #1565c0;
        }

        .lightbox-action.danger {
          background: #ffebee;
          border-color: #ffcdd2;
          color: #c62828;
        }

        .lightbox-replace {
          display: flex;
          gap: 8px;
          align-items: center;
          flex: 1;
          min-width: 220px;
        }

        .lightbox-replace input {
          flex: 1;
          padding: 9px 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
          font-size: 0.8rem;
          color: var(--text-dark);
          background: var(--bg-main);
        }

        .lightbox-replace button {
          padding: 9px 14px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--text-dark);
          background: var(--text-dark);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .main-image-preview {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 6px 12px 6px 6px;
          cursor: zoom-in;
          transition: all var(--transition-fast);
        }

        .main-image-preview:hover {
          border-color: var(--text-dark);
        }

        .main-image-preview img {
          width: 42px;
          height: 42px;
          border-radius: var(--border-radius-sm);
          object-fit: contain;
          background-color: #f5f5f5;
          border: 1px solid var(--border-color);
        }

        .main-image-preview span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .gallery-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: zoom-in;
          transition: color var(--transition-fast);
        }

        .gallery-copy:hover {
          color: var(--text-dark);
        }

        /* Botón y sugerencias de IA para el copy A+ */
        .aplus-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-ai-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          margin-top: 2px;
          border-radius: var(--border-radius-pill);
          border: 1px solid #cfd8dc;
          background: linear-gradient(90deg, #e8f5e9, #e3f2fd);
          color: var(--text-dark);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-ai-copy:hover:not(:disabled) {
          border-color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .btn-ai-copy:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ai-suggestions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 2px;
        }

        .ai-suggestions-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ai-suggestion {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-dark);
          font-size: 0.8rem;
          line-height: 1.45;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .ai-suggestion svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #2e7d32;
        }

        .ai-suggestion:hover {
          border-color: #2e7d32;
          background: #f1f8e9;
        }

        .form-error-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #c62828;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>

      {/* Lightbox ampliado */}
      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-top">
              <span className="lightbox-title">
                <ZoomIn size={15} />
                {lightbox.kind === 'main'
                  ? 'Imagen Principal'
                  : `Foto ${lightbox.index + 1} de ${galleryImages.length}`}
              </span>
              <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} title="Cerrar">
                <X size={16} />
              </button>
            </div>

            <div className="lightbox-stage">
              {lightbox.kind === 'gallery' && galleryImages.length > 1 && (
                <button type="button" className="lightbox-nav prev" onClick={lightboxPrev} title="Anterior">
                  <ChevronLeft size={20} />
                </button>
              )}
              <img
                key={lightbox.kind === 'gallery' ? galleryImages[lightbox.index] : mainImage}
                src={lightbox.kind === 'gallery' ? galleryImages[lightbox.index] : mainImage}
                alt="Vista previa ampliada"
              />
              {lightbox.kind === 'gallery' && galleryImages.length > 1 && (
                <button type="button" className="lightbox-nav next" onClick={lightboxNext} title="Siguiente">
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            <div className="lightbox-actions">
              {lightbox.kind === 'gallery' && (
                <button type="button" className="lightbox-action primary" onClick={useAsMainFromLightbox} title="Establecer como imagen principal del producto">
                  <Check size={14} />
                  Usar como Principal
                </button>
              )}
              <button type="button" className="lightbox-action danger" onClick={removeFromLightbox}>
                <Trash2 size={14} />
                {lightbox.kind === 'main' ? 'Quitar principal' : 'Quitar foto'}
              </button>
              <div className="lightbox-replace">
                <input
                  type="url"
                  value={replaceUrl}
                  onChange={(e) => setReplaceUrl(e.target.value)}
                  placeholder="Cambiar por otra URL..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyReplaceFromLightbox(); } }}
                />
                <button type="button" onClick={applyReplaceFromLightbox}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
