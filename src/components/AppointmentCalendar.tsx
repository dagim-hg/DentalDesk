import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import { 
  Calendar as CalendarIcon, Clock, Plus, User, 
  MapPin, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types/dental';

export const AppointmentCalendar: React.FC = () => {
  const { appointments, bookAppointment, patients, users, updateAppointmentStatus } = useDental();
  const [selectedChair, setSelectedChair] = useState<string>('ALL');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // New appointment form state
  const [form, setForm] = useState({
    patientId: patients[0]?.id || 1,
    dentistId: 1,
    date: '2026-10-23',
    time: '11:00',
    durationMinutes: 30,
    operatoryChair: 'Chair 1 (Operatory A)',
    chiefComplaint: '',
    isUrgent: false
  });

  const chairs = [
    'Chair 1 (Operatory A)',
    'Chair 2 (Hygiene Suite)',
    'Chair 3 (Surgical/Prosthetic)'
  ];

  const filteredAppointments = appointments.filter(app => {
    if (selectedChair !== 'ALL' && app.operatoryChair !== selectedChair) return false;
    return true;
  });

  const getPatientName = (patientId: number) => {
    const p = patients.find(pt => pt.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };

  const getDentistName = (dentistId: number) => {
    const u = users.find(usr => usr.id === dentistId);
    return u ? u.fullName : `Dentist #${dentistId}`;
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
        dentistId: 1,
        date: '2026-10-23',
        time: '11:00',
        durationMinutes: 30,
        operatoryChair: 'Chair 1 (Operatory A)',
        chiefComplaint: '',
        isUrgent: false
      });
    } else {
      setBookingError(result.error || 'Failed to book appointment.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Calendar Controls Bar */}
      <div className="card-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Operatory Schedule</h3>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Friday, October 23, 2026 (Clinic Operating Hours 09:00 - 18:00)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Operatory Chair Filter */}
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
            value={selectedChair}
            onChange={e => setSelectedChair(e.target.value)}
          >
            <option value="ALL">All Operatory Chairs</option>
            {chairs.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setShowBookingModal(true)}>
            <Plus size={15} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Operatory Chairs Timeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {chairs.filter(c => selectedChair === 'ALL' || selectedChair === c).map((chair) => {
          const chairAppointments = filteredAppointments.filter(a => a.operatoryChair === chair);
          return (
            <div key={chair} className="card-panel">
              <div className="panel-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{chair}</strong>
                </div>
                <span className="badge-counter" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  {chairAppointments.length} Booked
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {chairAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Chair available throughout the day.
                  </div>
                ) : (
                  chairAppointments.map((app) => {
                    const timeStr = new Date(app.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div 
                        key={app.id}
                        style={{
                          background: app.status === 'IN_OPERATORY' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface)',
                          border: app.status === 'IN_OPERATORY' ? '1px solid var(--warning)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                            {timeStr} ({app.durationMinutes} min)
                          </span>
                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: 'var(--radius-full)',
                              background: app.status === 'IN_OPERATORY' ? 'var(--warning)' : 'var(--bg-card)',
                              color: app.status === 'IN_OPERATORY' ? '#000' : 'var(--text-secondary)'
                            }}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                          {getPatientName(app.patientId)}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <div>Dentist: {getDentistName(app.dentistId)}</div>
                          <div>Procedure: {app.chiefComplaint}</div>
                        </div>

                        {/* Quick Status Toggles */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                          {app.status === 'SCHEDULED' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ flex: 1 }}
                              onClick={() => updateAppointmentStatus(app.id, 'ARRIVED')}
                            >
                              Check-In Patient
                            </button>
                          )}
                          {app.status === 'ARRIVED' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              style={{ flex: 1 }}
                              onClick={() => updateAppointmentStatus(app.id, 'IN_OPERATORY')}
                            >
                              Seat Patient
                            </button>
                          )}
                          {app.status === 'IN_OPERATORY' && (
                            <button 
                              className="btn btn-success btn-sm"
                              style={{ flex: 1 }}
                              onClick={() => updateAppointmentStatus(app.id, 'COMPLETED')}
                            >
                              Mark Finished
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Dialog Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="var(--primary)" />
                Schedule Clinical Appointment
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBookingModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBook}>
              <div className="modal-body">
                {bookingError && (
                  <div className="medical-alert-box" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger)' }}>
                    <AlertCircle size={18} color="#f43f5e" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select 
                    className="form-select"
                    value={form.patientId}
                    onChange={e => setForm({ ...form, patientId: Number(e.target.value) })}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientCode}) - {p.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Dentist</label>
                    <select 
                      className="form-select"
                      value={form.dentistId}
                      onChange={e => setForm({ ...form, dentistId: Number(e.target.value) })}
                    >
                      {users.filter(u => u.role === 'ROLE_DENTIST' || u.role === 'ROLE_OWNER').map(u => (
                        <option key={u.id} value={u.id}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operatory Chair</label>
                    <select 
                      className="form-select"
                      value={form.operatoryChair}
                      onChange={e => setForm({ ...form, operatoryChair: e.target.value })}
                    >
                      {chairs.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={form.date} 
                      onChange={e => setForm({ ...form, date: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      value={form.time} 
                      onChange={e => setForm({ ...form, time: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Min)</label>
                    <select 
                      className="form-select"
                      value={form.durationMinutes}
                      onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chief Complaint / Planned Treatment</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Crown cementation, Scaling, Emergency consultation..."
                    value={form.chiefComplaint}
                    onChange={e => setForm({ ...form, chiefComplaint: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
