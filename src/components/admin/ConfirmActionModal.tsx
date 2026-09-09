import React from 'react';
import { AlertTriangle, Copy, Trash2, X, Check } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  type: 'duplicate' | 'delete' | 'reset';
  itemTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  type,
  itemTitle,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isDuplicate = type === 'duplicate';

  const title = isDelete
    ? '¿Eliminar Producto?'
    : isDuplicate
    ? '¿Duplicar Producto?'
    : '¿Restablecer Catálogo Ejemplo?';

  const description = isDelete
    ? `¿Estás seguro de eliminar "${itemTitle}"? Esta acción removerá el producto del catálogo público de Amazon Afiliados.`
    : isDuplicate
    ? `Se creará un clon idéntico de "${itemTitle}" con el sufijo (Copia) para que puedas editar sus variaciones o precio.`
    : 'Se borrarán los cambios actuales y se restaurará la colección original de demostración.';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container confirm-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="confirm-icon-wrapper">
          {isDelete ? (
            <div className="icon-circle delete">
              <Trash2 size={26} />
            </div>
          ) : isDuplicate ? (
            <div className="icon-circle duplicate">
              <Copy size={26} />
            </div>
          ) : (
            <div className="icon-circle reset">
              <AlertTriangle size={26} />
            </div>
          )}
        </div>

        <h3 className="confirm-title font-heading">{title}</h3>
        <p className="confirm-desc">{description}</p>

        <div className="confirm-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn-confirm ${isDelete ? 'delete' : isDuplicate ? 'duplicate' : 'reset'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isDelete ? (
              <>
                <Trash2 size={16} />
                <span>Sí, Eliminar</span>
              </>
            ) : isDuplicate ? (
              <>
                <Copy size={16} />
                <span>Sí, Duplicar</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Sí, Restablecer</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .confirm-modal {
          background-color: var(--bg-card);
          width: 100%;
          max-width: 440px;
          border-radius: var(--border-radius-lg);
          padding: 32px 28px;
          text-align: center;
          position: relative;
          box-shadow: var(--shadow-lg);
        }

        .confirm-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle.delete {
          background-color: #ffebee;
          color: #c62828;
        }

        .icon-circle.duplicate {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .icon-circle.reset {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        .confirm-title {
          font-size: 1.4rem;
          margin-bottom: 8px;
          color: var(--text-dark);
        }

        .confirm-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-confirm {
          padding: 10px 20px;
          border-radius: var(--border-radius-pill);
          font-weight: 600;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          transition: transform var(--transition-fast);
        }

        .btn-confirm:hover {
          transform: translateY(-2px);
        }

        .btn-confirm.delete {
          background-color: #c62828;
        }

        .btn-confirm.duplicate {
          background-color: #1565c0;
        }

        .btn-confirm.reset {
          background-color: #ef6c00;
        }
      `}</style>
    </div>
  );
};
