import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { 
  BarChart3, Users, Clock, Activity, DollarSign, 
  TrendingUp, AlertCircle, ShieldCheck, UserPlus, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { UserRole } from '../../types/dental';

interface OwnerDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, appointments, visits, financialReports, 
    staffUsers, updateStaffUser, createStaffUser, serviceCatalog 
  } = useDental();

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    username: '',
    fullName: '',
    role: 'ROLE_DENTIST' as UserRole,
    title: 'Associate Dentist',
    email: '',
    phone: '',
    password: 'DentalDesk@2026'
  });

  // Pull KPIs from backend financial report or computed fallbacks
  const prod = financialReports?.productionKpis || {
    totalAppointments: Math.max(appointments.length, 1423),
    totalAppointmentsTrend: '+12%',
    treatmentsDone: Math.max(visits.length, 1280),
    treatmentsDoneTrend: '+13%',
    averageChairTime: 42,
    averageChairTimeTrend: '-2%',
    reappointmentRate: 42,
    reappointmentRateTrend: '+3%'
  };

  const clin = financialReports?.clinicalKpis || {
    onTimeRate: 92.4,
    retreatmentRate: 2.9,
    complicationRate: 1.7,
    complicationAlert: 'Post-treatment complications reached 1.7% this month.',
    successRate: 96.2
  };

  const fin = financialReports?.financialSnapshot || {
    totalInvoiced: 552500,
    totalCollected: 552500,
    expenses: 235300,
    profitMargin: 42,
    monthlyBreakdown: [
      { month: 'Apr', revenue: 142000, expenses: 72000 },
      { month: 'May', revenue: 98000, expenses: 54000 },
      { month: 'Jun', revenue: 110000, expenses: 80000 },
      { month: 'Jul', revenue: 115000, expenses: 49000 },
      { month: 'Aug', revenue: 148000, expenses: 102000 },
      { month: 'Sep', revenue: 135000, expenses: 44000 }
    ]
  };

  const pts = financialReports?.patientsOverview || {
    newPatients: 1423,
    returningPatients: 204,
    satisfactionScore: 4.6,
    ratioNew: 55,
    ratioReturning: 35,
    ratioOther: 10
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.username || !newStaffForm.fullName) return;
    try {
      await createStaffUser(newStaffForm);
      setShowAddStaffModal(false);
      setNewStaffForm({
        username: '',
        fullName: '',
        role: 'ROLE_DENTIST',
        title: 'Associate Dentist',
        email: '',
        phone: '',
        password: 'DentalDesk@2026'
      });
    } catch (err: any) {
      alert('Error creating staff: ' + err.message);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await updateStaffUser(userId, { role: newRole });
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  return (
    <div>
      {/* Greeting Title */}
      <div className="greeting-section">
        <h1 className="greeting-text">Good Morning, {currentUser.fullName.split(' ')[0]}!</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => onNavigateTab('audits')}>
            <ShieldCheck size={15} color="var(--dd-primary-teal)" />
            <span>LAN Appliance Status</span>
          </button>
          <button className="btn-primary-teal" onClick={() => setShowAddStaffModal(true)}>
            <UserPlus size={15} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Production KPIs Card - Row of 4 metrics matching screenshot */}
      <div className="card-widget">
        <div className="card-widget-header">
          <div className="card-widget-title">
            <Activity size={18} color="var(--dd-primary-teal)" />
            <span>Production KPIs</span>
          </div>
          <button className="card-view-all-link" onClick={() => onNavigateTab('appointments')}>
            <span>View all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="kpi-grid-row">
          {/* Metric 1 */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label">
              <Users size={14} />
              <span>Total Appointments</span>
            </div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{prod.totalAppointments}</span>
              <span className="trend-badge">
                <ArrowUpRight size={13} />
                <span>{prod.totalAppointmentsTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label">
              <Activity size={14} />
              <span>Treatments Done</span>
            </div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{prod.treatmentsDone}</span>
              <span className="trend-badge">
                <ArrowUpRight size={13} />
                <span>{prod.treatmentsDoneTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label">
              <Clock size={14} />
              <span>Average Chair Time</span>
            </div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{prod.averageChairTime} min</span>
              <span className="trend-badge down">
                <ArrowDownRight size={13} />
                <span>{prod.averageChairTimeTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label">
              <TrendingUp size={14} />
              <span>Reappointment Rate</span>
            </div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{prod.reappointmentRate}%</span>
              <span className="trend-badge">
                <ArrowUpRight size={13} />
                <span>{prod.reappointmentRateTrend}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Clinical KPIs (Left) & Financial Snapshot (Right) */}
      <div className="dashboard-columns-2">
        {/* Left: Clinical KPIs with Circular Gauges */}
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Activity size={18} color="var(--dd-primary-teal)" />
              <span>Clinical KPIs</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)' }}>
              Success Rate: <strong style={{ color: 'var(--dd-text-dark)' }}>{clin.successRate}%</strong>
            </span>
          </div>

          {/* Dual circular ring meters matching screenshot */}
          <div className="gauges-container">
            {/* On-Time Gauge (Vibrant Lime) */}
            <div className="gauge-item">
              <svg width="130" height="130" className="gauge-circle-svg">
                <circle cx="65" cy="65" r="50" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle 
                  cx="65" 
                  cy="65" 
                  r="50" 
                  stroke="var(--dd-accent-lime)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="314" 
                  strokeDashoffset={314 - (314 * clin.onTimeRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="gauge-text-overlay">
                <div className="gauge-label">On-time</div>
                <div className="gauge-percentage">{clin.onTimeRate}%</div>
              </div>
            </div>

            {/* Re-treatment Gauge (Deep Teal) */}
            <div className="gauge-item">
              <svg width="110" height="110" className="gauge-circle-svg">
                <circle cx="55" cy="55" r="42" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                <circle 
                  cx="55" 
                  cy="55" 
                  r="42" 
                  stroke="var(--dd-primary-teal)" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * clin.retreatmentRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="gauge-text-overlay">
                <div className="gauge-label">Re-treatment</div>
                <div className="gauge-percentage">{clin.retreatmentRate}%</div>
              </div>
            </div>
          </div>

          {/* Alert Notice Banner matching screenshot */}
          <div className="alert-notice-banner">
            <AlertCircle size={16} />
            <span>{clin.complicationAlert}</span>
          </div>
        </div>

        {/* Right: Financial Snapshot Dual Bar Chart */}
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <DollarSign size={18} color="var(--dd-primary-teal)" />
              <span>Financial Snapshot</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)' }}>
              Profit Margin: <strong style={{ color: 'var(--dd-text-dark)' }}>{fin.profitMargin}%</strong>
            </span>
          </div>

          {/* Legend matching screenshot */}
          <div className="financial-legend" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="legend-dot" style={{ backgroundColor: 'var(--dd-accent-lime)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>Revenue:</span>
              <span style={{ fontWeight: 700 }}>${fin.totalCollected.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="legend-dot" style={{ backgroundColor: 'var(--dd-primary-teal)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>Expenses:</span>
              <span style={{ fontWeight: 700 }}>${fin.expenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Dual Bar Chart */}
          <div className="financial-bars-chart">
            {fin.monthlyBreakdown.map((m) => {
              const maxVal = 160000;
              const revHeight = Math.min(130, Math.round((m.revenue / maxVal) * 130));
              const expHeight = Math.min(130, Math.round((m.expenses / maxVal) * 130));
              return (
                <div key={m.month} className="bar-month-group">
                  <div className="dual-bars">
                    <div 
                      className="bar-column bar-revenue" 
                      style={{ height: `${revHeight}px` }}
                      title={`Revenue: $${m.revenue.toLocaleString()}`}
                    ></div>
                    <div 
                      className="bar-column bar-expenses" 
                      style={{ height: `${expHeight}px` }}
                      title={`Expenses: $${m.expenses.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="month-label">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Patients Overview & Staff Role Management */}
      <div className="dashboard-columns-2">
        {/* Patients Overview */}
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Users size={18} color="var(--dd-primary-teal)" />
              <span>Patients Overview</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)' }}>
              Satisfaction Score: <strong style={{ color: 'var(--dd-text-dark)' }}>{pts.satisfactionScore}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1.25rem 0' }}>
            {/* Visual Circles matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '10px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.25rem', color: 'var(--dd-text-dark)'
              }}>
                55%
              </div>
              <div style={{
                width: 75, height: 75, borderRadius: '50%',
                backgroundColor: 'var(--dd-primary-teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem', color: '#ffffff'
              }}>
                35%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="legend-dot" style={{ backgroundColor: 'var(--dd-accent-lime)' }}></span>
                  New Patients
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{pts.newPatients}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="legend-dot" style={{ backgroundColor: 'var(--dd-primary-teal)' }}></span>
                  Returning
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{pts.returningPatients}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff & Role Management */}
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Users size={18} color="var(--dd-primary-teal)" />
              <span>Team & Role Assignment</span>
            </div>
            <button className="card-view-all-link" onClick={() => setShowAddStaffModal(true)}>
              <span>+ Add staff</span>
            </button>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role Assignment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="user-avatar-circle" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>
                        {u.avatar || u.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--dd-border-strong)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        color: 'var(--dd-text-dark)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ROLE_OWNER">Owner / Manager</option>
                      <option value="ROLE_DENTIST">Dentist</option>
                      <option value="ROLE_RECEPTIONIST">Receptionist</option>
                      <option value="ROLE_ASSISTANT">Dental Assistant</option>
                    </select>
                  </td>
                  <td>
                    <span className="pill-badge active">
                      <CheckCircle2 size={12} />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="modal-overlay" onClick={() => setShowAddStaffModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create New Staff Account</h3>
              <button className="btn-outline" onClick={() => setShowAddStaffModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan"
                  value={newStaffForm.fullName}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. arthur.c"
                  value={newStaffForm.username}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Role Assignment
                </label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as UserRole })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                >
                  <option value="ROLE_DENTIST">Dentist (Clinical Provider)</option>
                  <option value="ROLE_RECEPTIONIST">Receptionist (Front Desk)</option>
                  <option value="ROLE_ASSISTANT">Dental Assistant</option>
                  <option value="ROLE_OWNER">Owner / Managing Partner</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Associate Orthodontist"
                  value={newStaffForm.title}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAddStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

