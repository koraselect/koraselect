import React, { useState } from 'react';
import { Lock, User, Key, ShoppingBag, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('neostore2026');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'neostore2026') {
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas. Pruebe usuario: admin | contraseña: neostore2026');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        {/* Back to store button */}
        <button className="back-store-btn" onClick={onReturnToStore}>
          <ArrowLeft size={16} />
          <span>Volver a la Tienda</span>
        </button>

        <div className="login-header" onClick={onReturnToStore} style={{ cursor: 'pointer' }} title="Ir a la Portada Principal (Landing)">
          <div className="login-logo-circle">
            <ShoppingBag size={24} />
          </div>
          <h1 className="login-title font-heading">Portal Administrativo</h1>
          <p className="login-sub">Gestión de Productos & Colecciones de Amazon Afiliados</p>
        </div>

        {/* Suggested credentials badge */}
        <div className="credentials-info-box">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-600" />
            <strong>Credenciales por defecto:</strong>
          </div>
          <div className="creds-row">
            <span>Usuario: <code>admin</code></span>
            <span>Contraseña: <code>neostore2026</code></span>
          </div>
          <button type="button" className="btn-quick-fill" onClick={handleQuickFill}>
            Autocompletar Credenciales
          </button>
        </div>

        {error && (
          <div className="login-error-alert">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario de Administrador</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-editorial btn-login-submit">
            <Lock size={18} />
            <span>Ingresar al Panel Admin</span>
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background-color: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 460px;
          box-shadow: var(--shadow-lg);
          position: relative;
        }

        .back-store-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          transition: color var(--transition-fast);
        }

        .back-store-btn:hover {
          color: var(--text-dark);
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-logo-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: var(--text-dark);
          color: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px auto;
        }

        .login-title {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }

        .login-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .credentials-info-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 14px 16px;
          border-radius: var(--border-radius-md);
          font-size: 0.82rem;
          margin-bottom: 24px;
        }

        .creds-row {
          display: flex;
          gap: 16px;
          margin: 8px 0 10px 0;
          color: var(--text-dark);
        }

        .creds-row code {
          background-color: #fff3e0;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        .btn-quick-fill {
          background-color: var(--text-dark);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--border-radius-pill);
        }

        .login-error-alert {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 14px;
          border-radius: var(--border-radius-sm);
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .btn-login-submit {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};
