import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getAdminPassword } from '../utils/storage';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentAdminPwd = getAdminPassword();
    if (password === currentAdminPwd) {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Password! Please try again.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '420px', border: '1px solid var(--border-active)' }}>
        
        <div className="modal-header-bar">
          <div className="modal-title" style={{ color: 'var(--yellow-primary)' }}>
            <Lock className="card-icon" size={22} />
            <span>Admin Authentication</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.5' }}>
            Enter your secure Admin PIN to edit master service pricing, manage shop configurations, and access admin tools.
          </p>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label><Key size={14} /> Admin Password / PIN</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                className="input-icon"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="input-hint">Default shop admin password: <strong style={{ color: 'var(--yellow-primary)' }}>stopandgo</strong></span>
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--ruby-bg)',
              border: '1px solid var(--ruby-primary)',
              color: 'var(--ruby-primary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="modal-actions-bar">
            <button type="submit" className="btn-generate-bill" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              <ShieldCheck size={18} />
              <span>Unlock Admin Controls</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
