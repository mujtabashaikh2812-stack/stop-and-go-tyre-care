import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, X } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default Admin Password: admin123
    if (password === 'admin123' || password === 'admin') {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Password! (Default: admin123)');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        
        <div className="modal-header-bar">
          <div className="modal-title">
            <Lock className="card-icon" size={22} />
            <span>Admin Authentication</span>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Log in as Admin to edit master service prices, change rates, and manage garage configurations.
          </p>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label><Key size={14} /> Admin Password / PIN</label>
            <input
              type="password"
              placeholder="Enter Password (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--ruby-primary)', fontSize: '0.82rem', marginBottom: '14px', fontWeight: '600' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="modal-actions-bar">
            <button type="submit" className="btn-action-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
              <span>Log In as Admin</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
