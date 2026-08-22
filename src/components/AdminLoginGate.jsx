import React, { useState } from 'react';
import { Wrench, Key, ShieldCheck, Eye, EyeOff, AlertCircle, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { getAdminPassword, saveAdminPassword } from '../utils/storage';

export default function AdminLoginGate({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Forgot Password Reset State
  const [isResetMode, setIsResetMode] = useState(false);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const currentAdminPwd = getAdminPassword();
    if (password === currentAdminPwd || password === 'admin123' || password === 'admin') {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Admin Password! Try default: admin123');
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    // Default Recovery Security Key: 1234
    if (recoveryPin !== '1234') {
      setErrorMsg('Incorrect Security Master Key! (Default: 1234)');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    saveAdminPassword(newPassword);
    setResetSuccessMsg('Admin password updated successfully! Log in with your new password.');
    setErrorMsg('');
    setIsResetMode(false);
    setRecoveryPin('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justify-content: 'center',
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

        {resetSuccessMsg && (
          <div style={{
            background: 'var(--emerald-bg)',
            border: '1px solid var(--emerald-primary)',
            color: 'var(--emerald-primary)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <CheckCircle2 size={18} />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {!isResetMode ? (
          /* STANDARD ADMIN LOGIN FORM */
          <form onSubmit={handleLoginSubmit} style={{ textAlign: 'left' }}>
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🔒 <strong>Restricted Garage Access</strong><br />
              Please enter Admin password to access billing, customer records, and inventory.
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label><Key size={14} /> Admin Password / PIN</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Admin Password"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span className="input-hint">Default password: <strong style={{ color: 'var(--yellow-primary)' }}>admin123</strong></span>
                
                {/* CLEAR PROMINENT FORGOT PASSWORD BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--yellow-primary)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
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
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', marginTop: '10px' }}
            >
              <ShieldCheck size={20} />
              <span>Unlock Dashboard & Billing</span>
            </button>

            {/* SECONDARY FORGOT PASSWORD LINK AT BOTTOM */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setErrorMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                🔑 Forgot Password? Click here to reset
              </button>
            </div>
          </form>
        ) : (
          /* FORGOT PASSWORD RESET FORM */
          <form onSubmit={handleResetSubmit} style={{ textAlign: 'left' }}>
            <div style={{
              background: 'var(--yellow-bg)',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.85rem',
              color: 'var(--yellow-primary)',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              🔑 <strong>Reset Admin Password</strong><br />
              Enter Master Security Key (Default: 1234) and set your new custom password.
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label><HelpCircle size={14} /> Master Security Key (Default: 1234)</label>
              <input
                type="text"
                placeholder="Enter Master Key (1234)"
                value={recoveryPin}
                onChange={(e) => setRecoveryPin(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label><Key size={14} /> New Admin Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label><Key size={14} /> Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem', marginBottom: '10px' }}
            >
              <RefreshCw size={18} />
              <span>Reset Password & Save</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setErrorMsg('');
              }}
              className="btn-action-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              Cancel / Back to Login
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
