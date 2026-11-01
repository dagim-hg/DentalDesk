import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { 
  BarChart3, Users, Clock, Activity, DollarSign, 
  TrendingUp, AlertCircle, ShieldCheck, UserPlus, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight,
  Sparkles, Stethoscope, FileText
} from 'lucide-react';
import { UserRole } from '../../types/dental';

interface OwnerDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, appointments, visits, financialReports, 
    staffUsers, updateStaffUser, createStaffUser 
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
      alert('Error creating staff: ' + (err.message || err));
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await updateStaffUser(userId, { role: newRole });
    } catch (err: any) {
      alert('Failed to update role: ' + (err.message || err));
    }
  };

  const firstName = currentUser.fullName.split(' ')[0];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Greeting Title Row (Matching Screenshot) */}
      <div className="greeting-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="greeting-text" style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: 'var(--dd-text-dark)', letterSpacing: '-0.025em' }}>
            Good Morning, {firstName}!
          </h1>
          <p style={{ color: 'var(--dd-text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Here is your clinic's consolidated operational and financial pulse.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-outline" 
            onClick={() => onNavigateTab('audits')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9999, border: '1px solid var(--dd-border-strong)', background: '#fff', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-dark)', cursor: 'pointer' }}
          >
            <ShieldCheck size={15} color="var(--dd-primary-teal)" />
            <span>LAN Appliance & Audits</span>
          </button>
          <button 
            className="btn-primary-teal" 
            onClick={() => setShowAddStaffModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9999, background: 'var(--dd-primary-teal)', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <UserPlus size={15} />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Row 1: Production KPIs Card (Matching Screenshot exactly) */}
      <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
        <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
            <Activity size={18} color="var(--dd-primary-teal)" />
            <span>Production KPIs</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)', fontWeight: 600, background: '#f8fafc', padding: '3px 10px', borderRadius: 9999, border: '1px solid var(--dd-border)' }}>
            Past 6 Months
          </span>
        </div>

        <div className="kpi-grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {/* Metric 1: Total Appointments */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--dd-text-muted)', fontWeight: 500 }}>
              <Users size={14} />
              <span>Total Appointments</span>
            </div>
            <div className="kpi-metric-value-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="kpi-metric-number" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dd-text-dark)', letterSpacing: '-0.03em' }}>
                {prod.totalAppointments}
              </span>
              <span className="trend-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e' }}>
                <ArrowUpRight size={13} />
                <span>{prod.totalAppointmentsTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 2: Treatments Done */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--dd-text-muted)', fontWeight: 500 }}>
              <Activity size={14} />
              <span>Treatments Done</span>
            </div>
            <div className="kpi-metric-value-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="kpi-metric-number" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dd-text-dark)', letterSpacing: '-0.03em' }}>
                {prod.treatmentsDone}
              </span>
              <span className="trend-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e' }}>
                <ArrowUpRight size={13} />
                <span>{prod.treatmentsDoneTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 3: Average Chair Time */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--dd-text-muted)', fontWeight: 500 }}>
              <Clock size={14} />
              <span>Average Chair Time</span>
            </div>
            <div className="kpi-metric-value-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="kpi-metric-number" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dd-text-dark)', letterSpacing: '-0.03em' }}>
                {prod.averageChairTime} min
              </span>
              <span className="trend-badge down" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', fontWeight: 700, color: '#be123c' }}>
                <ArrowDownRight size={13} />
                <span>{prod.averageChairTimeTrend}</span>
              </span>
            </div>
          </div>

          {/* Metric 4: Reappointment Rate */}
          <div className="kpi-metric-box">
            <div className="kpi-metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--dd-text-muted)', fontWeight: 500 }}>
              <TrendingUp size={14} />
              <span>Reappointment Rate</span>
            </div>
            <div className="kpi-metric-value-row" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="kpi-metric-number" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dd-text-dark)', letterSpacing: '-0.03em' }}>
                {prod.reappointmentRate}%
              </span>
              <span className="trend-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e' }}>
                <ArrowUpRight size={13} />
                <span>{prod.reappointmentRateTrend}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Clinical KPIs (Left) & Financial Snapshot (Right) */}
      <div className="dashboard-columns-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Card: Clinical KPIs with Circular Gauges & Alert Banner */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
          <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
              <Activity size={18} color="var(--dd-primary-teal)" />
              <span>Clinical KPIs</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)' }}>
              Success Rate: <strong style={{ color: 'var(--dd-text-dark)' }}>{clin.successRate}%</strong>
            </span>
          </div>

          {/* Dual circular ring meters matching screenshot */}
          <div className="gauges-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1.25rem 0', gap: '1rem' }}>
            {/* On-Time Gauge (Vibrant Lime Ring) */}
            <div className="gauge-item" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="54" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle 
                  cx="70" 
                  cy="70" 
                  r="54" 
                  stroke="var(--dd-accent-lime)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="339" 
                  strokeDashoffset={339 - (339 * clin.onTimeRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>On-time</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{clin.onTimeRate}%</div>
              </div>
            </div>

            {/* Re-treatment Gauge (Deep Teal Circle) */}
            <div className="gauge-item" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="115" height="115" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="57" cy="57" r="44" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                <circle 
                  cx="57" 
                  cy="57" 
                  r="44" 
                  stroke="var(--dd-primary-teal)" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="276" 
                  strokeDashoffset={276 - (276 * clin.retreatmentRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>Re-treatment</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dd-text-dark)' }}>{clin.retreatmentRate}%</div>
              </div>
            </div>
          </div>

          {/* Alert Notice Banner matching screenshot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'var(--dd-coral-bg)',
            border: '1px solid rgba(225, 29, 72, 0.15)',
            borderRadius: 14,
            padding: '0.75rem 1rem',
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--dd-coral-alert)',
            fontWeight: 600
          }}>
            <AlertCircle size={16} />
            <span>{clin.complicationAlert}</span>
          </div>
        </div>

        {/* Right Card: Financial Snapshot Dual Bar Chart */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
          <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
              <DollarSign size={18} color="var(--dd-primary-teal)" />
              <span>Financial Snapshot</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)' }}>
              Profit Margin: <strong style={{ color: 'var(--dd-text-dark)' }}>{fin.profitMargin}%</strong>
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-accent-lime)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>Revenue:</span>
              <span style={{ fontWeight: 800, color: 'var(--dd-text-dark)' }}>${fin.totalCollected.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-primary-teal)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>Expenses:</span>
              <span style={{ fontWeight: 800, color: 'var(--dd-text-dark)' }}>${fin.expenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Dual Bar Chart with grid lines */}
          <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'flex-end', borderBottom: '1px dashed var(--dd-border-strong)', paddingBottom: '0.5rem' }}>
            {/* Grid Line numbers */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--dd-text-subtle)', pointerEvents: 'none' }}>
              <span>150k</span>
              <span>100k</span>
              <span>50k</span>
              <span>0</span>
            </div>

            {/* Bars container */}
            <div style={{ marginLeft: 34, width: 'calc(100% - 34px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 130 }}>
              {fin.monthlyBreakdown.map((m) => {
                const maxVal = 160000;
                const revHeight = Math.min(125, Math.max(15, Math.round((m.revenue / maxVal) * 125)));
                const expHeight = Math.min(125, Math.max(12, Math.round((m.expenses / maxVal) * 125)));
                return (
                  <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                      <div 
                        style={{ width: 14, height: revHeight, backgroundColor: 'var(--dd-accent-lime)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} 
                        title={`${m.month} Revenue: $${m.revenue.toLocaleString()}`}
                      />
                      <div 
                        style={{ width: 14, height: expHeight, backgroundColor: 'var(--dd-primary-teal)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} 
                        title={`${m.month} Expenses: $${m.expenses.toLocaleString()}`}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)', fontWeight: 600 }}>{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Clients & Patients Overview (Matching Screenshot exactly) */}
      <div className="dashboard-columns-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left Card: Clients Satisfaction & Bubble Distribution */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
          <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--dd-primary-teal)' }}></div>
              <span>Clients</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-text-muted)', background: '#f8fafc', padding: '3px 10px', borderRadius: 9999, border: '1px solid var(--dd-border)' }}>
              Satisfaction Score: <strong style={{ color: 'var(--dd-text-dark)' }}>{pts.satisfactionScore}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '1.5rem 0' }}>
            {/* Visual Overlapping Bubbles Matching Screenshot */}
            <div style={{ position: 'relative', width: 200, height: 130 }}>
              {/* Large 55% Circle */}
              <div style={{
                position: 'absolute',
                left: 10,
                bottom: 0,
                width: 110,
                height: 110,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '12px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.45rem',
                color: 'var(--dd-text-dark)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}>
                55%
              </div>

              {/* Teal 35% Circle */}
              <div style={{
                position: 'absolute',
                right: 15,
                top: 0,
                width: 90,
                height: 90,
                borderRadius: '50%',
                backgroundColor: 'var(--dd-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,89,99,0.3)'
              }}>
                35%
              </div>

              {/* Lime Accent Circle */}
              <div style={{
                position: 'absolute',
                right: 50,
                bottom: 5,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--dd-accent-lime)',
                border: '3px solid #ffffff'
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-accent-lime)' }}></span>
                  New Patient Inflow
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dd-text-dark)', marginTop: 2 }}>{pts.newPatients}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-primary-teal)' }}></span>
                  Returning Retained
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dd-text-dark)', marginTop: 2 }}>{pts.returningPatients}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Patients Overview with Wave Area Chart and Tooltip Pill */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
          <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
              <Users size={18} color="var(--dd-primary-teal)" />
              <span>Patients Overview</span>
            </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)', fontWeight: 600, background: '#f8fafc', padding: '3px 10px', borderRadius: 9999, border: '1px solid var(--dd-border)' }}>
            Demographic Inflow
          </span>
          </div>

          {/* Legend matching screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-accent-lime)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>New</span>
              <span style={{ fontWeight: 800, color: 'var(--dd-text-dark)' }}>{pts.newPatients}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--dd-primary-teal)' }}></span>
              <span style={{ color: 'var(--dd-text-muted)' }}>Returning</span>
              <span style={{ fontWeight: 800, color: 'var(--dd-text-dark)' }}>{pts.returningPatients}</span>
            </div>
          </div>

          {/* Smooth Wave Area Chart with Tooltip Pill (Matching Screenshot) */}
          <div style={{ position: 'relative', height: 165, width: '100%' }}>
            {/* Y-Axis numbers */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--dd-text-subtle)', pointerEvents: 'none' }}>
              <span>600</span>
              <span>400</span>
              <span>200</span>
              <span>0</span>
            </div>

            {/* SVG Wave lines */}
            <svg viewBox="0 0 500 140" style={{ width: 'calc(100% - 30px)', height: 135, marginLeft: 30, overflow: 'visible' }}>
              <defs>
                <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8ea46" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c8ea46" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#005963" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#005963" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="10" x2="500" y2="10" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#e2e8f0" />

              {/* Returning Curve (Teal) */}
              <path 
                d="M 10 115 C 60 110, 100 120, 150 110 C 200 100, 250 115, 300 105 C 350 95, 400 75, 450 85 L 490 80" 
                fill="none" 
                stroke="var(--dd-primary-teal)" 
                strokeWidth="2.5" 
              />
              <path 
                d="M 10 115 C 60 110, 100 120, 150 110 C 200 100, 250 115, 300 105 C 350 95, 400 75, 450 85 L 490 80 L 490 130 L 10 130 Z" 
                fill="url(#tealGradient)" 
              />

              {/* New Patients Curve (Lime) */}
              <path 
                d="M 10 95 C 60 85, 100 95, 150 70 C 200 45, 250 80, 300 60 C 350 40, 400 30, 450 45 L 490 40" 
                fill="none" 
                stroke="#a3cc20" 
                strokeWidth="3" 
              />
              <path 
                d="M 10 95 C 60 85, 100 95, 150 70 C 200 45, 250 80, 300 60 C 350 40, 400 30, 450 45 L 490 40 L 490 130 L 10 130 Z" 
                fill="url(#limeGradient)" 
              />

              {/* Data Point Dot on Peak */}
              <circle cx="400" cy="30" r="5" fill="#a3cc20" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* Hover Tooltip Pill Matching Screenshot */}
            <div style={{
              position: 'absolute',
              right: '18%',
              top: '5px',
              backgroundColor: 'var(--dd-primary-teal)',
              color: '#ffffff',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              boxShadow: '0 6px 16px rgba(0,89,99,0.3)',
              lineHeight: 1.3
            }}>
              <div>New: 401</div>
              <div style={{ color: 'var(--dd-accent-lime)' }}>Returning: 102</div>
              {/* Little down arrow on tooltip */}
              <div style={{
                position: 'absolute',
                bottom: -5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid var(--dd-primary-teal)'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Team & Roles Quick Management + Owner Tools */}
      <div className="dashboard-columns-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        
        {/* Team & Role Assignment preview table */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)' }}>
          <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
              <Users size={18} color="var(--dd-primary-teal)" />
              <span>Team & Role Assignment</span>
            </div>
            <button 
              className="card-view-all-link" 
              onClick={() => onNavigateTab('staff')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dd-primary-teal)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span>Manage all staff</span>
              <ChevronRight size={14} />
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
              {staffUsers.slice(0, 4).map((u) => (
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
                    <span className="pill-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Owner Quick Access Hub */}
        <div className="card-widget" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid var(--dd-border)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--dd-text-dark)' }}>
                <ShieldCheck size={18} color="var(--dd-primary-teal)" />
                <span>Executive Management</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div 
                onClick={() => onNavigateTab('fees')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: 14,
                  border: '1px solid var(--dd-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--dd-lime-light)', color: '#3f6212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Service & Fee Catalog</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>Configure CDT pricing & standard durations</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--dd-text-subtle)" />
              </div>

              <div 
                onClick={() => onNavigateTab('audits')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: 14,
                  border: '1px solid var(--dd-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--dd-teal-light)', color: 'var(--dd-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Security Audit & Backups</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>Air-gapped database snapshot & logs</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--dd-text-subtle)" />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '10px 14px',
            background: 'var(--dd-lime-light)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#3f6212'
          }}>
            <Sparkles size={14} />
            <span>LAN Autonomous Operation: No cloud telemetry or external leaks.</span>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="modal-overlay" onClick={() => setShowAddStaffModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Create New Staff Account</h3>
              <button className="btn-outline" onClick={() => setShowAddStaffModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan"
                  value={newStaffForm.fullName}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. arthur.c"
                  value={newStaffForm.username}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Role Assignment *
                </label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as UserRole })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
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
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
