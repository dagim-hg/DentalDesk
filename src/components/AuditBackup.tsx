import React, { useRef, useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  ShieldCheck, HardDriveDownload, UploadCloud, RefreshCw, 
  Server, Wifi, Lock, CheckCircle, AlertCircle, FileText 
} from 'lucide-react';

export const AuditBackup: React.FC = () => {
  const { 
    auditLogs, exportDatabaseBackup, restoreDatabaseBackup, 
    resetToFactoryDefaults, currentUser, hasPermission 
  } = useDental();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = restoreDatabaseBackup(content);
      if (ok) {
        setRestoreStatus({ success: true, message: `Database restored successfully from ${file.name}!` });
      } else {
        setRestoreStatus({ success: false, message: 'Invalid backup file format or schema corruption.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* LAN Server & Network Status Banner */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(11, 19, 41, 0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Server size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>LAN Air-Gapped Appliance Status</h3>
              <span className="status-pill" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                ● Local Server Running
              </span>
            </div>
            <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Operating autonomously without public internet dependency. All patient data remains physically on-premises.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Local LAN IP</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>192.168.1.100:5173</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Zero-Config mDNS</div>
              <div style={{ color: 'var(--primary)', fontWeight: 600 }}>dentaldesk.local</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Local TLS (mkcert)</div>
              <div style={{ color: 'var(--success)', fontWeight: 600 }}>Trusted Local Root CA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Disaster Recovery Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <HardDriveDownload size={18} color="var(--primary)" />
              <span>Database Snapshot Export (FR-OPS-01)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Generates a verified, standalone JSON archive of all patients, appointments, tooth records, and invoices. Can be stored on USB external storage.
          </p>
          <button className="btn btn-primary" onClick={exportDatabaseBackup} style={{ width: '100%' }}>
            <HardDriveDownload size={16} />
            <span>Download Clinic Snapshot (.json)</span>
          </button>
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <UploadCloud size={18} color="var(--primary)" />
              <span>Restore Snapshot (FR-OPS-02)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Restore clinic data from an existing verified backup file in case of accidental data loss or hardware migration.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />

          <button 
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current?.click()} 
            style={{ width: '100%' }}
          >
            <UploadCloud size={16} color="var(--primary)" />
            <span>Select Backup File to Restore</span>
          </button>

          {restoreStatus && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: restoreStatus.success ? 'var(--success)' : 'var(--danger)' }}>
              {restoreStatus.message}
            </div>
          )}
        </div>

        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <RefreshCw size={18} color="var(--warning)" />
              <span>Demonstration Reset</span>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Reset all patients, queues, and invoices back to initial clinical seed state for testing and demonstration workflows.
          </p>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to factory demo defaults?')) {
                resetToFactoryDefaults();
              }
            }} 
            style={{ width: '100%' }}
          >
            <RefreshCw size={16} />
            <span>Reset Demo Records</span>
          </button>
        </div>
      </div>

      {/* Security Audit Trail (FR-AUDIT) */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <ShieldCheck size={18} color="var(--primary)" />
            <span>Immutable Security Audit Log (FR-AUDIT)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tracking all CRUD actions, patient modifications & payment receipts
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.65rem 1rem' }}>User / Role</th>
                <th style={{ padding: '0.65rem 1rem' }}>Action</th>
                <th style={{ padding: '0.65rem 1rem' }}>Entity</th>
                <th style={{ padding: '0.65rem 1rem' }}>Details</th>
                <th style={{ padding: '0.65rem 1rem' }}>LAN IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <strong style={{ color: '#fff' }}>{log.userName}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{log.userRole.replace('ROLE_', '')}</div>
                  </td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem', 
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        background: log.actionType === 'CREATE' ? 'var(--primary-glow)' : log.actionType === 'PAYMENT' ? 'var(--success-bg)' : 'var(--bg-input)',
                        color: log.actionType === 'CREATE' ? 'var(--primary)' : log.actionType === 'PAYMENT' ? 'var(--success)' : '#fff'
                      }}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>
                    {log.entityName} #{log.entityId}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
