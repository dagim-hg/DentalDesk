import React from 'react';
import { useDental } from '../../context/DentalContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface ForbiddenViewProps {
  attemptedResource: string;
  onReturnHome: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ 
  attemptedResource, 
  onReturnHome 
}) => {
  const { currentUser } = useDental();

  return (
    <div className="card-widget" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '650px', margin: '3rem auto' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        backgroundColor: 'var(--dd-coral-bg)',
        color: 'var(--dd-coral-alert)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <Lock size={36} />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dd-text-dark)', marginBottom: '0.75rem' }}>
        403 Forbidden: Access Denied
      </h2>

      <p style={{ color: 'var(--dd-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
        Your authenticated user profile <strong>{currentUser.fullName}</strong> ({currentUser.role}) does not hold 
        authorization to access <strong>{attemptedResource}</strong> according to the DentalDesk RBAC security specification.
      </p>

      <div style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid var(--dd-border)',
        marginBottom: '2rem',
        fontSize: '0.82rem',
        color: 'var(--dd-text-muted)',
        textAlign: 'left'
      }}>
        <div><strong>Enforced Policy:</strong> Least-Privilege Air-Gapped RBAC</div>
        <div><strong>Protected Health Information (PHI) & Financial Ledger:</strong> Restricted by role</div>
        <div><strong>Audit Event:</strong> Unauthorized route traversal attempt logged to immutable audit trail</div>
      </div>

      <button className="btn-primary-teal" onClick={onReturnHome} style={{ padding: '0.65rem 1.75rem' }}>
        <ArrowLeft size={16} />
        <span>Return to Authorized Workspace</span>
      </button>
    </div>
  );
};

