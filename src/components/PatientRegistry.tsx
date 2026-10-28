import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { Patient } from '../types/dental';
import { 
  Users, Search, UserPlus, Phone, Mail, ShieldAlert, 
  FileText, Calendar, Edit3, X, Check 
} from 'lucide-react';

interface PatientRegistryProps {
  onOpenChart: (patient: Patient) => void;
}

export const PatientRegistry: React.FC<PatientRegistryProps> = ({ onOpenChart }) => {
  const { patients, addPatient, selectedPatient, setSelectedPatient, getPatientVisits } = useDental();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient form
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
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

  const patientVisits = selectedPatient ? getPatientVisits(selectedPatient.id) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(420px, 1.4fr)', gap: '1.5rem' }}>
      {/* Left: Search & Patient List */}
      <div className="card-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Users size={18} color="var(--primary)" />
            <span>Patient Registry ({filteredPatients.length})</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={14} />
            <span>New Patient</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input 
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.4rem' }}
            placeholder="Search by name, ID code, or phone number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Patient Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '680px', overflowY: 'auto' }}>
          {filteredPatients.map(p => {
            const isSelected = selectedPatient?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                      {p.firstName} {p.lastName}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {p.patientCode}
                    </span>
                    {p.isUrgent && <span className="badge-urgent">URGENT</span>}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {p.phone} • DOB: {p.dob}
                  </div>

                  {p.medicalAlerts.length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#fecdd3', marginTop: '0.25rem' }}>
                      ⚠️ {p.medicalAlerts[0]}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isSelected ? 'Selected' : 'View'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Patient Dossier */}
      {selectedPatient ? (
        <div className="card-panel">
          <div className="panel-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.35rem' }}>{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                <span className="badge-counter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  {selectedPatient.patientCode}
                </span>
                {selectedPatient.isUrgent && <span className="badge-urgent">HIGH PRIORITY</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Registered on: {new Date(selectedPatient.createdAt).toLocaleDateString()} (OCC Version #{selectedPatient.version})
              </div>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => onOpenChart(selectedPatient)}>
              <FileText size={15} />
              <span>Open Odontogram</span>
            </button>
          </div>

          {/* Medical Alerts Banner */}
          {selectedPatient.medicalAlerts.length > 0 && (
            <div className="medical-alert-box" style={{ marginTop: '1rem' }}>
              <ShieldAlert size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff' }}>CONTRAINDICATIONS & MEDICAL ALERTS:</strong>{' '}
                {selectedPatient.medicalAlerts.join(' • ')}
              </div>
            </div>
          )}

          {/* Demographics & Insurance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Birth</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{selectedPatient.dob} ({selectedPatient.gender})</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Phone</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{selectedPatient.phone}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Residential Address</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{selectedPatient.address || 'Not Provided'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Contact</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dental Insurance Carrier</span>
              <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.88rem' }}>
                {selectedPatient.insuranceCarrier || 'Self-Pay / Cash Patient'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Policy / Subscriber Number</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                {selectedPatient.insurancePolicyNumber || 'N/A'}
              </div>
            </div>
          </div>

          {/* Clinical History & Past Encounters */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--primary)" />
              Clinical Encounters ({patientVisits.length})
            </h4>

            {patientVisits.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                No prior clinical encounters on file for this patient.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patientVisits.map(v => (
                  <div key={v.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>
                        {new Date(v.visitDatetime).toLocaleDateString()} — {v.diagnosis}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {v.toothRecords.length} Teeth Evaluated
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      {v.clinicalNotes}
                    </div>
                    {v.prescriptions && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                        Rx: {v.prescriptions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select a patient from the list to view their complete dossier.</p>
        </div>
      )}

      {/* New Patient Registration Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} color="var(--primary)" />
                Register New Clinic Patient
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={form.firstName} 
                      onChange={e => setForm({ ...form, firstName: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={form.lastName} 
                      onChange={e => setForm({ ...form, lastName: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={form.dob} 
                      onChange={e => setForm({ ...form, dob: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      className="form-select"
                      value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value as any })}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Street, City, Postal Code"
                    value={form.address} 
                    onChange={e => setForm({ ...form, address: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={form.emergencyContactName} 
                      onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      value={form.emergencyContactPhone} 
                      onChange={e => setForm({ ...form, emergencyContactPhone: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Insurance Carrier</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Delta Dental, MetLife..."
                      value={form.insuranceCarrier} 
                      onChange={e => setForm({ ...form, insuranceCarrier: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insurance Policy Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={form.insurancePolicyNumber} 
                      onChange={e => setForm({ ...form, insurancePolicyNumber: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--danger)' }}>
                    Medical Alerts & Allergies (Comma separated)
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Penicillin Allergy, Diabetes Type II, Latex Sensitivity"
                    value={form.medicalAlerts} 
                    onChange={e => setForm({ ...form, medicalAlerts: e.target.value })} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Create Patient Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
