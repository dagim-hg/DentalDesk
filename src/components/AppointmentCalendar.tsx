import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { Appointment, AppointmentStatus, Patient } from '../types/dental';
import { 
  Calendar as CalendarIcon, Clock, Plus, User, 
  MapPin, CheckCircle2, AlertCircle, X, ChevronLeft, 
  ChevronRight, Activity, Armchair, Stethoscope 
} from 'lucide-react';

interface AppointmentCalendarProps {
  onOpenChart?: (patient: Patient) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ onOpenChart }) => {
  const { 
    appointments, bookAppointment, patients, users, 
    updateAppointmentStatus, setSelectedPatient, currentUser 
  } = useDental();
  
  const navigate = useNavigate();
  const [selectedChair, setSelectedChair] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-09');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // New appointment form state
  const [form, setForm] = useState({
    patientId: patients[0]?.id || 1,
    dentistId: currentUser.id || 1,
    date: '2026-11-09',
    time: '11:15',
    durationMinutes: 45,
    operatoryChair: 'Chair 1 (Main Operatory)',
    chiefComplaint: '',
    isUrgent: false
  });

  const chairs = [
    'Chair 1 (Main Operatory)',
    'Chair 2 (Hygiene Suite)',
    'Chair 3 (Surgical Operatory)'
  ];

  const filteredAppointments = appointments.filter(app => {
    if (selectedChair !== 'ALL' && app.operatoryChair !== selectedChair) return false;
    return true;
  });

  const getPatient = (patientId: number) => {
    return patients.find(pt => pt.id === patientId);
  };

  const getDentistName = (dentistId: number) => {
    const u = users.find(usr => usr.id === dentistId);
    return u ? u.fullName : `Dr. Sarah Chen, DDS`;
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    const scheduledStart = `${form.date}T${form.time}:00`;
    const result = bookAppointment({
      patientId: Number(form.patientId),
      dentistId: Number(form.dentistId),
      scheduledStart,
      durationMinutes: Number(form.durationMinutes),
      operatoryChair: form.operatoryChair,
      chiefComplaint: form.chiefComplaint || 'Consultation and examination',
      isUrgent: form.isUrgent,
      isWalkin: false,
      status: 'SCHEDULED'
    });

    if (result.success) {
      setShowBookingModal(false);
      setForm({
        patientId: patients[0]?.id || 1,
        dentistId: currentUser.id || 1,
        date: '2026-11-09',
        time: '11:15',
        durationMinutes: 45,
        operatoryChair: 'Chair 1 (Main Operatory)',
        chiefComplaint: '',
        isUrgent: false
      });
    } else {
      setBookingError(result.error || 'Failed to book appointment.');
    }
  };

  const handleOpenChartForPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    if (onOpenChart) {
      onOpenChart(patient);
    } else {
      navigate('/dentist/chart');
    }
  };

  const formatTimeSlot = (isoString: string, duration: number) => {
    try {
      const d = new Date(isoString);
      const start = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const endD = new Date(d.getTime() + duration * 60000);
      const end = endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${start} - ${end}`;
    } catch {
      return '11:15 - 12:00';
    }
  };

  const getStatusBadgeStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'IN_OPERATORY':
        return { bg: '#e6f3f4', color: '#005963', label: 'In Operatory', border: '#005963' };
      case 'COMPLETED':
        return { bg: '#ecfdf5', color: '#059669', label: 'Completed', border: '#a7f3d0' };
      case 'ARRIVED':
        return { bg: '#fef3c7', color: '#b45309', label: 'In Waiting Room', border: '#fde68a' };
      case 'NO_SHOW':
        return { bg: '#fef2f2', color: '#b91c1c', label: 'No-Show', border: '#fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: 'Confirmed', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header & Schedule Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Operatory Chair Schedule
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
            Monday, 9 November 2026 • Clinic Operating Hours 08:30 - 17:30
          </p>
        </div>

        <button
          className="btn-teal-primary"
          onClick={() => setShowBookingModal(true)}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Book Chair Appointment</span>
        </button>
      </div>

      {/* Operatory Chair Filter Pills */}
      <div className="operatory-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginRight: 4 }}>
            Operatory Chair:
          </span>

          <button
            onClick={() => setSelectedChair('ALL')}
            style={{
              padding: '0.4rem 0.95rem',
              borderRadius: 8,
              border: 'none',
              background: selectedChair === 'ALL' ? '#005963' : '#f1f5f9',
              color: selectedChair === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            All Operatories ({appointments.length})
          </button>

          {chairs.map(c => {
            const count = appointments.filter(a => a.operatoryChair === c).length;
            const isSel = selectedChair === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedChair(c)}
                style={{
                  padding: '0.4rem 0.95rem',
                  borderRadius: 8,
                  border: 'none',
                  background: isSel ? '#005963' : '#f1f5f9',
                  color: isSel ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {c.split(' (')[0]} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b' }}>
          <CalendarIcon size={15} color="#005963" />
          <strong>9 Nov 2026</strong>
        </div>
      </div>

      {/* Timeline Schedule Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredAppointments.length === 0 ? (
          <div className="operatory-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No appointments booked for this operatory filter.
          </div>
        ) : (
          filteredAppointments.map(appt => {
            const pt = getPatient(appt.patientId);
            const statusMeta = getStatusBadgeStyle(appt.status);
            const isInOperatory = appt.status === 'IN_OPERATORY';

            return (
              <div
                key={appt.id}
                className="operatory-card"
                style={{
                  padding: '1.15rem 1.35rem',
                  borderLeft: isInOperatory ? '5px solid #005963' : '1px solid #e3e6dd',
                  background: isInOperatory ? '#f8fdfd' : '#ffffff',
                  boxShadow: isInOperatory ? '0 2px 8px rgba(0,89,99,0.06)' : '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  {/* Left: Time & Patient Identity */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                    <div style={{
                      minWidth: 100,
                      padding: '0.4rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {formatTimeSlot(appt.scheduledStart, appt.durationMinutes)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                        {appt.durationMinutes} minutes
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          {pt ? `${pt.firstName} ${pt.lastName}` : 'Walk-in Patient'}
                        </h3>
                        {pt && (
                          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {pt.patientCode}
                          </span>
                        )}
                        {appt.isUrgent && (
                          <span className="alert-tag-pill urgent" style={{ fontSize: '0.65rem' }}>
                            URGENT
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
                        Operatory: <strong>{appt.operatoryChair}</strong> • Doctor: {getDentistName(appt.dentistId)}
                      </div>

                      {/* Medical alert badges if patient has any */}
                      {pt?.medicalAlerts && pt.medicalAlerts.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {pt.medicalAlerts.map((alt, i) => (
                            <span key={i} className="alert-tag-pill allergy" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                              ⚠ {alt}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.82rem', color: '#1e293b', marginTop: 6, fontWeight: 500 }}>
                        {appt.chiefComplaint || 'Routine diagnostic and preventive consultation.'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Fast Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: statusMeta.bg,
                        color: statusMeta.color,
                        border: `1px solid ${statusMeta.border}`
                      }}
                    >
                      {statusMeta.label}
                    </span>

                    {pt && (
                      <button
                        className="btn-teal-primary"
                        onClick={() => handleOpenChartForPatient(pt)}
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                      >
                        <Activity size={14} />
                        <span>Open Chart</span>
                      </button>
                    )}

                    {appt.status === 'ARRIVED' && pt && (
                      <button
                        className="btn-outline-pill"
                        onClick={() => {
                          updateAppointmentStatus(appt.id, 'IN_OPERATORY');
                          setSelectedPatient(pt);
                        }}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                      >
                        Seat in Chair
                      </button>
                    )}

                    {appt.status === 'IN_OPERATORY' && (
                      <button
                        className="btn-outline-pill"
                        onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', color: '#059669', borderColor: '#a7f3d0' }}
                      >
                        <CheckCircle2 size={14} /> Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Book Chair Appointment
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Select Patient *
                </label>
                <select
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Operatory Chair</label>
                  <select
                    value={form.operatoryChair}
                    onChange={e => setForm({ ...form, operatoryChair: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    {chairs.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Duration</label>
                  <select
                    value={form.durationMinutes}
                    onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Planned Clinical Procedure / Complaint
                </label>
                <input
                  type="text"
                  placeholder="e.g. Root canal treatment, tooth 46"
                  value={form.chiefComplaint}
                  onChange={e => setForm({ ...form, chiefComplaint: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              </div>

              {bookingError && (
                <div style={{ color: '#b91c1c', fontSize: '0.78rem', background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>
                  {bookingError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline-pill"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-teal-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
