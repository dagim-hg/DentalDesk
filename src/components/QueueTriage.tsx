import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  Users, UserPlus, Clock, AlertTriangle, ArrowRight, 
  CheckCircle2, Stethoscope, Armchair, DollarSign, X 
} from 'lucide-react';
import { AppointmentStatus, Patient } from '../types/dental';

interface QueueTriageProps {
  onNavigateToChart: (patient: Patient) => void;
  onNavigateToBilling: (patientId: number) => void;
}

export const QueueTriage: React.FC<QueueTriageProps> = ({ 
  onNavigateToChart, 
  onNavigateToBilling 
}) => {
  const { 
    appointments, updateAppointmentStatus, patients, 
    addPatient, bookAppointment, setSelectedPatient 
  } = useDental();

  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '1995-01-01',
    gender: 'MALE' as const,
    chiefComplaint: '',
    isUrgent: false,
    operatoryChair: 'Chair 1 (Operatory A)',
    dentistId: 1
  });

  const getPatient = (id: number) => patients.find(p => p.id === id);

  // Filter queues
  const waitingPatients = appointments.filter(a => a.status === 'ARRIVED');
  const inOperatoryPatients = appointments.filter(a => a.status === 'IN_OPERATORY');
  const completedPatients = appointments.filter(a => a.status === 'COMPLETED');

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
      dob: '1995-01-01',
      gender: 'MALE',
      chiefComplaint: '',
      isUrgent: false,
      operatoryChair: 'Chair 1 (Operatory A)',
      dentistId: 1
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Triage Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{waitingPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Waiting in Lobby</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Armchair size={22} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{inOperatoryPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>In Operatory Chairs</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{completedPatients.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Completed Today</div>
          </div>
        </div>

        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Quick Intake</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Emergency walk-in triage</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowWalkinModal(true)}>
            <UserPlus size={15} />
            <span>Walk-In</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Triage Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* Column 1: Waiting in Lobby */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Clock size={18} color="var(--primary)" />
              <span>1. Waiting Room ({waitingPatients.length})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {waitingPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Lobby is currently clear.
              </div>
            ) : (
              waitingPatients.map((app) => {
                const patient = getPatient(app.patientId);
                if (!patient) return null;
                return (
                  <div 
                    key={app.id} 
                    style={{ 
                      background: 'var(--bg-surface)', 
                      border: app.isUrgent ? '1.5px solid var(--danger)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                        {patient.firstName} {patient.lastName}
                      </strong>
                      {app.isUrgent && <span className="badge-urgent">URGENT</span>}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>Phone: {patient.phone}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Complaint: {app.chiefComplaint}
                      </div>
                    </div>

                    {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#fecdd3', background: 'var(--danger-bg)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        ⚠️ {patient.medicalAlerts[0]}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          updateAppointmentStatus(app.id, 'IN_OPERATORY');
                          setSelectedPatient(patient);
                        }}
                      >
                        <Armchair size={13} />
                        <span>Call to Chair</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: In Operatory Chair */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Armchair size={18} color="var(--warning)" />
              <span>2. In Operatory ({inOperatoryPatients.length})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {inOperatoryPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All operatory chairs available.
              </div>
            ) : (
              inOperatoryPatients.map((app) => {
                const patient = getPatient(app.patientId);
                if (!patient) return null;
                return (
                  <div 
                    key={app.id} 
                    style={{ 
                      background: 'rgba(245, 158, 11, 0.08)', 
                      border: '1.5px solid var(--warning)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                        {patient.firstName} {patient.lastName}
                      </strong>
                      <span className="badge-counter" style={{ background: 'var(--warning)', color: '#000' }}>
                        {app.operatoryChair.split(' ')[0]}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>Operatory: {app.operatoryChair}</div>
                      <div>Complaint: {app.chiefComplaint}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setSelectedPatient(patient);
                          onNavigateToChart(patient);
                        }}
                      >
                        <Stethoscope size={13} color="var(--primary)" />
                        <span>Open Chart</span>
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => updateAppointmentStatus(app.id, 'COMPLETED')}
                        title="Mark encounter complete"
                      >
                        <CheckCircle2 size={13} />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Ready for Billing / Completed */}
        <div className="card-panel">
          <div className="panel-header">
            <div className="panel-title">
              <CheckCircle2 size={18} color="var(--success)" />
              <span>3. Checkout & Billing ({completedPatients.length})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {completedPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No completed encounters waiting for checkout.
              </div>
            ) : (
              completedPatients.map((app) => {
                const patient = getPatient(app.patientId);
                if (!patient) return null;
                return (
                  <div 
                    key={app.id} 
                    style={{ 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                        {patient.firstName} {patient.lastName}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                        ✓ Treatment Done
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Insurance: {patient.insuranceCarrier || 'Self-Pay'}
                    </div>

                    <div style={{ marginTop: '0.4rem' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => onNavigateToBilling(patient.id)}
                      >
                        <DollarSign size={13} />
                        <span>Generate Invoice & Payment</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Walk-in Intake Modal */}
      {showWalkinModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} color="var(--primary)" />
                Register Walk-in Patient & Immediate Triage
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowWalkinModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkin}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={walkinForm.firstName} 
                      onChange={e => setWalkinForm({ ...walkinForm, firstName: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={walkinForm.lastName} 
                      onChange={e => setWalkinForm({ ...walkinForm, lastName: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required
                      placeholder="+1 (555) 000-0000"
                      value={walkinForm.phone} 
                      onChange={e => setWalkinForm({ ...walkinForm, phone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={walkinForm.dob} 
                      onChange={e => setWalkinForm({ ...walkinForm, dob: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chief Complaint / Symptoms *</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    required
                    placeholder="e.g. Broken tooth, severe throbbing pain, facial swelling..."
                    value={walkinForm.chiefComplaint}
                    onChange={e => setWalkinForm({ ...walkinForm, chiefComplaint: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Operatory Chair</label>
                    <select 
                      className="form-select"
                      value={walkinForm.operatoryChair}
                      onChange={e => setWalkinForm({ ...walkinForm, operatoryChair: e.target.value })}
                    >
                      <option value="Chair 1 (Operatory A)">Chair 1 (Operatory A)</option>
                      <option value="Chair 2 (Hygiene Suite)">Chair 2 (Hygiene Suite)</option>
                      <option value="Chair 3 (Surgical/Prosthetic)">Chair 3 (Surgical/Prosthetic)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Triage Priority</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={walkinForm.isUrgent}
                        onChange={e => setWalkinForm({ ...walkinForm, isUrgent: e.target.checked })}
                      />
                      <span style={{ color: walkinForm.isUrgent ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 600 }}>
                        Mark as Urgent Emergency
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWalkinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} />
                  <span>Admit to Waiting Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
