import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { tokenStorage } from '../services/api';
import { UserRole } from '../types/dental';
import { Eye, EyeOff } from 'lucide-react';

const roleToDashboard: Record<UserRole, string> = {
  ROLE_OWNER: '/owner',
  ROLE_DENTIST: '/dentist',
  ROLE_RECEPTIONIST: '/receptionist',
  ROLE_ASSISTANT: '/receptionist',
  ROLE_ADMIN: '/owner',
};

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, currentUser } = useDental();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated → redirect to correct dashboard
  if (tokenStorage.get() && isAuthenticated) {
    return <Navigate to={roleToDashboard[currentUser.role] ?? '/login'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      const stored = localStorage.getItem('dentaldesk_db_v1_currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        navigate(roleToDashboard[user.role as UserRole] ?? '/owner', { replace: true });
      }
    } else {
      setError(result.error ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── LEFT PANEL — Brand ── */}
      <div style={{
        background: 'linear-gradient(160deg, #005963 0%, #003d44 55%, #001f24 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circle */}
        <div style={{
          position: 'absolute', bottom: -120, left: -80,
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'rgba(200,234,70,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -60, right: -100,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'rgba(200,234,70,0.05)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#c8ea46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#005963" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C7.5 2 4 4.5 4 8c0 2.5 1.5 5 2.5 8 .5 1.5 1 3.5 2 5 1 1.5 2 1 2.5-.5.5-1.5 1-3.5 1-3.5s.5 2 1 3.5c.5 1.5 1.5 2 2.5.5 1-1.5 1.5-3.5 2-5 1-3 2.5-5.5 2.5-8 0-3.5-3.5-6-8-6z" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1 }}>
              DentalDesk
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 500, marginTop: 2 }}>
              .clinic
            </div>
          </div>
        </div>

        {/* Centre Copy */}
        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(200,234,70,0.15)',
            border: '1px solid rgba(200,234,70,0.3)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#c8ea46',
            marginBottom: 20,
            letterSpacing: '0.05em',
          }}>
            CLINIC MANAGEMENT SYSTEM
          </div>
          <h1 style={{
            color: '#fff',
            fontSize: '2.6rem',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 16px',
            letterSpacing: '-0.8px',
          }}>
            Your clinic,<br />fully in control.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem',
            lineHeight: 1.65,
            maxWidth: 340,
            margin: 0,
          }}>
            Appointments, patient records, billing, and clinical charts — all in one air-gapped, secure workspace.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
            {['Role-based access', 'LAN / offline-first', 'Audit logged', 'PostgreSQL 18'].map(f => (
              <span key={f} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: '0.74rem',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500,
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', margin: 0 }}>
          All access is logged and audited · v1.0
        </p>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div style={{
        background: '#f4f6f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 52px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <h2 style={{
            fontSize: '1.55rem',
            fontWeight: 800,
            color: '#0d1117',
            margin: '0 0 6px',
            letterSpacing: '-0.4px',
          }}>
            Sign in
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 32px' }}>
            Enter your clinic credentials to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: 7,
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="e.g. dr.chen"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: error ? '1.5px solid #f87171' : '1.5px solid #dde1e7',
                  background: '#fff',
                  fontSize: '0.9rem',
                  color: '#0d1117',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#005963';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,89,99,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? '#f87171' : '#dde1e7';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: 7,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 44px 12px 14px',
                    borderRadius: 10,
                    border: error ? '1.5px solid #f87171' : '1.5px solid #dde1e7',
                    background: '#fff',
                    fontSize: '0.9rem',
                    color: '#0d1117',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#005963';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,89,99,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = error ? '#f87171' : '#dde1e7';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 13, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    padding: 2, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff1f1',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#b91c1c',
                marginBottom: 18,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 10,
                border: 'none',
                background: loading ? '#8eb8bc' : '#005963',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#006f7a'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#005963'; }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: 'spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </span>
                : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.75rem',
            marginTop: 28,
          }}>
            Contact your clinic administrator if you've forgotten your credentials.
          </p>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
