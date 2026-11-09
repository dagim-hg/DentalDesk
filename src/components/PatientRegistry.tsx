import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Patient } from '../types/dental';
import { 
  Users, Search, UserPlus, Phone, Mail, ShieldAlert, 
  Activity, Calendar, FileText, CheckCircle2, X, Plus 
} from 'lucide-react';

interface PatientRegistryProps {
  onOpenChart: (patient: Patient) => void;
}

export const PatientRegistry: React.FC<PatientRegistryProps> = ({ onOpenChart }) => {
  const { patients, addPatient, selectedPatient, setSelectedPatient, getPatientVisits } = useDental();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient registration form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '1990-01-01',
    gender: 'MALE' as const,
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceCarrier: '',
    insurancePolicyNumber: '',
    medicalAlerts: '',
    notes: '',
    isUrgent: false
  });

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.patientCode.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  });

  const activePatient = selectedPatient || filteredPatients[0] || patients[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) {
      alert('Please fill in required fields');
      return;
    }

    const alertsArray = form.medicalAlerts
      ? form.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPatient = addPatient({
      firstName: form.firstName,
      lastName: form.lastName,
      dob: form.dob,
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      address: form.address,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      insuranceCarrier: form.insuranceCarrier,
      insurancePolicyNumber: form.insurancePolicyNumber,
      medicalAlerts: alertsArray,
      notes: form.notes,
      isUrgent: form.isUrgent
    });

    setShowAddModal(false);
    setSelectedPatient(newPatient);
    setForm({
      firstName: '',
      lastName: '',
      dob: '1990-01-01',
      gender: 'MALE',
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      insuranceCarrier: '',
      insurancePolicyNumber: '',
      medicalAlerts: '',
      notes: '',
      isUrgent: false
    });
  };

  const calculateAge = (dobString: string) => {
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return age > 0 ? age : 0;
    } catch {
      return 35;
    }
  };

  const patientVisits = activePatient ? getPatientVisits(activePatient.id) : [];

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Patient Records Registry
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
            Search electronic health records, inspect medical histories, and open clinical tooth charts.
          </p>
        </div>

        <button
          className="btn-teal-primary"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <UserPlus size={16} />
          <span>New Patient Intake</span>
        </button>
      </div>

      {/* 2-Column Clinical Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* ================= LEFT COLUMN: SEARCH & ROSTER ================= */}
        <div className="operatory-card" style={{ padding: '1rem' }}>
          
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.55rem 0.85rem',
            background: '#fafbfa',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            marginBottom: '0.85rem'
          }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.82rem',
                color: '#0f172a'
              }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Patients ({filteredPatients.length})
          </div>

          {/* Patient Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredPatients.map(pt => {
              const isSelected = activePatient?.id === pt.id;
              const hasAlert = pt.medicalAlerts && pt.medicalAlerts.length > 0;
              const age = calculateAge(pt.dob);

              return (
                <div
                  key={pt.id}
                  onClick={() => setSelectedPatient(pt)}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isSelected ? '#e6f3f4' : '#fafbfa',
                    border: isSelected ? '1.5px solid #005963' : '1px solid #f1f3ee'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '0.88rem', color: isSelected ? '#005963' : '#0f172a' }}>
                      {pt.firstName} {pt.lastName}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {pt.patientCode}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    {age} yrs • {pt.gender} • {pt.phone}
                  </div>

                  {hasAlert && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {pt.medicalAlerts.slice(0, 2).map((alt, idx) => (
                        <span key={idx} className="alert-tag-pill allergy" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                          {alt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ACTIVE PATIENT DOSSIER ================= */}
        {activePatient ? (
          <div className="operatory-card" style={{ padding: '1.5rem' }}>
            
            {/* Header with Name, ID & Primary Action */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f3ee' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {activePatient.firstName} {activePatient.lastName}
                  </h2>
                  <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#475569', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                    {activePatient.patientCode}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                  DOB: {activePatient.dob} ({calculateAge(activePatient.dob)} years) • {activePatient.gender} • Insurance: {activePatient.insuranceCarrier || 'Self-Pay'}
                </div>
              </div>

              {/* Big Teal Open Chart Button */}
              <button
                className="btn-teal-primary"
                onClick={() => onOpenChart(activePatient)}
                style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
              >
                <Activity size={17} />
                <span>Open Dental Chart</span>
              </button>
            </div>

            {/* Medical Alerts Banner */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                Medical Alerts & Contraindications
              </span>

              {activePatient.medicalAlerts && activePatient.medicalAlerts.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activePatient.medicalAlerts.map((alt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#fef2f2',
                        border: '1px solid #f87171',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      <ShieldAlert size={15} />
                      <span>{alt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} /> No documented drug allergies or systemic contraindications.
                </div>
              )}
            </div>

            {/* Clinical & Contact Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#fafbfa', padding: '1.15rem', borderRadius: 10, border: '1px solid #eef0e9', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Primary Phone</span>
                <strong>{activePatient.phone}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Email</span>
                <span>{activePatient.email || 'None on file'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>National ID</span>
                <span>{activePatient.nationalId || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Emergency Contact</span>
                <strong>{activePatient.emergencyContactName || 'None'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Emergency Phone</span>
                <span>{activePatient.emergencyContactPhone || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Policy Number</span>
                <span>{activePatient.insurancePolicyNumber || '—'}</span>
              </div>
            </div>

            {/* Clinical Notes & Encounters History */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Encounter History ({patientVisits.length})
                </span>
                <button
                  className="btn-outline-pill"
                  onClick={() => onOpenChart(activePatient)}
                  style={{ fontSize: '0.75rem', padding: '3px 9px' }}
                >
                  + New Encounter
                </button>
              </div>

              {patientVisits.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: '#fafbfa', borderRadius: 8, border: '1px solid #f1f3ee' }}>
                  No previous encounters recorded for this patient yet. Click "Open Dental Chart" to begin examination.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {patientVisits.map(v => (
                    <div
                      key={v.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                          Visit Date: {new Date(v.visitDatetime).toLocaleDateString()}
                        </strong>
                        <span style={{ fontSize: '0.75rem', background: '#e6f3f4', color: '#005963', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                          Encounter #{v.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>
                        <strong>Diagnosis:</strong> {v.diagnosis || 'None recorded'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {v.clinicalNotes?.slice(0, 180)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="operatory-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Select a patient from the list on the left to view clinical records.
          </div>
        )}
      </div>

      {/* New Patient Intake Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                New Patient Registration
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value as any })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Medical Alerts / Allergies (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin Allergy, Hypertension, Latex"
                  value={form.medicalAlerts}
                  onChange={e => setForm({ ...form, medicalAlerts: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline-pill"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-teal-primary">
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
