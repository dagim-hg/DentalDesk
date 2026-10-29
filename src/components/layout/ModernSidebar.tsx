import React from 'react';
import { useDental } from '../../context/DentalContext';
import { 
  LayoutDashboard, Users, Calendar, Activity, 
  DollarSign, BarChart3, Package, ShieldCheck, 
  UserCheck, LogOut, FileText, Pill, Stethoscope, 
  Armchair, Clock, Layers 
} from 'lucide-react';

interface ModernSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  currentTab, 
  onTabChange,
  onOpenLoginModal 
}) => {
  const { currentUser, logout, appointments, inventory } = useDental();
  const role = currentUser.role;

  const waitingCount = appointments.filter(a => a.status === 'ARRIVED').length;
  const inOperatoryCount = appointments.filter(a => a.status === 'IN_OPERATORY').length;
  const lowStockCount = inventory.filter(i => i.currentStock <= i.reorderThreshold).length;

  return (
    <aside className="modern-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-tooth-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C7.5 2 4 4.5 4 8c0 2.5 1.5 5 2.5 8 .5 1.5 1 3.5 2 5 1 1.5 2 1 2.5-.5.5-1.5 1-3.5 1-3.5s.5 2 1 3.5c.5 1.5 1.5 2 2.5.5 1-1.5 1.5-3.5 2-5 1-3 2.5-5.5 2.5-8 0-3.5-3.5-6-8-6z"/>
          </svg>
        </div>
        <div className="brand-text-logo">
          DentalDesk <span>.clinic</span>
        </div>
      </div>

      {/* Nav Items Tailored to Role */}
      <nav className="sidebar-nav">
        {/* Main Dashboard item (active pill matching screenshot) */}
        <button
          className={`nav-pill-btn ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
        >
          <LayoutDashboard size={18} />
          <span>
            {role === 'ROLE_OWNER' && 'Executive Dashboard'}
            {role === 'ROLE_DENTIST' && 'Clinical Workspace'}
            {role === 'ROLE_RECEPTIONIST' && 'Front Desk Queue'}
            {role === 'ROLE_ASSISTANT' && 'Assistant Station'}
          </span>
        </button>

        {/* 1. OWNER NAVIGATION */}
        {role === 'ROLE_OWNER' && (
          <>
            <div className="nav-section-title">CLINIC</div>
            <button
              className={`nav-pill-btn ${currentTab === 'patients' ? 'active' : ''}`}
              onClick={() => onTabChange('patients')}
            >
              <Users size={18} />
              <span>Patients</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'appointments' ? 'active' : ''}`}
              onClick={() => onTabChange('appointments')}
            >
              <Calendar size={18} />
              <span>Appointments</span>
              {inOperatoryCount > 0 && (
                <span className="nav-counter-pill">{inOperatoryCount} in chair</span>
              )}
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'chart' ? 'active' : ''}`}
              onClick={() => onTabChange('chart')}
            >
              <Activity size={18} />
              <span>Treatments & Chart</span>
            </button>

            <div className="nav-section-title">FINANCE</div>
            <button
              className={`nav-pill-btn ${currentTab === 'billing' ? 'active' : ''}`}
              onClick={() => onTabChange('billing')}
            >
              <DollarSign size={18} />
              <span>Billing & Payments</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'fees' ? 'active' : ''}`}
              onClick={() => onTabChange('fees')}
            >
              <FileText size={18} />
              <span>Service & Fees</span>
            </button>

            <div className="nav-section-title">MANAGEMENT</div>
            <button
              className={`nav-pill-btn ${currentTab === 'staff' ? 'active' : ''}`}
              onClick={() => onTabChange('staff')}
            >
              <UserCheck size={18} />
              <span>Team & Roles</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'inventory' ? 'active' : ''}`}
              onClick={() => onTabChange('inventory')}
            >
              <Package size={18} />
              <span>Supplies</span>
              {lowStockCount > 0 && (
                <span className="nav-counter-pill" style={{ background: '#fecdd3', color: '#9f1239' }}>{lowStockCount}</span>
              )}
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'audits' ? 'active' : ''}`}
              onClick={() => onTabChange('audits')}
            >
              <ShieldCheck size={18} />
              <span>LAN & Audits</span>
            </button>
          </>
        )}

        {/* 2. DENTIST NAVIGATION */}
        {role === 'ROLE_DENTIST' && (
          <>
            <div className="nav-section-title">CLINIC WORKSPACE</div>
            <button
              className={`nav-pill-btn ${currentTab === 'queue' ? 'active' : ''}`}
              onClick={() => onTabChange('queue')}
            >
              <Clock size={18} />
              <span>Patient Queue</span>
              {waitingCount > 0 && (
                <span className="nav-counter-pill">{waitingCount}</span>
              )}
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'chart' ? 'active' : ''}`}
              onClick={() => onTabChange('chart')}
            >
              <Activity size={18} />
              <span>Odontogram & Chart</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'patients' ? 'active' : ''}`}
              onClick={() => onTabChange('patients')}
            >
              <Users size={18} />
              <span>Patient Records</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'appointments' ? 'active' : ''}`}
              onClick={() => onTabChange('appointments')}
            >
              <Calendar size={18} />
              <span>My Schedule</span>
            </button>

            <div className="nav-section-title">CLINICAL SUPPLIES</div>
            <button
              className={`nav-pill-btn ${currentTab === 'inventory' ? 'active' : ''}`}
              onClick={() => onTabChange('inventory')}
            >
              <Package size={18} />
              <span>Material Usage</span>
            </button>
          </>
        )}

        {/* 3. RECEPTIONIST NAVIGATION */}
        {role === 'ROLE_RECEPTIONIST' && (
          <>
            <div className="nav-section-title">FRONT DESK</div>
            <button
              className={`nav-pill-btn ${currentTab === 'queue' ? 'active' : ''}`}
              onClick={() => onTabChange('queue')}
            >
              <Clock size={18} />
              <span>Waiting Queue</span>
              {waitingCount > 0 && (
                <span className="nav-counter-pill">{waitingCount}</span>
              )}
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'appointments' ? 'active' : ''}`}
              onClick={() => onTabChange('appointments')}
            >
              <Calendar size={18} />
              <span>Schedule & Booking</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'patients' ? 'active' : ''}`}
              onClick={() => onTabChange('patients')}
            >
              <Users size={18} />
              <span>Patient Intake</span>
            </button>

            <div className="nav-section-title">CASHIER & BILLING</div>
            <button
              className={`nav-pill-btn ${currentTab === 'billing' ? 'active' : ''}`}
              onClick={() => onTabChange('billing')}
            >
              <DollarSign size={18} />
              <span>Billing & Payments</span>
            </button>
            <button
              className={`nav-pill-btn ${currentTab === 'reconciliation' ? 'active' : ''}`}
              onClick={() => onTabChange('reconciliation')}
            >
              <FileText size={18} />
              <span>Daily Shift Close</span>
            </button>
          </>
        )}
      </nav>

      {/* User Footer Card */}
      <div className="sidebar-user-footer">
        <div className="user-footer-info">
          <div className="user-avatar-circle">
            {currentUser.avatar || currentUser.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="user-name-role">
            <span className="user-name-title">{currentUser.fullName}</span>
            <span className="user-role-badge">
              {role === 'ROLE_OWNER' && 'Clinic Owner'}
              {role === 'ROLE_DENTIST' && 'Lead Dentist'}
              {role === 'ROLE_RECEPTIONIST' && 'Receptionist'}
              {role === 'ROLE_ASSISTANT' && 'Dental Assistant'}
            </span>
          </div>
        </div>

        <button 
          onClick={onOpenLoginModal} 
          title="Sign in with different credentials"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dd-text-muted)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

