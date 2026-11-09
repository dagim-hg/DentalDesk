import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { ToothChart } from '../ToothChart';
import { 
  Stethoscope, Clock, AlertTriangle, CheckCircle2, 
  ArrowRight, Activity, FileText, Pill, Users, 
  Search, ShieldAlert, Printer, ChevronRight, Armchair,
  Calendar, Plus, ExternalLink, ArrowLeft, RefreshCw, X
} from 'lucide-react';
import { Patient, Appointment } from '../../types/dental';

interface DentistDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const DentistDashboard: React.FC<DentistDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, appointments, updateAppointmentStatus, 
    patients, selectedPatient, setSelectedPatient, 
    getPatientVisits, saveVisit, refreshFromBackend,
    isServerConnected, lastSyncedAt
  } = useDental();

  // Mode: 'operatory' (Image 2) or 'chart' (Image 1)
  const [viewMode, setViewMode] = useState<'operatory' | 'chart'>('operatory');
  const [showAddProcModal, setShowAddProcModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({
    medication: 'Clindamycin 300 mg, 21 capsules',
    dosage: '1 capsule every 8 hours (TID)',
    duration: '7 days',
    instructions: 'Take with food and full glass of water. Report severe gastrointestinal discomfort.',
    refills: 0
  });

  const [proceduresList, setProceduresList] = useState([
    { id: '1', tooth: 46, surfaces: 'O, M, D', name: 'Access opening and pulp extirpation', state: 'Recorded' },
    { id: '2', tooth: 46, surfaces: '—', name: 'Working length determination', state: 'Recorded' },
    { id: '3', tooth: 46, surfaces: '—', name: 'Rubber dam isolation', state: 'Recorded' },
    { id: '4', tooth: 46, surfaces: 'M, D', name: 'Canal shaping to F2', state: 'Draft' },
    { id: '5', tooth: 46, surfaces: '—', name: 'Irrigation, 3% NaOCl', state: 'Recorded' },
    { id: '6', tooth: 46, surfaces: 'O', name: 'Provisional restoration', state: 'Draft' }
  ]);

  const [newProc, setNewProc] = useState({
    tooth: 46,
    surfaces: 'O',
    name: 'Access opening and pulp extirpation',
    state: 'Recorded'
  });

  // Find currently in-operatory patient appointment
  const inOperatoryAppt = appointments.find(a => a.status === 'IN_OPERATORY') || appointments[4];
  const activeInChairPatient = inOperatoryAppt 
    ? patients.find(p => p.id === inOperatoryAppt.patientId) || patients[0]
    : selectedPatient || patients[0];

  // Currently focused patient for stage card
  const displayPatient = selectedPatient || activeInChairPatient || patients[0];

  // Waiting patients list
  const waitingAppointments = appointments.filter(a => a.status === 'ARRIVED');

  // Today's timeline appointments list
  const timelineAppointments = appointments.slice(0, 10);

  // Call next patient action
  const handleCallNextPatient = () => {
    if (waitingAppointments.length > 0) {
      const nextAppt = waitingAppointments[0];
      updateAppointmentStatus(nextAppt.id, 'IN_OPERATORY');
      const targetPatient = patients.find(p => p.id === nextAppt.patientId);
      if (targetPatient) {
        setSelectedPatient(targetPatient);
      }
    }
  };

  // Complete encounter action
  const handleCompleteVisit = () => {
    if (inOperatoryAppt) {
      updateAppointmentStatus(inOperatoryAppt.id, 'COMPLETED');
    }
    // Also save visit record
    saveVisit({
      patientId: displayPatient.id,
      dentistId: currentUser.id,
      visitDatetime: new Date().toISOString(),
      chiefComplaint: displayPatient.notes || 'Endodontic encounter completed.',
      clinicalNotes: 'Access opened, canals shaped, provisional restoration placed. Patient tolerated procedure well.',
      diagnosis: 'Irreversible pulpitis #46',
      treatmentPlan: 'Root canal treatment, core build-up, porcelain crown.',
      prescriptions: rxForm.medication,
      toothRecords: [
        { toothNumber: 46, condition: 'ROOT_CANAL', surfaces: ['O', 'M', 'D'], diagnosedDate: '2026-11-09' }
      ],
      createdBy: currentUser.id
    });
  };

  const handleSelectPatientFromTimeline = (patientId: number) => {
    const p = patients.find(pt => pt.id === patientId);
    if (p) {
      setSelectedPatient(p);
    }
  };

  const handleOpenChartForPatient = (patient?: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
    }
    setViewMode('chart');
  };

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    setProceduresList(prev => [
      ...prev,
      {
        id: String(Date.now()),
        tooth: newProc.tooth,
        surfaces: newProc.surfaces,
        name: newProc.name,
        state: newProc.state
      }
    ]);
    setShowAddProcModal(false);
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
      return 41;
    }
  };

  // If in 'chart' mode, render the high-fidelity ToothChart view (Image 1)
  if (viewMode === 'chart') {
    return (
      <ToothChart
        patient={displayPatient}
        onBack={() => setViewMode('operatory')}
      />
    );
  }

  // Otherwise, render the Operatory 3-column dashboard (Image 2)
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Top Header: Operatory & Live Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Operatory
          </h1>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Monday, 9 November 2026 • Operatory Chair 1 • Dr. Sarah Chen, DDS
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: isServerConnected ? 'var(--dd-success-bg)' : '#fef3c7',
            color: isServerConnected ? 'var(--dd-success)' : '#d97706',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isServerConnected ? '#10b981' : '#f59e0b',
              boxShadow: isServerConnected ? '0 0 0 2px rgba(16,185,129,0.3)' : 'none'
            }} />
            <span>{isServerConnected ? 'PostgreSQL 18 Real-Time Stream' : 'Offline Cache'}</span>
          </div>

          <button
            onClick={() => refreshFromBackend()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 9999,
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#005963',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} /> Sync
          </button>
        </div>
      </div>

      {/* 3-Column Operatory Grid (Image 2) */}
      <div className="operatory-grid">
        
        {/* ================= COLUMN 1: TODAY SCHEDULE TIMELINE ================= */}
        <div className="operatory-card" style={{ padding: '1rem' }}>
          <div className="operatory-card-header" style={{ marginBottom: '0.65rem', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Today</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>10 booked</span>
          </div>

          <div className="timeline-list">
            {timelineAppointments.map((appt, idx) => {
              const pt = patients.find(p => p.id === appt.patientId);
              const isSelected = displayPatient?.id === pt?.id;
              const isInOperatory = appt.status === 'IN_OPERATORY';
              const isCompleted = appt.status === 'COMPLETED';
              const isArrived = appt.status === 'ARRIVED';
              const isNoShow = appt.status === 'NO_SHOW';

              // Simulated timeline times matching screenshot
              const times = ['08:30', '09:00', '09:45', '10:30', '11:15', '12:45', '14:15', '14:45', '15:30', '16:15'];
              const timeDisplay = times[idx] || '11:15';

              return (
                <div
                  key={appt.id}
                  className={`timeline-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPatientFromTimeline(appt.patientId)}
                >
                  <div className="timeline-time-col">
                    {timeDisplay}
                  </div>
                  <div className="timeline-info-col">
                    <div className="timeline-patient-name">
                      {pt ? `${pt.firstName} ${pt.lastName}` : 'Patient'}
                    </div>
                    <div className="timeline-subtext">
                      {appt.chiefComplaint || 'Consultation & exam'}
                    </div>
                    <div className="timeline-status-pill">
                      {isCompleted && (
                        <>
                          <span className="status-dot completed" />
                          <span style={{ color: '#059669' }}>Completed</span>
                        </>
                      )}
                      {isInOperatory && (
                        <>
                          <span className="status-dot in_operatory" />
                          <span style={{ color: '#005963', fontWeight: 700 }}>In operatory</span>
                        </>
                      )}
                      {isArrived && (
                        <>
                          <span className="status-dot arrived" />
                          <span style={{ color: '#b45309' }}>In waiting room</span>
                        </>
                      )}
                      {isNoShow && (
                        <>
                          <span className="status-dot no_show" />
                          <span style={{ color: '#ef4444' }}>No-show</span>
                        </>
                      )}
                      {!isCompleted && !isInOperatory && !isArrived && !isNoShow && (
                        <>
                          <span className="status-dot confirmed" />
                          <span style={{ color: '#64748b' }}>Confirmed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated Lunch Break block */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              background: '#f8fafc',
              fontSize: '0.75rem',
              color: '#64748b',
              marginTop: 4
            }}>
              <span style={{ fontWeight: 700, width: 44 }}>13:30</span>
              <span>Lunch (13:30 - 14:15)</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: ACTIVE IN-CHAIR PATIENT STAGE ================= */}
        <div className="operatory-card" style={{ padding: '1.4rem' }}>
          
          {/* Patient Title & Medical Alerts Header */}
          <div className="stage-patient-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 className="stage-patient-name" style={{ margin: 0 }}>
                  {displayPatient.firstName} {displayPatient.lastName}
                </h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: inOperatoryAppt?.patientId === displayPatient.id ? '#e6f3f4' : '#f1f5f9',
                  color: inOperatoryAppt?.patientId === displayPatient.id ? '#005963' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.72rem'
                }}>
                  ■ {inOperatoryAppt?.patientId === displayPatient.id ? 'IN OPERATORY' : 'ACTIVE RECORD'}
                </span>
              </div>
              <div className="stage-demographics">
                {displayPatient.patientCode} • DOB {displayPatient.dob} ({calculateAge(displayPatient.dob)} y) • {displayPatient.gender}
              </div>
            </div>

            {/* Allergy & Health Risk Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              {displayPatient.medicalAlerts && displayPatient.medicalAlerts.length > 0 ? (
                displayPatient.medicalAlerts.map((alertText, idx) => {
                  const isAllergy = alertText.toLowerCase().includes('penicillin') || alertText.toLowerCase().includes('allergy');
                  return (
                    <span
                      key={idx}
                      className={`alert-tag-pill ${isAllergy ? 'allergy' : 'neutral'}`}
                    >
                      {alertText.toUpperCase()}
                    </span>
                  );
                })
              ) : (
                <span className="alert-tag-pill neutral">NO KNOWN DRUG ALLERGIES</span>
              )}
            </div>
          </div>

          {/* Quick Stats 4-Grid */}
          <div className="stage-stats-grid">
            <div className="stage-stat-item">
              <span className="stage-stat-label">In operatory since</span>
              <span className="stage-stat-value">11:22</span>
            </div>
            <div className="stage-stat-item">
              <span className="stage-stat-label">Elapsed</span>
              <span className="stage-stat-value" style={{ color: '#005963' }}>48 min</span>
            </div>
            <div className="stage-stat-item">
              <span className="stage-stat-label">Scheduled</span>
              <span className="stage-stat-value">11:15 - 12:45</span>
            </div>
            <div className="stage-stat-item">
              <span className="stage-stat-label">Tooth</span>
              <span className="stage-stat-value">46</span>
            </div>
          </div>

          {/* Chief Complaint Box */}
          <div className="complaint-box">
            <div className="complaint-label">Chief complaint</div>
            <div className="complaint-text">
              {displayPatient.notes || 'Sharp pain lower right, cold sensitivity since 3 November.'}
            </div>
          </div>

          {/* Action Buttons: Open Chart & Draft Prescription */}
          <div className="stage-buttons-row">
            <button
              className="btn-teal-primary"
              onClick={() => handleOpenChartForPatient(displayPatient)}
            >
              <Activity size={16} />
              <span>Open chart</span>
            </button>

            <button
              className="btn-outline-pill"
              onClick={() => setShowRxModal(true)}
            >
              <Pill size={15} color="#005963" />
              <span>Draft prescription</span>
            </button>
          </div>

          {/* Procedures This Visit Table */}
          <div className="procedures-table-container">
            <div className="procedures-header-row">
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                Procedures this visit
              </span>
              <button
                onClick={() => setShowAddProcModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#005963',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Plus size={13} /> Record procedure
              </button>
            </div>

            <table className="procedures-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Tooth</th>
                  <th style={{ width: 72 }}>Surfaces</th>
                  <th>Procedure</th>
                  <th style={{ width: 80 }}>State</th>
                </tr>
              </thead>
              <tbody>
                {proceduresList.map(proc => (
                  <tr key={proc.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{proc.tooth}</td>
                    <td style={{ color: '#64748b' }}>{proc.surfaces}</td>
                    <td style={{ fontWeight: 600 }}>{proc.name}</td>
                    <td>
                      <span className={`state-badge ${proc.state.toLowerCase()}`}>
                        {proc.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stage Footer: Move appointment & Complete visit */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f3ee'
          }}>
            <button
              className="btn-outline-pill"
              onClick={() => onNavigateTab('appointments')}
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              Move appointment
            </button>

            <button
              className="btn-teal-primary"
              onClick={handleCompleteVisit}
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.25rem' }}
            >
              <CheckCircle2 size={15} />
              <span>Complete visit</span>
            </button>
          </div>
        </div>

        {/* ================= COLUMN 3: RIGHT SIDEBAR (QUEUE & NOTES) ================= */}
        <div className="operatory-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Waiting Queue Card */}
          <div className="operatory-card" style={{ padding: '1rem' }}>
            <div className="operatory-card-header" style={{ marginBottom: '0.65rem', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Waiting queue</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>4 waiting</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Item 1: Agnieszka Wolna */}
              <div className="queue-card-item urgent-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Agnieszka Wolna</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9a3412' }}>14 MIN</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 6px' }}>
                  Walk-in arrived 11:58
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className="alert-tag-pill urgent" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>URGENT</span>
                    <span className="alert-tag-pill neutral" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>LATEX</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Next available</span>
                </div>
              </div>

              {/* Item 2: Kwame Mensah */}
              <div className="queue-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Kwame Mensah</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>6 MIN</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 6px' }}>
                  Walk-in arrived 12:04
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="alert-tag-pill allergy" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>PENICILLIN</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Dr. Chen</span>
                </div>
              </div>

              {/* Item 3: Elif Yildirim */}
              <div className="queue-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Elif Yildirim</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>5 MIN</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 6px' }}>
                  Scheduled 12:45 arrived 12:05
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Dr. Chen</span>
                </div>
              </div>

              {/* Item 4: Sofia Marchetti */}
              <div className="queue-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Sofia Marchetti</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>1 MIN</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 6px' }}>
                  Walk-in arrived 12:09
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Dr. Chen</span>
                </div>
              </div>
            </div>

            {/* Call Next Patient Big Button */}
            <button
              onClick={handleCallNextPatient}
              style={{
                width: '100%',
                marginTop: '0.85rem',
                padding: '0.7rem',
                borderRadius: 8,
                background: '#005963',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Armchair size={16} />
              <span>Call next patient</span>
            </button>
          </div>

          {/* Visit Notes Card */}
          <div className="operatory-card" style={{ padding: '1rem' }}>
            <div className="operatory-card-header" style={{ marginBottom: '0.65rem', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Visit notes</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>3 to finalize</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b', marginRight: 6 }}>09:45</span>
                  <strong style={{ color: '#0f172a' }}>Mei-Ling Zhao</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Crown seat, tooth 14</div>
                </div>
                <span className="state-badge draft">Draft</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b', marginRight: 6 }}>09:00</span>
                  <strong style={{ color: '#0f172a' }}>Owen Hartley</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Composite, tooth 36</div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Not started</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b', marginRight: 6 }}>08:30</span>
                  <strong style={{ color: '#0f172a' }}>Bianca Ferreira</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Prophylaxis</div>
                </div>
                <span className="state-badge draft">Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Record Procedure Modal */}
      {showAddProcModal && (
        <div className="modal-overlay" onClick={() => setShowAddProcModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Record Encounter Procedure
              </h3>
              <button
                onClick={() => setShowAddProcModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProcedure} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Tooth Number
                  </label>
                  <input
                    type="number"
                    value={newProc.tooth}
                    onChange={e => setNewProc({ ...newProc, tooth: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Surfaces
                  </label>
                  <input
                    type="text"
                    value={newProc.surfaces}
                    onChange={e => setNewProc({ ...newProc, surfaces: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Procedure Description
                </label>
                <input
                  type="text"
                  value={newProc.name}
                  onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={newProc.state}
                  onChange={e => setNewProc({ ...newProc, state: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="Recorded">Recorded</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline-pill"
                  onClick={() => setShowAddProcModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-teal-primary">
                  Add Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Draft Prescription Modal */}
      {showRxModal && (
        <div className="modal-overlay" onClick={() => setShowRxModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Draft Prescription (Rx)
              </h3>
              <button
                onClick={() => setShowRxModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayPatient.medicalAlerts.some(a => a.toLowerCase().includes('penicillin')) && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: '#b91c1c',
                  fontWeight: 700
                }}>
                  ⚠ PENICILLIN ALLERGY FLAGGED — Pre-selecting non-beta-lactam alternative (Clindamycin)
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Medication Formulation
                </label>
                <select
                  value={rxForm.medication}
                  onChange={e => setRxForm({ ...rxForm, medication: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  <option value="Clindamycin 300 mg, 21 capsules">Clindamycin 300 mg (Penicillin-Allergic Alternative)</option>
                  <option value="Amoxicillin 500 mg, 21 capsules">Amoxicillin 500 mg (Standard Prophylaxis)</option>
                  <option value="Ibuprofen 600 mg, 15 tablets">Ibuprofen 600 mg (Anti-inflammatory Analgesic)</option>
                  <option value="Chlorhexidine Gluconate 0.12% Oral Rinse">Chlorhexidine Gluconate 0.12% Oral Rinse</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Dosage / Sig
                </label>
                <input
                  type="text"
                  value={rxForm.dosage}
                  onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Instructions
                </label>
                <textarea
                  rows={2}
                  value={rxForm.instructions}
                  onChange={e => setRxForm({ ...rxForm, instructions: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn-outline-pill"
                  onClick={() => setShowRxModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-teal-primary"
                  onClick={() => { setShowRxModal(false); window.print(); }}
                >
                  <Printer size={14} /> Print Rx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
