import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { Shield, KeyRound, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types/dental';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, switchUserDemo, users } = useDental();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await login(username, password);
    setIsLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleQuickDemoLogin = async (userObj: any) => {
    setIsLoading(true);
    setError(null);
    await switchUserDemo(userObj);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            backgroundColor: 'var(--dd-lime-light)',
            color: '#4d6600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C7.5 2 4 4.5 4 8c0 2.5 1.5 5 2.5 8 .5 1.5 1 3.5 2 5 1 1.5 2 1 2.5-.5.5-1.5 1-3.5 1-3.5s.5 2 1 3.5c.5 1.5 1.5 2 2.5.5 1-1.5 1.5-3.5 2-5 1-3 2.5-5.5 2.5-8 0-3.5-3.5-6-8-6z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>DentalDesk Authentication</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)', marginTop: '0.25rem' }}>
            Local Area Network (LAN) Air-Gapped Secure Portal
          </p>
        </div>

        {error && (
          <div className="alert-notice-banner" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Switcher Demo Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dd-text-subtle)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Quick 1-Click Role Sign In
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickDemoLogin(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1px solid var(--dd-border)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="user-avatar-circle" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                    {u.avatar || u.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--dd-text-muted)' }}>{u.title}</div>
                  </div>
                </div>
                <span className={`pill-badge ${u.role === 'ROLE_OWNER' ? 'lime' : u.role === 'ROLE_DENTIST' ? 'teal' : 'active'}`}>
                  {u.role.replace('ROLE_', '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--dd-border)' }}></div>
          <span style={{ fontSize: '0.72rem', color: 'var(--dd-text-subtle)', fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--dd-border)' }}></div>
        </div>

        {/* Username & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dd-text-dark)', display: 'block', marginBottom: '0.35rem' }}>
              Username
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}>
              <User size={16} color="var(--dd-text-subtle)" />
              <input
                type="text"
                required
                placeholder="e.g. marcus.v, dr.chen, elena.r"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dd-text-dark)', display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}>
              <Lock size={16} color="var(--dd-text-subtle)" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-teal" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

