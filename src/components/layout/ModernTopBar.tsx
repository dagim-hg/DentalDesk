import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { Search, Calendar, Wifi, AlertTriangle, ChevronDown } from 'lucide-react';

interface ModernTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ModernTopBar: React.FC<ModernTopBarProps> = ({ 
  searchQuery, 
  onSearchChange,
}) => {
  const { currentUser, appointments, isServerConnected } = useDental();
  const [dateRange] = useState('01 Apr 2026 - 01 Sep 2026');

  const urgentCount = appointments.filter(
    a => a.isUrgent && (a.status === 'ARRIVED' || a.status === 'IN_OPERATORY')
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = currentUser.fullName.split(' ')[0];

  return (
    <div className="modern-topbar">
      {/* Greeting (matches screenshot layout) */}
      <div className="topbar-greeting" style={{ display: 'none' }}>
        {greeting}, {firstName}!
      </div>

      {/* Search Bar pill */}
      <div className="search-pill-container">
        <Search size={18} color="var(--dd-text-subtle)" />
        <input
          type="text"
          placeholder="Search for anything (patient, appointment, service)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right Controls */}
      <div className="topbar-controls">
        {/* Urgent Triage Warning */}
        {urgentCount > 0 && (
          <div className="pill-badge urgent" title="Emergency / Urgent triage queue">
            <AlertTriangle size={14} />
            <span>{urgentCount} Urgent Patient{urgentCount > 1 ? 's' : ''} in Queue</span>
          </div>
        )}

        {/* PostgreSQL LAN status */}
        <div 
          className="pill-badge" 
          style={{ 
            backgroundColor: isServerConnected ? 'var(--dd-success-bg)' : '#fef3c7',
            color: isServerConnected ? 'var(--dd-success)' : '#d97706'
          }}
          title={isServerConnected ? 'PostgreSQL 18 Connected on local LAN' : 'Offline Cache'}
        >
          <Wifi size={13} />
          <span>{isServerConnected ? 'PostgreSQL 18 Live' : 'Offline Cache'}</span>
        </div>

        {/* Date Range Pill */}
        <div className="date-range-pill">
          <Calendar size={14} color="var(--dd-primary-teal)" />
          <span>{dateRange}</span>
          <span className="date-range-badge-tag">Last 6 Months</span>
          <ChevronDown size={14} color="var(--dd-text-muted)" />
        </div>
      </div>
    </div>
  );
};
