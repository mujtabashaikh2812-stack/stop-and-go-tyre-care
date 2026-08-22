import React, { useState } from 'react';
import { Wrench, Key, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginGate({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default Admin Password: admin123
    if (password === 'admin123' || password === 'admin') {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Admin Password! (Default: admin123)');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(250, 204, 21, 0.08) 0%, transparent 60%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '440px',
        width: '100%',
        padding: '36px 30px',
        boxShadow: 'var(--shadow-main)',
        textAlign: 'center'
      }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div className="logo-icon-bg" style={{ width: '64px', height: '64px', borderRadius: '16px' }}>
            <Wrench size={32} />
          </div>
        </div>

        <h1 className="brand-title" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>STOP & GO</h1>
        <p className="brand-subtitle" style={{ fontSize: '0.78rem', marginBottom: '24px' }}>TOTAL TYRE CARE CENTRE</p>

        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          🔒 <strong>Restricted Garage Access</strong><br />
          Please enter Admin password to access billing, customer records, and inventory.
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label><Key size={14} /> Admin Password / PIN</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                style={{ fontSize: '1rem', padding: '14px 16px' }}
              />
              <button
                type="button"
                className="input-icon"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <span className="input-hint">Default admin password: <strong style={{ color: 'var(--yellow-primary)' }}>admin123</strong></span>
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--ruby-bg)',
              border: '1px solid var(--ruby-primary)',
              color: 'var(--ruby-primary)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-generate-bill"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}
          >
            <ShieldCheck size={20} />
            <span>Unlock Dashboard & Billing</span>
          </button>
        </form>

      </div>
    </div>
  );
}
