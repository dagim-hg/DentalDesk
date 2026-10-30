import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDental } from '../../context/DentalContext';
import { 
  LayoutDashboard, Users, Calendar, Activity, 
  DollarSign, BarChart3, Package, ShieldCheck, 
  UserCheck, LogOut, FileText, Stethoscope, 
  Clock, Layers 
} from 'lucide-react';

interface ModernSidebarProps {
  baseRoute: string; // e.g. '/owner' | '/dentist' | '/receptionist'
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ baseRoute }) => {
  const { currentUser, logout, appointments, inventory } = useDental();
  const navigate = useNavigate();
  const location = useLocation();
  const role = currentUser.role;

  const waitingCount = appointments.filter(a => a.status === 'ARRIVED').length;
  const inOperatoryCount = appointments.filter(a => a.status === 'IN_OPERATORY').length;
  const lowStockCount = inventory.filter(i => i.currentStock <= i.reorderThreshold).length;

  /** Navigate to a sub-route, e.g. go('/patients') → '/owner/patients' */
  const go = (sub?: string) => navigate(sub ? `${baseRoute}/${sub}` : baseRoute);

  /** True when current pathname matches exactly or starts with baseRoute/sub */
  const isActive = (sub?: string) => {
    const target = sub ? `${baseRoute}/${sub}` : baseRoute;
    if (!sub) {
      // Only active on the exact base (e.g. /owner, not /owner/patients)
      return location.pathname === baseRoute || location.pathname === `${baseRoute}/`;
    }
    return location.pathname.startsWith(target);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
        {/* Dashboard Home */}
        <button
          className={`nav-pill-btn ${isActive() ? 'active' : ''}`}
          onClick={() => go()}
        >
          <LayoutDashboard size={18} />
          <span>
            {role === 'ROLE_OWNER' && 'Executive Dashboard'}
            {role === 'ROLE_DENTIST' && 'Clinical Workspace'}
            {role === 'ROLE_RECEPTIONIST' && 'Front Desk Queue'}
            {role === 'ROLE_ASSISTANT' && 'Assistant Station'}
          </span>
        </button>

        {/* ── OWNER NAVIGATION ── */}
        {role === 'ROLE_OWNER' && (
          <>
            <div className="nav-section-title">CLINIC</div>
            <button className={`nav-pill-btn ${isActive('patients') ? 'active' : ''}`} onClick={() => go('patients')}>
              <Users size={18} /><span>Patients</span>
            </button>
            <button className={`nav-pill-btn ${isActive('appointments') ? 'active' : ''}`} onClick={() => go('appointments')}>
              <Calendar size={18} /><span>Appointments</span>
              {inOperatoryCount > 0 && (
                <span className="nav-counter-pill">{inOperatoryCount} in chair</span>
              )}
            </button>
            <button className={`nav-pill-btn ${isActive('chart') ? 'active' : ''}`} onClick={() => go('chart')}>
              <Activity size={18} /><span>Treatments & Chart</span>
            </button>

            <div className="nav-section-title">FINANCE</div>
            <button className={`nav-pill-btn ${isActive('billing') ? 'active' : ''}`} onClick={() => go('billing')}>
              <DollarSign size={18} /><span>Billing & Payments</span>
            </button>
            <button className={`nav-pill-btn ${isActive('fees') ? 'active' : ''}`} onClick={() => go('fees')}>
              <FileText size={18} /><span>Service & Fees</span>
            </button>

            <div className="nav-section-title">MANAGEMENT</div>
            <button className={`nav-pill-btn ${isActive('staff') ? 'active' : ''}`} onClick={() => go('staff')}>
              <UserCheck size={18} /><span>Team & Roles</span>
            </button>
            <button className={`nav-pill-btn ${isActive('inventory') ? 'active' : ''}`} onClick={() => go('inventory')}>
              <Package size={18} /><span>Supplies</span>
              {lowStockCount > 0 && (
                <span className="nav-counter-pill" style={{ background: '#fecdd3', color: '#9f1239' }}>{lowStockCount}</span>
              )}
            </button>
            <button className={`nav-pill-btn ${isActive('audits') ? 'active' : ''}`} onClick={() => go('audits')}>
              <ShieldCheck size={18} /><span>LAN & Audits</span>
            </button>
          </>
        )}

        {/* ── DENTIST NAVIGATION ── */}
        {role === 'ROLE_DENTIST' && (
          <>
            <div className="nav-section-title">CLINIC WORKSPACE</div>
            <button className={`nav-pill-btn ${isActive('queue') ? 'active' : ''}`} onClick={() => go('queue')}>
              <Clock size={18} /><span>Patient Queue</span>
              {waitingCount > 0 && <span className="nav-counter-pill">{waitingCount}</span>}
            </button>
            <button className={`nav-pill-btn ${isActive('chart') ? 'active' : ''}`} onClick={() => go('chart')}>
              <Activity size={18} /><span>Odontogram & Chart</span>
            </button>
            <button className={`nav-pill-btn ${isActive('patients') ? 'active' : ''}`} onClick={() => go('patients')}>
              <Users size={18} /><span>Patient Records</span>
            </button>
            <button className={`nav-pill-btn ${isActive('appointments') ? 'active' : ''}`} onClick={() => go('appointments')}>
              <Calendar size={18} /><span>My Schedule</span>
            </button>

            <div className="nav-section-title">CLINICAL SUPPLIES</div>
            <button className={`nav-pill-btn ${isActive('inventory') ? 'active' : ''}`} onClick={() => go('inventory')}>
              <Package size={18} /><span>Material Usage</span>
            </button>
          </>
        )}

        {/* ── RECEPTIONIST NAVIGATION ── */}
        {role === 'ROLE_RECEPTIONIST' && (
          <>
            <div className="nav-section-title">FRONT DESK</div>
            <button className={`nav-pill-btn ${isActive('queue') ? 'active' : ''}`} onClick={() => go('queue')}>
              <Clock size={18} /><span>Waiting Queue</span>
              {waitingCount > 0 && <span className="nav-counter-pill">{waitingCount}</span>}
            </button>
            <button className={`nav-pill-btn ${isActive('appointments') ? 'active' : ''}`} onClick={() => go('appointments')}>
              <Calendar size={18} /><span>Schedule & Booking</span>
            </button>
            <button className={`nav-pill-btn ${isActive('patients') ? 'active' : ''}`} onClick={() => go('patients')}>
              <Users size={18} /><span>Patient Intake</span>
            </button>

            <div className="nav-section-title">CASHIER & BILLING</div>
            <button className={`nav-pill-btn ${isActive('billing') ? 'active' : ''}`} onClick={() => go('billing')}>
              <DollarSign size={18} /><span>Billing & Payments</span>
            </button>
            <button className={`nav-pill-btn ${isActive('reconciliation') ? 'active' : ''}`} onClick={() => go('reconciliation')}>
              <FileText size={18} /><span>Daily Shift Close</span>
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
          onClick={handleLogout} 
          title="Sign out"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dd-text-muted)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
