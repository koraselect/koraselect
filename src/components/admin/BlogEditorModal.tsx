import React, { useRef, useState } from 'react';
import { BlogPost, BlogBlock, TextAlign } from '../../types/blog';
import { Product } from '../../types/product';
import { generatePostWithAI } from '../../lib/ai';
import { scrapeUrl, ScrapeResult } from '../../lib/scrape';
import {
  X, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronUp, ChevronDown, Trash2, Plus, Sparkles, Loader2, CheckCircle2, AlertCircle,
  Type, List, Quote, Heading2, ShoppingBag, Image as ImageIcon, Link2, Search
} from 'lucide-react';
import { AMAZON_CTA_TEXT } from '../../utils/affiliate';

interface BlogEditorModalProps {
  postToEdit?: BlogPost | null;
  products: Product[];
  onSavePost: (post: BlogPost) => void;
  onClose: () => void;
}

type BlockType = BlogBlock['type'];

const DEFAULT_BLOCKS: BlogBlock[] = [{ type: 'p', text: '' }];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

const stripHtml = (html: string) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return (el.textContent || '').trim();
};

const computeReadTime = (blocks: BlogBlock[]) => {
  let words = 0;
  for (const b of blocks) {
    if (b.type === 'product') continue;
    const texts = b.type === 'list' ? b.items : [b.text];
    for (const t of texts) {
      words += stripHtml(t || '').split(/\s+/).filter(Boolean).length;
    }
  }
  return `${Math.max(1, Math.round(words / 180))} min`;
};

const ToolbarButton: React.FC<{
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, active, disabled, children }) => (
  <button
    type="button"
    className={`tb-btn ${active ? 'tb-active' : ''}`}
    title={title}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    {children}
  </button>
);

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  postToEdit,
  products,
  onSavePost,
  onClose
}) => {
  const isEditing = !!postToEdit;

  // ---- Metadatos ----
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [slug, setSlug] = useState(postToEdit?.slug || '');
  const [category, setCategory] = useState(postToEdit?.category || 'General');
  const [date, setDate] = useState(postToEdit?.date || new Date().toISOString().slice(0, 10));
  const [coverImage, setCoverImage] = useState(postToEdit?.coverImage || '');
  const [excerpt, setExcerpt] = useState(postToEdit?.excerpt || '');

  // ---- Bloques ----
  const [blocks, setBlocks] = useState<BlogBlock[]>(
    postToEdit?.body && postToEdit.body.length ? postToEdit.body : DEFAULT_BLOCKS
  );

  // ---- IA ----
  const [topic, setTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ---- Contexto: URL de referencia ----
  const [scrapedUrlInput, setScrapedUrlInput] = useState('');
  const [scraped, setScraped] = useState<ScrapeResult | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // ---- Contexto: productos seleccionados del catálogo ----
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [pickerProduct, setPickerProduct] = useState('');

  // Refs para contentEditable
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSetTitle = (v: string) => {
    setTitle(v);
    if (!isEditing) setSlug(slugify(v));
  };

  const updateBlock = (index: number, updater: (b: BlogBlock) => BlogBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? updater(b) : b)));
  };

  const updateText = (index: number, html: string) => {
    updateBlock(index, (b) => (b.type === 'list' ? b : { ...b, text: html }));
  };

  const updateItem = (index: number, itemIndex: number, html: string) => {
    updateBlock(index, (b) => (b.type === 'list'
      ? { ...b, items: b.items.map((it, j) => (j === itemIndex ? html : it)) }
      : b));
  };

  const setAlign = (index: number, align: TextAlign) => {
    updateBlock(index, (b) => (b.type === 'list' ? { ...b, align } : { ...b, align }));
  };

  const changeType = (index: number, type: BlockType) => {
    const existing = blocks[index];
    const align = 'align' in existing ? existing.align : undefined;
    if (type === 'list') {
      const items = existing.type === 'list' ? existing.items : [stripHtml(existing.type === 'product' ? '' : existing.text) || ''];
      updateBlock(index, () => ({ type: 'list', items, align }));
    } else if (type === 'product') {
      updateBlock(index, () => ({
        type: 'product',
        title: existing.type === 'product' ? existing.title : '',
        image: existing.type === 'product' ? existing.image : '',
        excerpt: existing.type === 'product' ? existing.excerpt : '',
        amazonUrl: existing.type === 'product' ? existing.amazonUrl : ''
      }));
    } else {
      const text = existing.type === 'list'
        ? existing.items.join(' ')
        : existing.type === 'product'
          ? ''
          : existing.text;
      updateBlock(index, () => ({ type, text, align }));
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlocks = [...blocks];
    if (type === 'list') {
      newBlocks.push({ type: 'list', items: [''] });
    } else if (type === 'product') {
      newBlocks.push({ type: 'product', title: '', image: '', excerpt: '', amazonUrl: '' });
    } else {
      newBlocks.push({ type, text: '' });
    }
    setBlocks(newBlocks);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Formateo (contentEditable + execCommand)
  const runCmd = (index: number, cmd: string, value?: string, itemIndex?: number) => {
    const key = itemIndex !== undefined ? `${index}-${itemIndex}` : `${index}`;
    const el = refs.current[key];
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, value);
    if (itemIndex !== undefined) {
      updateItem(index, itemIndex, el.innerHTML);
    } else {
      updateText(index, el.innerHTML);
    }
    // Sincronizar alineación desde el estilo del elemento
    const align = el.style.textAlign as TextAlign;
    if (align) setAlign(index, align);
  };

  // Selección de producto para block product
  const selectProduct = (index: number, asin: string) => {
    const p = products.find((prod) => prod.asin === asin || prod.amazonUrl === asin);
    if (!p) return;
    updateBlock(index, () => ({
      type: 'product',
      title: p.title,
      image: p.mainImage,
      excerpt: p.subtitle || p.description,
      amazonUrl: p.amazonUrl,
      rating: p.rating,
      reviewsCount: p.reviewsCount
    }));
  };

  // ---- IA ----
  const handleGenerateAI = async () => {
    if (!title.trim() && !topic.trim()) {
      setAiMessage({ type: 'err', text: 'Escribe al menos un título o un tema para que la IA redacte el borrador.' });
      return;
    }
    setAiLoading(true);
    setAiMessage(null);
    try {
      const res = await generatePostWithAI({
        title: title || topic || 'Entrada de blog',
        topic,
        blogCategory: category,
        products,
        existingPost: postToEdit,
        scrapedUrl: scraped?.url,
        scrapedContent: scraped?.content,
        selectedProducts
      });
      if (res.success && res.blocks) {
        setBlocks(res.blocks);
        if (!title.trim()) handleSetTitle(topic.trim());
        const engineLabel = res.engine === 'gemini' ? 'Gemini (Google)' : 'Grok (Groq)';
        setAiMessage({ type: 'ok', text: `Borrador generado con ${engineLabel}. Revisa, edita y ajusta antes de guardar.` });
      } else {
        setAiMessage({ type: 'err', text: res.error || 'La IA no pudo generar el borrador.' });
      }
    } catch (e) {
      console.error(e);
      setAiMessage({ type: 'err', text: 'Error inesperado conectando con la IA.' });
    } finally {
      setAiLoading(false);
    }
  };

  // Extrae contenido desde un enlace de referencia
  const handleScrapeUrl = async () => {
    const url = scrapedUrlInput.trim();
    if (!url) {
      setScrapeError('Pega primero la URL del artículo o página de referencia.');
      return;
    }
    setScraping(true);
    setScrapeError('');
    setAiMessage(null);
    try {
      const res = await scrapeUrl(url);
      setScraped(res);
      setTopic((prev) => prev || res.title || '');
      if (!title.trim()) handleSetTitle(res.title || url);
      if (res.image && !coverImage.trim()) setCoverImage(res.image);
      setScrapedUrlInput('');
    } catch (e) {
      setScrapeError(e instanceof Error ? e.message : 'No se pudo extraer el contenido de esa página.');
    } finally {
      setScraping(false);
    }
  };

  const handleRemoveScraped = () => {
    setScraped(null);
    setScrapeError('');
  };

  // Selección de productos del catálogo como contexto
  const handleAddSelectedProduct = () => {
    if (!pickerProduct) return;
    const p = products.find((prod) => (prod.asin || prod.amazonUrl) === pickerProduct);
    if (p && !selectedProducts.some((s) => s.id === p.id)) {
      setSelectedProducts((prev) => [...prev, p]);
    }
    setPickerProduct('');
  };

  const handleRemoveSelectedProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Escribe un título para la entrada.');
      return;
    }
    if (!slug.trim()) {
      setSlug(slugify(title));
    }
    const finalPost: BlogPost = {
      slug: slug || slugify(title),
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category.trim() || 'General',
      date,
      readTime: computeReadTime(blocks),
      coverImage: coverImage.trim(),
      body: blocks.length ? blocks : DEFAULT_BLOCKS
    };
    onSavePost(finalPost);
    onClose();
  };

  const pickerOptions = products.map((p) => (
    <option key={p.id} value={p.asin || p.amazonUrl}>
      {p.title} — ${p.price.toFixed(2)}
    </option>
  ));

  const resolveSelectedProduct = (amazonUrl?: string) =>
    amazonUrl ? products.find((p) => p.amazonUrl === amazonUrl) : undefined;

  return (
    <div className="blog-editor-backdrop animate-fade-in" onClick={onClose}>
      <div className="blog-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="blog-editor-header">
          <div>
            <span className="badge-premium">{isEditing ? 'Editar Entrada' : 'Nueva Entrada de Blog'}</span>
            <h2 className="blog-editor-title font-heading">{isEditing ? `Editando: ${postToEdit.title}` : 'Publicar artículo en el Blog'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="blog-editor-body">
          {/* Panel IA */}
          <div className="ai-panel">
            <div className="ai-panel-heading">
              <Sparkles size={16} />
              <strong>Redacción con Inteligencia Artificial</strong>
              <span className="ai-engine-chip">Grok · fallback Gemini</span>
            </div>
            <div className="ai-panel-row">
              <textarea
                placeholder="Describe el tema de la entrada (ej: cómo elegir la maleta ideal para viajar ligero en familia)…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                className="ai-topic-input"
              />
              <button className="btn-ai-generate" onClick={handleGenerateAI} disabled={aiLoading}>
                {aiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                <span>{aiLoading ? 'Redactando…' : 'Redactar con IA'}</span>
              </button>
            </div>
            {aiMessage && (
              <div className={`ai-message ${aiMessage.type === 'ok' ? 'ok' : 'err'}`}>
                {aiMessage.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{aiMessage.text}</span>
              </div>
            )}

            {/* Contexto opcional: extraer desde enlace */}
            <div className="ai-context-section">
              <div className="ai-context-title">
                <Link2 size={14} />
                <strong>Contexto desde una URL de referencia <span className="ai-optional">(opcional)</span></strong>
              </div>
              <div className="ai-scrape-row">
                <input
                  type="url"
                  placeholder="Pega el enlace de un artículo o página para inspirar la redacción…"
                  value={scrapedUrlInput}
                  onChange={(e) => setScrapedUrlInput(e.target.value)}
                  className="ai-scrape-input"
                />
                <button
                  type="button"
                  className="btn-ai-grab"
                  onClick={handleScrapeUrl}
                  disabled={scraping}
                  title="Extraer el contenido de la página"
                >
                  {scraping ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
                  <span>{scraping ? 'Extrayendo…' : 'Extraer'}</span>
                </button>
              </div>
              {scrapeError && (
                <div className="ai-message err" style={{ marginTop: 8 }}>
                  <AlertCircle size={14} />
                  <span>{scrapeError}</span>
                </div>
              )}
              {scraped && (
                <div className="ai-scraped-chip">
                  <div className="ai-scraped-info">
                    <CheckCircle2 size={15} className="ai-scraped-check" />
                    <span className="ai-scraped-label">Contenido extraído:</span>
                    <span className="ai-scraped-title">
                      {scraped.title || scraped.url}
                      {scraped.content ? ` — ${scraped.content.length.toLocaleString()} caracteres` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ai-chip-remove"
                    onClick={handleRemoveScraped}
                    title="Quitar el contenido extraído"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Contexto opcional: producto del catálogo */}
            <div className="ai-context-section">
              <div className="ai-context-title">
                <ShoppingBag size={14} />
                <strong>Usar un producto publicado como contexto <span className="ai-optional">(opcional)</span></strong>
              </div>
              <div className="ai-scrape-row">
                <div className="ai-product-picker">
                  <select value={pickerProduct} onChange={(e) => setPickerProduct(e.target.value)}>
                    <option value="">— Elegir producto del catálogo —</option>
                    {pickerOptions}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn-ai-grab"
                  onClick={handleAddSelectedProduct}
                  disabled={!pickerProduct || selectedProducts.length >= 6}
                  title="Añadir producto seleccionado como contexto"
                >
                  <Plus size={15} />
                  <span>Añadir</span>
                </button>
              </div>
              {selectedProducts.length > 0 && (
                <div className="ai-selected-products">
                  {selectedProducts.map((p) => (
                    <div className="ai-product-chip" key={p.id}>
                      {p.mainImage && <img src={p.mainImage} alt="" />}
                      <span className="ai-product-chip-name" title={p.title}>{p.title}</span>
                      <span className="ai-product-chip-price">{p.price ? `$${p.price.toFixed(2)}` : ''}</span>
                      <button
                        type="button"
                        className="ai-chip-remove"
                        onClick={() => handleRemoveSelectedProduct(p.id)}
                        title="Quitar producto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadatos */}
          <div className="blog-meta-grid">
            <div className="form-group col-span-2">
              <label>Título de la Entrada *</label>
              <input type="text" placeholder="Ej: Las mejores maletas de cabina para viajar ligero" value={title} onChange={(e) => handleSetTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Slug (URL)</label>
              <input type="text" placeholder="mejores-maletas-de-cabina" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <input type="text" placeholder="Equipaje, Hidratación, Organización…" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fecha de publicación</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>URL de imagen de portada</label>
              <div className="input-with-icon">
                <ImageIcon size={16} className="input-icon" />
                <input type="url" placeholder="https://images.unsplash.com/photo-…" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
              </div>
            </div>
            <div className="form-group col-span-2">
              <label>Extracto (resumen que se muestra en la portada del blog)</label>
              <textarea rows={2} placeholder="Resumen breve de la entrada…" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>
          </div>

          {/* Portada preview */}
          {coverImage && (
            <div className="blog-cover-preview">
              <img src={coverImage} alt="Portada" />
            </div>
          )}

          {/* Editor de bloques */}
          <div className="blocks-editor">
            <div className="blocks-title">
              <Type size={16} />
              <strong>Contenido de la entrada</strong>
              <span className="blocks-hint">Usa la barra de cada bloque para negrita, cursiva, subrayado y alineación.</span>
            </div>

            {blocks.map((block, i) => {
              const refKey = String(i);
              const selectedProduct = block.type === 'product' ? resolveSelectedProduct(block.amazonUrl) : undefined;

              return (
                <div key={`${i}-${block.type}`} className={`blog-block blog-block-${block.type}`}>
                  {/* Toolbar del bloque */}
                  <div className="block-toolbar">
                    <select
                      className="block-type-select"
                      value={block.type}
                      onChange={(e) => changeType(i, e.target.value as BlockType)}
                    >
                      <option value="p">Párrafo</option>
                      <option value="h2">Subtítulo (H2)</option>
                      <option value="list">Lista</option>
                      <option value="quote">Cita</option>
                      <option value="product">Tarjeta de producto</option>
                    </select>

                    {block.type !== 'product' && (
                      <>
                        <span className="tb-divider" />
                        <ToolbarButton onClick={() => runCmd(i, 'bold')} title="Negrita">
                          <Bold size={15} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => runCmd(i, 'italic')} title="Cursiva">
                          <Italic size={15} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => runCmd(i, 'underline')} title="Subrayado">
                          <Underline size={15} />
                        </ToolbarButton>
                        <span className="tb-divider" />
                        <ToolbarButton onClick={() => runCmd(i, 'justifyLeft')} title="Alinear a la izquierda" active={block.align === 'left' || !block.align}>
                          <AlignLeft size={15} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => runCmd(i, 'justifyCenter')} title="Centrar" active={block.align === 'center'}>
                          <AlignCenter size={15} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => runCmd(i, 'justifyRight')} title="Alinear a la derecha" active={block.align === 'right'}>
                          <AlignRight size={15} />
                        </ToolbarButton>
                        <ToolbarButton onClick={() => runCmd(i, 'justifyFull')} title="Justificar" active={block.align === 'justify'}>
                          <AlignJustify size={15} />
                        </ToolbarButton>
                      </>
                    )}

                    <span className="tb-divider" />
                    <ToolbarButton onClick={() => moveBlock(i, -1)} title="Mover arriba" disabled={i === 0}>
                      <ChevronUp size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => moveBlock(i, 1)} title="Mover abajo" disabled={i === blocks.length - 1}>
                      <ChevronDown size={15} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => removeBlock(i)} title="Eliminar bloque" disabled={blocks.length === 1}>
                      <Trash2 size={15} />
                    </ToolbarButton>
                  </div>

                  {/* Contenido según tipo */}
                  {block.type === 'p' && (
                    <div
                      ref={(el) => { refs.current[refKey] = el; }}
                      className={`rte-block rte-p ${!block.text ? 'empty' : ''}`}
                      contentEditable
                      suppressContentEditableWarning={true}
                      style={{ textAlign: block.align || 'left' }}
                      onInput={(e) => updateText(i, e.currentTarget.innerHTML)}
                      onBlur={(e) => updateText(i, e.currentTarget.innerHTML)}
                      data-placeholder="Escribe un párrafo…"
                    />
                  )}

                  {block.type === 'h2' && (
                    <div
                      ref={(el) => { refs.current[refKey] = el; }}
                      className={`rte-block rte-h2 ${!block.text ? 'empty' : ''}`}
                      contentEditable
                      suppressContentEditableWarning={true}
                      style={{ textAlign: block.align || 'left' }}
                      onInput={(e) => updateText(i, e.currentTarget.innerHTML)}
                      onBlur={(e) => updateText(i, e.currentTarget.innerHTML)}
                      data-placeholder="Subtítulo…"
                    />
                  )}

                  {block.type === 'quote' && (
                    <div
                      ref={(el) => { refs.current[refKey] = el; }}
                      className={`rte-block rte-quote ${!block.text ? 'empty' : ''}`}
                      contentEditable
                      suppressContentEditableWarning={true}
                      style={{ textAlign: block.align || 'left' }}
                      onInput={(e) => updateText(i, e.currentTarget.innerHTML)}
                      onBlur={(e) => updateText(i, e.currentTarget.innerHTML)}
                      data-placeholder="Cita destacada…"
                    />
                  )}

                  {block.type === 'list' && (
                    <div className="rte-list-wrap">
                      {block.items.map((item, j) => (
                        <div key={j} className="rte-list-item">
                          <span className="list-bullet">•</span>
                          <div
                            ref={(el) => { refs.current[`${i}-${j}`] = el; }}
                            className={`rte-block rte-li ${!item ? 'empty' : ''}`}
                            contentEditable
                            suppressContentEditableWarning={true}
                            style={{ textAlign: block.align || 'left' }}
                            onInput={(e) => updateItem(i, j, e.currentTarget.innerHTML)}
                            onBlur={(e) => updateItem(i, j, e.currentTarget.innerHTML)}
                            data-placeholder="Elemento de la lista…"
                          />
                          <button
                            type="button"
                            className="list-del-btn"
                            onClick={() => {
                              if (block.items.length === 1) return;
                              updateBlock(i, (b) => (b.type === 'list' ? { ...b, items: b.items.filter((_, x) => x !== j) } : b));
                            }}
                            title="Quitar elemento"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="list-add-btn"
                        onClick={() => updateBlock(i, (b) => (b.type === 'list' ? { ...b, items: [...b.items, ''] } : b))}
                      >
                        <Plus size={13} />
                        <span>Añadir elemento</span>
                      </button>
                    </div>
                  )}

                  {block.type === 'product' && (
                    <div className="product-block-editor">
                      <div className="form-group">
                        <label>Selecciona un producto del catálogo *</label>
                        <div className="input-with-icon">
                          <ShoppingBag size={16} className="input-icon" />
                          <select
                            value={selectedProduct ? (selectedProduct.asin || selectedProduct.amazonUrl) : ''}
                            onChange={(e) => selectProduct(i, e.target.value)}
                          >
                            <option value="">— Elegir producto publicado —</option>
                            {pickerOptions}
                          </select>
                        </div>
                      </div>
                      {block.title && block.amazonUrl ? (
                        <div className="product-block-detail">
                          <img src={block.image} alt={block.title} />
                          <div>
                            <strong>{block.title}</strong>
                            <span className="product-block-price">{selectedProduct?.price ? `$${selectedProduct.price.toFixed(2)}` : ''}</span>
                            <span className="product-block-link">{AMAZON_CTA_TEXT}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="product-block-empty">
                          <ShoppingBag size={20} />
                          <span>El bloque mostrará la tarjeta del producto elegido con su enlace de afiliado.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Añadir bloque */}
          <div className="block-add-row">
            <span>Añadir bloque:</span>
            <button className="btn-add-mini" onClick={() => addBlock('p')} title="Párrafo"><Type size={14} /> Párrafo</button>
            <button className="btn-add-mini" onClick={() => addBlock('h2')} title="Subtítulo"><Heading2 size={14} /> Subtítulo</button>
            <button className="btn-add-mini" onClick={() => addBlock('list')} title="Lista"><List size={14} /> Lista</button>
            <button className="btn-add-mini" onClick={() => addBlock('quote')} title="Cita"><Quote size={14} /> Cita</button>
            <button className="btn-add-mini" onClick={() => addBlock('product')} title="Tarjeta de producto"><ShoppingBag size={14} /> Producto</button>
          </div>
        </div>

        {/* Footer */}
        <div className="blog-editor-footer">
          <div className="editor-hint">
            Tiempo de lectura estimado: <strong>{computeReadTime(blocks)}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-amazon btn-save-blog" onClick={handleSave}>
              <Save size={16} />
              <span>{isEditing ? 'Guardar Cambios' : 'Publicar Entrada'}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .blog-editor-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0,0,0,0.68);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }

        .blog-editor-modal {
          background-color: #ffffff;
          width: 100%;
          max-width: 860px;
          border-radius: var(--border-radius-lg);
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          margin: auto 0;
        }

        .blog-editor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-card-subtle);
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
        }

        .blog-editor-title {
          font-size: 1.5rem;
          margin-top: 6px;
        }

        .blog-editor-body {
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          max-height: 62vh;
        }

        .modal-close-btn {
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
          color: #fff;
        }

        .ai-panel {
          background: linear-gradient(135deg, #f5f3ff, #fdf4ff);
          border: 1px solid #d8d4f0;
          border-radius: var(--border-radius-md);
          padding: 16px;
        }

        .ai-panel-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          margin-bottom: 10px;
          color: #4c1d95;
        }

        .ai-engine-chip {
          background: #6d28d9;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--border-radius-pill);
          margin-left: auto;
        }

        .ai-panel-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }

        .ai-topic-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d8d4f0;
          border-radius: var(--border-radius-md);
          font-family: var(--font-body);
          font-size: 0.88rem;
          resize: vertical;
        }

        .btn-ai-generate {
          background: #6d28d9;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .btn-ai-generate:hover { background: #5b21b6; }
        .btn-ai-generate:disabled { opacity: 0.7; cursor: not-allowed; }

        .ai-message {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
        }

        .ai-message.ok { background: #e8f5e9; color: #2e7d32; }
        .ai-message.err { background: #ffebee; color: #c62828; }

        .ai-context-section {
          border-top: 1px dashed #d8d4f0;
          margin-top: 12px;
          padding-top: 12px;
        }

        .ai-context-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.83rem;
          color: #5b21b6;
          margin-bottom: 8px;
        }

        .ai-optional {
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.72rem;
          margin-left: 4px;
        }

        .ai-scrape-row {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }

        .ai-scrape-input {
          flex: 1;
          padding: 9px 12px;
          border: 1px solid #d8d4f0;
          border-radius: var(--border-radius-md);
          font-family: var(--font-body);
          font-size: 0.84rem;
        }

        .ai-product-picker {
          flex: 1;
        }

        .ai-product-picker select {
          width: 100%;
          height: 100%;
          padding: 9px 12px;
          border: 1px solid #d8d4f0;
          border-radius: var(--border-radius-md);
          background: #fff;
          font-family: var(--font-body);
          font-size: 0.84rem;
          color: var(--text-dark);
        }

        .btn-ai-grab {
          background: #ffffff;
          color: #5b21b6;
          border: 1px solid #c4b5fd;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 9px 14px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .btn-ai-grab:hover { background: #f5f3ff; }
        .btn-ai-grab:disabled { opacity: 0.5; cursor: not-allowed; }

        .ai-scraped-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          background: #f5f3ff;
          border: 1px solid #e9d5ff;
          border-radius: var(--border-radius-md);
          padding: 8px 12px;
          font-size: 0.8rem;
        }

        .ai-scraped-info {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .ai-scraped-check { color: #16a34a; flex-shrink: 0; }

        .ai-scraped-label {
          color: var(--text-muted);
          font-weight: 600;
          flex-shrink: 0;
        }

        .ai-scraped-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }

        .ai-chip-remove {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .ai-chip-remove:hover { background: #ffebee; color: #c62828; }

        .ai-selected-products {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }

        .ai-product-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f5f3ff;
          border: 1px solid #e9d5ff;
          border-radius: var(--border-radius-md);
          padding: 6px 10px;
          font-size: 0.82rem;
        }

        .ai-product-chip img {
          width: 36px;
          height: 30px;
          object-fit: cover;
          border-radius: 5px;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .ai-product-chip-name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
        }

        .ai-product-chip-price {
          color: var(--text-dark);
          font-weight: 700;
          flex-shrink: 0;
        }

        .spin { animation: be-spin 0.8s linear infinite; }
        @keyframes be-spin { to { transform: rotate(360deg); } }

        .blog-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .col-span-2 { grid-column: span 2; }

        .blog-cover-preview img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
        }

        .blocks-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          margin-bottom: 12px;
        }

        .blocks-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-left: 4px;
        }

        .blog-block {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          margin-bottom: 14px;
          overflow: hidden;
          background: #fff;
        }

        .block-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 10px;
          background-color: var(--bg-main);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
        }

        .block-type-select {
          padding: 6px 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-pill);
          background: #fff;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .tb-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dark);
          background: transparent;
          transition: all var(--transition-fast);
        }

        .tb-btn:hover { background: #fff; box-shadow: var(--shadow-sm); }
        .tb-btn.tb-active { background: var(--text-dark); color: #fff; }
        .tb-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .tb-divider {
          width: 1px;
          height: 20px;
          background: var(--border-color);
          margin: 0 4px;
        }

        .rte-block {
          min-height: 40px;
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-dark);
          outline: none;
        }

        .rte-block:focus { box-shadow: inset 0 0 0 2px rgba(30,30,30,0.1); }

        .rte-p { font-size: 0.97rem; }
        .rte-h2 { font-size: 1.25rem; font-weight: 700; }
        .rte-quote {
          font-style: italic;
          background: var(--bg-card);
          border-left: 4px solid var(--text-dark);
          margin: 4px;
          border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
        }

        .rte-block.empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          opacity: 0.5;
          pointer-events: none;
        }

        .rte-list-wrap {
          padding: 8px 14px;
        }

        .rte-list-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 2px 0;
        }

        .list-bullet {
          color: var(--color-amazon);
          font-weight: 700;
          margin-top: 2px;
        }

        .rte-li {
          flex: 1;
          min-height: 28px;
          padding: 4px 4px;
          font-size: 0.95rem;
        }

        .list-del-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }

        .list-del-btn:hover { background: #ffebee; color: #c62828; }

        .list-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-dark);
          padding: 6px 12px;
          border-radius: var(--border-radius-pill);
          margin: 6px 0 4px;
        }

        .list-add-btn:hover { background: var(--bg-main); }

        .product-block-editor {
          padding: 14px;
        }

        .product-block-detail {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 12px;
          margin-top: 10px;
        }

        .product-block-detail img {
          width: 64px;
          height: 54px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .product-block-detail div {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
        }

        .product-block-price { font-weight: 700; color: var(--text-dark); }
        .product-block-link { font-size: 0.74rem; color: #e68100; font-weight: 600; }

        .product-block-empty {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.85rem;
          background: var(--bg-main);
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 16px;
          margin-top: 10px;
        }

        .block-add-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .blog-editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 28px;
          border-top: 1px solid var(--border-color);
        }

        .editor-hint {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .btn-save-blog {
          padding: 11px 22px;
        }

        @media (max-width: 700px) {
          .blog-meta-grid { grid-template-columns: 1fr; }
          .col-span-2 { grid-column: span 1; }
          .ai-panel-row { flex-direction: column; }
          .ai-scrape-row { flex-direction: column; }
          .btn-ai-grab { justify-content: center; }
        }
      `}</style>
    </div>
  );
};