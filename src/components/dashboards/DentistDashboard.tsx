import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { ToothChart } from '../ToothChart';
import { 
  Stethoscope, Clock, AlertTriangle, CheckCircle2, 
  ArrowRight, Activity, FileText, Pill, Users, 
  Search, ShieldAlert, Printer, ChevronRight, Armchair 
} from 'lucide-react';
import { Patient, Appointment } from '../../types/dental';

interface DentistDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const DentistDashboard: React.FC<DentistDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, appointments, updateAppointmentStatus, 
    patients, selectedPatient, setSelectedPatient, 
    getPatientVisits, saveVisit 
  } = useDental();

  const [activeClinicalTab, setActiveClinicalTab] = useState<'chart' | 'prescriptions' | 'history'>('chart');
  const [rxForm, setRxForm] = useState({
    medication: 'Amoxicillin 500mg',
    dosage: '1 capsule every 8 hours (TID)',
    duration: '7 days',
    instructions: 'Take with food and full glass of water. Complete full course.',
    refills: 0
  });
  const [showRxPrintModal, setShowRxPrintModal] = useState(false);

  // Filter queue for this dentist or active operatory
  const todayAppointments = appointments.filter(a => {
    return a.dentistId === currentUser.id || !a.dentistId;
  });

  const waitingPatients = todayAppointments.filter(a => a.status === 'ARRIVED');
  const inOperatoryPatientAppt = todayAppointments.find(a => a.status === 'IN_OPERATORY');
  const inChairPatient = inOperatoryPatientAppt 
    ? patients.find(p => p.id === inOperatoryPatientAppt.patientId) 
    : selectedPatient;

  // Patient visits history
  const patientVisits = inChairPatient ? getPatientVisits(inChairPatient.id) : [];

  const handleCallNextPatient = () => {
    if (waitingPatients.length > 0) {
      const nextAppt = waitingPatients[0];
      updateAppointmentStatus(nextAppt.id, 'IN_OPERATORY');
      const targetPatient = patients.find(p => p.id === nextAppt.patientId);
      if (targetPatient) {
        setSelectedPatient(targetPatient);
      }
    }
  };

  const handleCompleteCurrentVisit = () => {
    if (inOperatoryPatientAppt) {
      updateAppointmentStatus(inOperatoryPatientAppt.id, 'COMPLETED');
    }
  };

  return (
    <div>
      {/* Greeting Title */}
      <div className="greeting-section">
        <div>
          <h1 className="greeting-text">Good Morning, {currentUser.fullName}!</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--dd-text-muted)', marginTop: '0.2rem' }}>
            Operatory Chair 1 • Clinical Diagnostic Workspace
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {waitingPatients.length > 0 && (
            <button className="btn-accent-lime" onClick={handleCallNextPatient}>
              <Armchair size={15} />
              <span>Call Next Patient ({waitingPatients.length} Waiting)</span>
            </button>
          )}

          {inOperatoryPatientAppt && (
            <button className="btn-primary-teal" onClick={handleCompleteCurrentVisit}>
              <CheckCircle2 size={15} />
              <span>Complete Encounter</span>
            </button>
          )}
        </div>
      </div>

      {/* Active In-Chair Patient Clinical Banner */}
      {inChairPatient ? (
        <div className="card-widget" style={{ borderLeft: '6px solid var(--dd-primary-teal)', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="user-avatar-circle" style={{ width: 44, height: 44, fontSize: '1.1rem', backgroundColor: 'var(--dd-primary-teal)' }}>
                {inChairPatient.firstName[0]}{inChairPatient.lastName[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {inChairPatient.firstName} {inChairPatient.lastName}
                  </h3>
                  <span className="pill-badge teal">{inChairPatient.patientCode}</span>
                  <span className="pill-badge lime">Age: {new Date().getFullYear() - new Date(inChairPatient.dob).getFullYear()}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)', marginTop: '0.2rem' }}>
                  Phone: {inChairPatient.phone} • DOB: {inChairPatient.dob} • Status: {inOperatoryPatientAppt ? 'In Operatory' : 'Selected'}
                </div>
              </div>
            </div>

            {/* Documented Medical Alerts & Allergies - Prominent Red Flagging */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {inChairPatient.medicalAlerts && inChairPatient.medicalAlerts.length > 0 ? (
                inChairPatient.medicalAlerts.map((alertText, idx) => (
                  <div key={idx} className="alert-notice-banner" style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    <ShieldAlert size={14} />
                    <span>{alertText}</span>
                  </div>
                ))
              ) : (
                <div className="pill-badge active">
                  <CheckCircle2 size={13} />
                  <span>No Documented Drug Allergies</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-widget" style={{ textAlign: 'center', padding: '2rem' }}>
          <Stethoscope size={36} color="var(--dd-primary-teal)" style={{ margin: '0 auto 0.75rem' }} />
          <h3>No Patient Currently In Chair</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dd-text-muted)', marginTop: '0.25rem' }}>
            Click "Call Next Patient" from the waiting queue or select a record from the Patient Registry.
          </p>
        </div>
      )}

      {/* Clinical Workspace Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn-outline ${activeClinicalTab === 'chart' ? 'active' : ''}`}
          style={{
            backgroundColor: activeClinicalTab === 'chart' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeClinicalTab === 'chart' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeClinicalTab === 'chart' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveClinicalTab('chart')}
        >
          <Activity size={15} />
          <span>Odontogram & Clinical SOAP Chart</span>
        </button>

        <button
          className={`btn-outline ${activeClinicalTab === 'prescriptions' ? 'active' : ''}`}
          style={{
            backgroundColor: activeClinicalTab === 'prescriptions' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeClinicalTab === 'prescriptions' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeClinicalTab === 'prescriptions' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveClinicalTab('prescriptions')}
        >
          <Pill size={15} />
          <span>Prescriptions & Rx Generator</span>
        </button>

        <button
          className={`btn-outline ${activeClinicalTab === 'history' ? 'active' : ''}`}
          style={{
            backgroundColor: activeClinicalTab === 'history' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeClinicalTab === 'history' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeClinicalTab === 'history' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveClinicalTab('history')}
        >
          <Clock size={15} />
          <span>Visit History & Notes ({patientVisits.length})</span>
        </button>
      </div>

      {/* Tab 1: Odontogram & SOAP Notes */}
      {activeClinicalTab === 'chart' && (
        <ToothChart />
      )}

      {/* Tab 2: Prescription Management */}
      {activeClinicalTab === 'prescriptions' && inChairPatient && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Pill size={18} color="var(--dd-primary-teal)" />
              <span>Medical Prescription Generator (Rx)</span>
            </div>
            <button className="btn-primary-teal" onClick={() => setShowRxPrintModal(true)}>
              <Printer size={15} />
              <span>Print Formal Prescription</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Medication & Formulation
              </label>
              <select
                value={rxForm.medication}
                onChange={(e) => setRxForm({ ...rxForm, medication: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              >
                <option value="Amoxicillin 500mg">Amoxicillin 500mg (Oral Capsule)</option>
                <option value="Clindamycin 300mg">Clindamycin 300mg (Penicillin Allergic)</option>
                <option value="Ibuprofen 600mg">Ibuprofen 600mg (Anti-inflammatory Analgesic)</option>
                <option value="Chlorhexidine Gluconate 0.12%">Chlorhexidine Gluconate 0.12% Oral Rinse</option>
                <option value="Acetaminophen 500mg">Acetaminophen 500mg Extra Strength</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Dosage & Administration Frequency
              </label>
              <input
                type="text"
                value={rxForm.dosage}
                onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Duration
              </label>
              <input
                type="text"
                value={rxForm.duration}
                onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Refills Authorized
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={rxForm.refills}
                onChange={(e) => setRxForm({ ...rxForm, refills: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Patient Instructions / Warnings
              </label>
              <textarea
                rows={3}
                value={rxForm.instructions}
                onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Visit History */}
      {activeClinicalTab === 'history' && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <FileText size={18} color="var(--dd-primary-teal)" />
              <span>Diagnostic & Historical Encounter Notes</span>
            </div>
          </div>

          {patientVisits.length === 0 ? (
            <p style={{ color: 'var(--dd-text-muted)', textAlign: 'center', padding: '2rem' }}>
              No previous visit records found for this patient.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patientVisits.map((v) => (
                <div key={v.id} style={{ padding: '1rem', border: '1px solid var(--dd-border)', borderRadius: '12px', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      Encounter Date: {new Date(v.visitDatetime).toLocaleDateString()}
                    </span>
                    <span className="pill-badge teal">Encounter #{v.id}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)', marginBottom: '0.4rem' }}>
                    <strong>Chief Complaint:</strong> {v.chiefComplaint || 'None recorded'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)', marginBottom: '0.4rem' }}>
                    <strong>Diagnosis:</strong> {v.diagnosis || 'None recorded'}
                  </div>
                  <pre style={{ 
                    fontFamily: 'inherit', fontSize: '0.82rem', background: '#ffffff', 
                    padding: '0.75rem', borderRadius: '8px', border: '1px solid #eef2f5', 
                    whiteSpace: 'pre-wrap', color: 'var(--dd-text-dark)' 
                  }}>
                    {v.clinicalNotes}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Prescription Modal */}
      {showRxPrintModal && inChairPatient && (
        <div className="modal-overlay" onClick={() => setShowRxPrintModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--dd-primary-teal)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dd-primary-teal)' }}>DentalDesk Clinic</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>
                Air-Gapped Practice Management System • Operatory Bay 1
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>
                Prescribing Doctor: {currentUser.fullName} • Lic: #DEN-2026-88192
              </div>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Patient:</strong> {inChairPatient.firstName} {inChairPatient.lastName} ({inChairPatient.patientCode})
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dd-primary-teal)', marginBottom: '0.5rem' }}>
                ℞ {rxForm.medication}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>Sig:</strong> {rxForm.dosage}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <strong>Duration:</strong> {rxForm.duration}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--dd-text-muted)' }}>
                <strong>Instructions:</strong> {rxForm.instructions}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
              <div style={{ borderTop: '1px solid #94a3b8', width: '180px', textAlign: 'center', paddingTop: '0.35rem', fontSize: '0.75rem' }}>
                Doctor Signature
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-outline" onClick={() => setShowRxPrintModal(false)}>Close</button>
                <button className="btn-primary-teal" onClick={() => window.print()}>Print Prescription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

