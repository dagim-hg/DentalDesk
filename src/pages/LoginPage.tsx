import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { tokenStorage } from '../services/api';
import { UserRole } from '../types/dental';
import { Eye, EyeOff, Stethoscope, Shield, UserCheck } from 'lucide-react';

const roleToDashboard: Record<UserRole, string> = {
  ROLE_OWNER: '/owner',
  ROLE_DENTIST: '/dentist',
  ROLE_RECEPTIONIST: '/receptionist',
  ROLE_ASSISTANT: '/receptionist',
  ROLE_ADMIN: '/owner',
};

interface QuickCard {
  label: string;
  icon: React.ReactNode;
  username: string;
  password: string;
  role: UserRole;
  color: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    label: 'Owner / Manager',
    icon: <Shield size={22} />,
    username: 'marcus.v',
    password: 'Owner@123',
    role: 'ROLE_OWNER',
    color: 'var(--dd-primary-teal)',
  },
  {
    label: 'Dentist',
    icon: <Stethoscope size={22} />,
    username: 'dr.chen',
    password: 'Dentist@123',
    role: 'ROLE_DENTIST',
    color: '#0f766e',
  },
  {
    label: 'Receptionist',
    icon: <UserCheck size={22} />,
    username: 'elena.r',
    password: 'Reception@123',
    role: 'ROLE_RECEPTIONIST',
    color: '#0369a1',
  },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, currentUser } = useDental();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in → redirect immediately
  const token = tokenStorage.get();
  if (token && isAuthenticated) {
    const dest = roleToDashboard[currentUser.role] ?? '/login';
    return <Navigate to={dest} replace />;
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
      // Context has updated currentUser — read it fresh from localStorage
      const stored = localStorage.getItem('dentaldesk_db_v1_currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        const dest = roleToDashboard[user.role as UserRole] ?? '/owner';
        navigate(dest, { replace: true });
      }
    } else {
      setError(result.error ?? 'Invalid credentials. Please try again.');
    }
  };

  const handleQuickLogin = async (card: QuickCard) => {
    setLoading(true);
    setError('');
    const result = await login(card.username, card.password);
    setLoading(false);
    if (result.success) {
      navigate(roleToDashboard[card.role], { replace: true });
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--dd-primary-teal) 0%, #003d44 60%, #001a1d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'var(--dd-accent-lime)',
            marginBottom: 16,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--dd-primary-teal)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C7.5 2 4 4.5 4 8c0 2.5 1.5 5 2.5 8 .5 1.5 1 3.5 2 5 1 1.5 2 1 2.5-.5.5-1.5 1-3.5 1-3.5s.5 2 1 3.5c.5 1.5 1.5 2 2.5.5 1-1.5 1.5-3.5 2-5 1-3 2.5-5.5 2.5-8 0-3.5-3.5-6-8-6z"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            DentalDesk
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: '0.95rem' }}>
            Clinic Management System — Secure Sign-In
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '36px 36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dd-text-dark)', marginBottom: 6 }}>
            Sign in to your workspace
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)', marginBottom: 24 }}>
            Use your clinic credentials below, or tap a quick-access card.
          </p>

          {/* Quick-Access Role Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            {QUICK_CARDS.map((card) => (
              <button
                key={card.role}
                onClick={() => handleQuickLogin(card)}
                disabled={loading}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 8px',
                  borderRadius: 12,
                  border: '2px solid #e8ecf0',
                  background: '#f8fafc',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = card.color;
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0fafa';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8ecf0';
                  (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: card.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--dd-text-dark)', textAlign: 'center', lineHeight: 1.3 }}>
                  {card.label}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', fontWeight: 500 }}>or sign in manually</span>
            <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
          </div>

          {/* Credential Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dd-text-dark)', display: 'block', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. marcus.v"
                autoComplete="username"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #dde1e7',
                  fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--dd-primary-teal)'}
                onBlur={(e) => e.target.style.borderColor = '#dde1e7'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dd-text-dark)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your clinic password"
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 42px 11px 14px', borderRadius: 10,
                    border: '1.5px solid #dde1e7',
                    fontSize: '0.9rem', outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--dd-primary-teal)'}
                  onBlur={(e) => e.target.style.borderColor = '#dde1e7'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--dd-text-muted)', padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 14px',
                fontSize: '0.82rem', color: '#b91c1c',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                border: 'none',
                background: loading ? '#8eb8bc' : 'var(--dd-primary-teal)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: 20 }}>
          DentalDesk — Air-Gapped LAN · All access is logged and audited
        </p>
      </div>
    </div>
  );
};

