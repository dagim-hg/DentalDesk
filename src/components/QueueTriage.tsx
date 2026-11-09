import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  Users, UserPlus, Clock, AlertTriangle, ArrowRight, 
  CheckCircle2, Stethoscope, Armchair, Activity, X, 
  Phone, Calendar, AlertCircle
} from 'lucide-react';
import { AppointmentStatus, Patient } from '../types/dental';

interface QueueTriageProps {
  onNavigateToChart: (patient: Patient) => void;
  onNavigateToBilling?: (patientId: number) => void;
}

export const QueueTriage: React.FC<QueueTriageProps> = ({ 
  onNavigateToChart, 
  onNavigateToBilling 
}) => {
  const { 
    appointments, updateAppointmentStatus, patients, 
    addPatient, bookAppointment, setSelectedPatient,
    currentUser 
  } = useDental();

  const [activeTab, setActiveTab] = useState<'ALL' | 'WAITING' | 'IN_OPERATORY' | 'COMPLETED'>('ALL');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '1992-05-15',
    gender: 'MALE' as const,
    chiefComplaint: '',
    isUrgent: false,
    operatoryChair: 'Chair 1 (Main Operatory)',
    dentistId: currentUser.id || 1
  });

  const getPatient = (id: number) => patients.find(p => p.id === id);

  // Queues
  const waitingPatients = appointments.filter(a => a.status === 'ARRIVED');
  const inOperatoryPatients = appointments.filter(a => a.status === 'IN_OPERATORY');
  const completedPatients = appointments.filter(a => a.status === 'COMPLETED');
  const urgentCount = appointments.filter(a => a.isUrgent && (a.status === 'ARRIVED' || a.status === 'IN_OPERATORY')).length;

  const handleRegisterWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinForm.firstName || !walkinForm.lastName || !walkinForm.phone) {
      alert('Please fill in required patient fields.');
      return;
    }

    // 1. Create Patient
    const newPatient = addPatient({
      firstName: walkinForm.firstName,
      lastName: walkinForm.lastName,
      phone: walkinForm.phone,
      dob: walkinForm.dob,
      gender: walkinForm.gender,
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalAlerts: walkinForm.isUrgent ? ['Urgent Acute Dental Pain'] : [],
      isUrgent: walkinForm.isUrgent,
      notes: walkinForm.chiefComplaint
    });

    // 2. Book walk-in appointment immediately in ARRIVED status
    bookAppointment({
      patientId: newPatient.id,
      dentistId: walkinForm.dentistId,
      scheduledStart: new Date().toISOString(),
      durationMinutes: 30,
      status: 'ARRIVED',
      isWalkin: true,
      isUrgent: walkinForm.isUrgent,
      chiefComplaint: walkinForm.chiefComplaint || 'Emergency walk-in evaluation',
      operatoryChair: walkinForm.operatoryChair
    });

    setShowWalkinModal(false);
    setWalkinForm({
      firstName: '',
      lastName: '',
      phone: '',
      dob: '1992-05-15',
      gender: 'MALE',
      chiefComplaint: '',
      isUrgent: false,
      operatoryChair: 'Chair 1 (Main Operatory)',
      dentistId: currentUser.id || 1
    });
  };

  const handleSeatInChair = (apptId: number, patient: Patient) => {
    updateAppointmentStatus(apptId, 'IN_OPERATORY');
    setSelectedPatient(patient);
  };

  const handleCompleteEncounter = (apptId: number) => {
    updateAppointmentStatus(apptId, 'COMPLETED');
  };

  const handleOpenChart = (patient: Patient) => {
    setSelectedPatient(patient);
    onNavigateToChart(patient);
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header & Metrics Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Patient Waiting Queue & Triage
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
            Live triage tracking across Waiting Room, Operatory Chair, and Completed encounters.
          </p>
        </div>

        <button
          className="btn-teal-primary"
          onClick={() => setShowWalkinModal(true)}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <UserPlus size={16} />
          <span>New Walk-in Triage</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{waitingPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Waiting in Lobby</div>
          </div>
        </div>

        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e6f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005963' }}>
            <Armchair size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{inOperatoryPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>In Operatory Chair</div>
          </div>
        </div>

        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{completedPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Completed Today</div>
          </div>
        </div>

        <div className="operatory-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#e11d48' }}>{urgentCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Urgent Acute Cases</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { key: 'ALL', label: 'All Patients', count: appointments.length },
          { key: 'WAITING', label: 'Waiting Lobby', count: waitingPatients.length },
          { key: 'IN_OPERATORY', label: 'In Chair', count: inOperatoryPatients.length },
          { key: 'COMPLETED', label: 'Completed', count: completedPatients.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.key ? '#005963' : '#ffffff',
              color: activeTab === tab.key ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === tab.key ? '0 2px 6px rgba(0,89,99,0.2)' : 'none'
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              padding: '1px 6px',
              borderRadius: 9999,
              fontSize: '0.72rem'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3-Column Triage Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        
        {/* 1. WAITING LOBBY COLUMN */}
        {(activeTab === 'ALL' || activeTab === 'WAITING') && (
          <div className="operatory-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f3ee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color="#d97706" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Waiting in Lobby</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 9999 }}>
                {waitingPatients.length}
              </span>
            </div>

            {waitingPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No patients waiting in lobby.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {waitingPatients.map(appt => {
                  const pt = getPatient(appt.patientId);
                  if (!pt) return null;
                  return (
                    <div
                      key={appt.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 10,
                        border: appt.isUrgent ? '1.5px solid #fed7aa' : '1px solid #e2e8f0',
                        background: appt.isUrgent ? '#fff7ed' : '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                            {pt.firstName} {pt.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {pt.patientCode} • {pt.gender} • {pt.phone}
                          </div>
                        </div>

                        {appt.isUrgent && (
                          <span className="alert-tag-pill urgent" style={{ fontSize: '0.65rem' }}>
                            URGENT
                          </span>
                        )}
                      </div>

                      {/* Medical alerts */}
                      {pt.medicalAlerts && pt.medicalAlerts.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
                          {pt.medicalAlerts.map((alt, i) => (
                            <span key={i} className="alert-tag-pill allergy" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                              {alt}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', color: '#334155', margin: '6px 0 10px', background: 'rgba(0,0,0,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                        <strong>Complaint:</strong> {appt.chiefComplaint || pt.notes || 'Dental evaluation'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '6px', borderTop: '1px solid #f1f3ee' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Chair: <strong>{appt.operatoryChair}</strong>
                        </span>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-outline-pill"
                            onClick={() => handleOpenChart(pt)}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                          >
                            <Activity size={13} /> Chart
                          </button>
                          <button
                            className="btn-teal-primary"
                            onClick={() => handleSeatInChair(appt.id, pt)}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                          >
                            <Armchair size={13} /> Seat in Chair
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. IN OPERATORY CHAIR COLUMN */}
        {(activeTab === 'ALL' || activeTab === 'IN_OPERATORY') && (
          <div className="operatory-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f3ee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Armchair size={16} color="#005963" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>In Operatory Chair</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e6f3f4', color: '#005963', padding: '2px 8px', borderRadius: 9999 }}>
                {inOperatoryPatients.length}
              </span>
            </div>

            {inOperatoryPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No active patient currently in chair.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {inOperatoryPatients.map(appt => {
                  const pt = getPatient(appt.patientId);
                  if (!pt) return null;
                  return (
                    <div
                      key={appt.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 10,
                        border: '2px solid #005963',
                        background: '#f8fdfd',
                        boxShadow: '0 2px 6px rgba(0,89,99,0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                            {pt.firstName} {pt.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {pt.patientCode} • Chair: {appt.operatoryChair}
                          </div>
                        </div>

                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#005963', color: '#ffffff', padding: '2px 8px', borderRadius: 6 }}>
                          IN CHAIR
                        </span>
                      </div>

                      {/* Allergies banner */}
                      {pt.medicalAlerts && pt.medicalAlerts.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
                          {pt.medicalAlerts.map((alt, i) => (
                            <span key={i} className="alert-tag-pill allergy" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                              ⚠ {alt}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.8rem', color: '#1e293b', margin: '6px 0 12px' }}>
                        <strong>Active Procedure:</strong> {appt.chiefComplaint || 'Comprehensive clinical examination'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '8px', borderTop: '1px solid #d1eef0' }}>
                        <button
                          className="btn-teal-primary"
                          onClick={() => handleOpenChart(pt)}
                          style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Activity size={14} /> Open Tooth Chart
                        </button>
                        <button
                          className="btn-outline-pill"
                          onClick={() => handleCompleteEncounter(appt.id)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', color: '#059669', borderColor: '#a7f3d0' }}
                        >
                          <CheckCircle2 size={14} /> Complete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. COMPLETED COLUMN */}
        {(activeTab === 'ALL' || activeTab === 'COMPLETED') && (
          <div className="operatory-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f3ee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color="#059669" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Completed Today</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 9999 }}>
                {completedPatients.length}
              </span>
            </div>

            {completedPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No completed encounters yet today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {completedPatients.map(appt => {
                  const pt = getPatient(appt.patientId);
                  if (!pt) return null;
                  return (
                    <div
                      key={appt.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        opacity: 0.95
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                            {pt.firstName} {pt.lastName}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {appt.chiefComplaint}
                          </div>
                        </div>

                        <button
                          className="btn-outline-pill"
                          onClick={() => handleOpenChart(pt)}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                        >
                          View Chart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Walk-in Triage Modal */}
      {showWalkinModal && (
        <div className="modal-overlay" onClick={() => setShowWalkinModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Register Walk-in Triage
              </h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={walkinForm.firstName}
                    onChange={e => setWalkinForm({ ...walkinForm, firstName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={walkinForm.lastName}
                    onChange={e => setWalkinForm({ ...walkinForm, lastName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkinForm.phone}
                    onChange={e => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Gender
                  </label>
                  <select
                    value={walkinForm.gender}
                    onChange={e => setWalkinForm({ ...walkinForm, gender: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Chief Complaint / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={walkinForm.chiefComplaint}
                  onChange={e => setWalkinForm({ ...walkinForm, chiefComplaint: e.target.value })}
                  placeholder="e.g. Sharp throbbing pain on upper right molar..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
                <input
                  type="checkbox"
                  id="urgentWalkinCheck"
                  checked={walkinForm.isUrgent}
                  onChange={e => setWalkinForm({ ...walkinForm, isUrgent: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="urgentWalkinCheck" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9a3412', cursor: 'pointer' }}>
                  Mark as Urgent Acute Case (Trauma / Severe Hemorrhage / Uncontrolled Pain)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline-pill"
                  onClick={() => setShowWalkinModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-teal-primary">
                  Check In Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
