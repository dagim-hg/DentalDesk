import React, { useState, useEffect } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  ShieldCheck, Wifi, UserCheck, HardDriveDownload, 
  AlertTriangle, Clock, RefreshCw 
} from 'lucide-react';

interface HeaderProps {
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBackup }) => {
  const { currentUser, setCurrentUser, users, appointments, exportDatabaseBackup } = useDental();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const urgentCount = appointments.filter(a => a.isUrgent && (a.status === 'ARRIVED' || a.status === 'IN_OPERATORY')).length;

  return (
    <header className="top-header">
      <div className="brand-wrapper">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C7.5 2 4 4.5 4 8c0 2.5 1.5 5 2.5 8 .5 1.5 1 3.5 2 5 1 1.5 2 1 2.5-.5.5-1.5 1-3.5 1-3.5s.5 2 1 3.5c.5 1.5 1.5 2 2.5.5 1-1.5 1.5-3.5 2-5 1-3 2.5-5.5 2.5-8 0-3.5-3.5-6-8-6z"/>
          </svg>
        </div>
        <div>
          <div className="brand-title">
            DentalDesk
            <span className="brand-badge">LAN Air-Gapped</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Clinic Local Network Server: 192.168.1.100
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Urgent Triage Notification */}
        {urgentCount > 0 && (
          <div className="status-pill" style={{ background: 'var(--danger-bg)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fecdd3' }}>
            <span className="status-dot urgent"></span>
            <AlertTriangle size={14} color="#f43f5e" />
            <span>{urgentCount} Urgent Case{urgentCount > 1 ? 's' : ''} in Queue</span>
          </div>
        )}

        {/* Air-gapped LAN indicator */}
        <div className="status-pill" title="Running completely offline over clinic Wi-Fi / LAN">
          <span className="status-dot active"></span>
          <Wifi size={14} color="var(--success)" />
          <span style={{ color: 'var(--text-secondary)' }}>LAN Autonomous</span>
        </div>

        {/* Live Clinic Clock */}
        <div className="status-pill" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <Clock size={13} color="var(--primary)" />
          <span>{time}</span>
        </div>

        {/* One-click LAN Backup Snapshot */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={exportDatabaseBackup}
          title="Save verified local database snapshot"
        >
          <HardDriveDownload size={14} color="var(--primary)" />
          <span>Export Backup</span>
        </button>

        {/* Role & Staff Persona Switcher */}
        <div className="role-switcher-card">
          <div className="role-avatar" title={currentUser.title}>
            {currentUser.avatar || currentUser.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserCheck size={12} color="var(--primary)" />
              <select
                className="role-select"
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = users.find(u => u.id === Number(e.target.value));
                  if (targetUser) setCurrentUser(targetUser);
                }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {currentUser.title}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
