import React, { useState } from 'react';
import { BlogPost } from '../../types/blog';
import { Product } from '../../types/product';
import { BlogEditorModal } from './BlogEditorModal';
import { BlogPostPage } from '../Blog/BlogPostPage';
import { useLockBodyScroll } from '../../lib/useLockBodyScroll';
import {
  Plus, FileText, Edit3, Trash2, ExternalLink, Calendar, Clock, AlertCircle,
  Newspaper, Check, X
} from 'lucide-react';

interface BlogManagerProps {
  posts: BlogPost[];
  products: Product[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (slug: string) => void;
  affiliateTag: string;
  onTrackClick: (product: Product) => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const BlogManager: React.FC<BlogManagerProps> = ({ posts, products, onSavePost, onDeletePost, affiliateTag, onTrackClick }) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useLockBodyScroll(!!previewSlug);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (p: BlogPost) => {
    setEditingPost(p);
    setEditorOpen(true);
  };

  const sortedPosts = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="blog-manager">
      {/* Notification Toast */}
      {notification && (
        <div className="a-toast-banner animate-fade-in">
          <Check size={17} />
          <span>{notification}</span>
        </div>
      )}

      <div className="table-wrapper-card">
        <div className="table-toolbar">
          <div>
            <h2 className="toolbar-title font-heading">Gestión del Blog</h2>
            <p className="toolbar-sub">Publica, edita o elimina las entradas y guías de compra con el editor rico y la IA.</p>
          </div>

          <div className="toolbar-actions-right">
            <button className="btn-amazon btn-publish-new" onClick={handleOpenCreate}>
              <Plus size={18} />
              <span>+ Nueva Entrada</span>
            </button>
          </div>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="blog-empty-state">
            <Newspaper size={40} />
            <h3 className="font-heading">Todavía no hay entradas publicadas</h3>
            <p>
              Crea la primera entrada del blog. Puedes escribir tu propio contenido o usar la IA para generar un borrador
              automáticamente con enlaces de afiliado a tu catálogo.
            </p>
            <button className="btn-amazon" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Crear Primera Entrada</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Entrada</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Lectura</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post) => (
                  <tr key={post.slug}>
                    <td>
                      <div className="prod-cell-info">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="table-thumb" />
                        ) : (
                          <div className="blog-thumb-placeholder">
                            <FileText size={18} />
                          </div>
                        )}
                        <div>
                          <div className="prod-cell-title font-heading">{post.title}</div>
                          <div className="prod-cell-sub">/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-sage">{post.category}</span>
                    </td>
                    <td>
                      <span className="blog-cell-date">
                        <Calendar size={12} />
                        {formatDate(post.date)}
                      </span>
                    </td>
                    <td>
                      <span className="blog-cell-meta">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="action-btn edit"
                          onClick={() => handleOpenEdit(post)}
                          title="Editar entrada"
                        >
                          <Edit3 size={15} />
                          <span>Editar</span>
                        </button>

                        <button
                          className="action-btn preview"
                          onClick={() => setPreviewSlug(post.slug)}
                          title="Ver entrada pública"
                        >
                          <ExternalLink size={15} />
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => setDeleteTarget(post)}
                          title="Eliminar entrada"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor */}
      {editorOpen && (
        <BlogEditorModal
          postToEdit={editingPost}
          products={products}
          onSavePost={(post) => {
            if (editingPost) {
              onSavePost(post);
              showNotification(`Entrada "${post.title}" actualizada.`);
            } else {
              onSavePost(post);
              showNotification(`Entrada "${post.title}" publicada en el blog.`);
            }
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-container confirm-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrapper">
              <div className="icon-circle delete">
                <Trash2 size={26} />
              </div>
            </div>
            <h3 className="confirm-title font-heading">¿Eliminar Entrada?</h3>
            <p className="confirm-desc">
              ¿Estás seguro de eliminar <strong>"{deleteTarget.title}"</strong>? La entrada se quitará de la portada del blog de forma permanente.
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm delete"
                onClick={() => {
                  onDeletePost(deleteTarget.slug);
                  showNotification(`Entrada "${deleteTarget.title}" eliminada del blog.`);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 size={16} />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista previa / Ver entrada pública en modal */}
      {previewSlug && (
        <div className="modal-backdrop" onClick={() => setPreviewSlug(null)}>
          <div className="modal-container blog-preview-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setPreviewSlug(null)} title="Cerrar vista previa">
              <X size={18} />
            </button>
            <div className="blog-preview-body">
              <BlogPostPage
                slug={previewSlug}
                posts={posts}
                affiliateTag={affiliateTag}
                onBack={() => setPreviewSlug(null)}
                onTrackClick={onTrackClick}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .a-toast-banner {
          position: fixed;
          top: 80px;
          right: 24px;
          background-color: #2e7d32;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: var(--border-radius-pill);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: var(--shadow-md);
          z-index: 1100;
        }

        .blog-empty-state {
          text-align: center;
          padding: 56px 24px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .blog-empty-state h3 {
          font-size: 1.2rem;
          color: var(--text-dark);
          margin: 4px 0 0;
        }

        .blog-empty-state p {
          max-width: 420px;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 8px;
        }

        .blog-thumb-placeholder {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-sm);
          background-color: var(--bg-main);
          border: 1px dashed var(--border-color);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .blog-cell-date, .blog-cell-meta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .action-btn.preview {
          background-color: #ede7f6;
          color: #5e35b1;
        }

        .blog-manager .confirm-modal {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 440px;
          border-radius: var(--border-radius-lg);
          padding: 32px 28px;
          text-align: center;
          position: relative;
          box-shadow: var(--shadow-lg);
        }

        .blog-preview-modal {
          background-color: var(--bg-main);
          width: 100%;
          max-width: 920px;
          height: 90vh;
          max-height: 90vh;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .blog-preview-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .blog-preview-body .blog-post {
          flex: 1;
          height: 100%;
        }

        .blog-preview-body .blog-post-header h1 {
          font-size: 1.7rem;
        }
      `}</style>
    </div>
  );
};