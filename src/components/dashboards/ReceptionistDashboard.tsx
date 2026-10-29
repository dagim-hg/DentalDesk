import React, { useState } from 'react';
import { useDental } from '../../context/DentalContext';
import { 
  Users, Clock, UserPlus, Calendar, DollarSign, 
  CheckCircle2, AlertTriangle, ArrowRight, Printer, 
  Search, ShieldAlert, CreditCard, Banknote, RefreshCw, X 
} from 'lucide-react';
import { Patient, Appointment, Invoice, PaymentMethod } from '../../types/dental';

interface ReceptionistDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, appointments, updateAppointmentStatus, 
    patients, addPatient, bookAppointment, invoices, 
    createInvoice, recordPayment, payments, serviceCatalog 
  } = useDental();

  const [activeTab, setActiveTab] = useState<'queue' | 'intake' | 'booking' | 'cashier'>('queue');

  // Intake Form State
  const [intakeForm, setIntakeForm] = useState({
    firstName: '',
    lastName: '',
    dob: '1995-01-01',
    gender: 'MALE' as const,
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalAlerts: '',
    isUrgent: false
  });

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: patients[0]?.id || 1,
    scheduledStart: new Date().toISOString().slice(0, 16),
    durationMinutes: 30,
    chiefComplaint: '',
    operatoryChair: 'Chair 1 (Operatory A)',
    dentistId: 1
  });

  // Payment Form State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [payRef, setPayRef] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState<any | null>(null);

  // Queue categorizations
  const waitingPatients = appointments.filter(a => a.status === 'ARRIVED');
  const inOperatoryPatients = appointments.filter(a => a.status === 'IN_OPERATORY');
  const scheduledToday = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');

  const getPatient = (id: number) => patients.find(p => p.id === id);

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.firstName || !intakeForm.lastName || !intakeForm.phone) {
      alert('Please fill all required demographic fields.');
      return;
    }

    const alerts = intakeForm.medicalAlerts 
      ? intakeForm.medicalAlerts.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPat = addPatient({
      firstName: intakeForm.firstName,
      lastName: intakeForm.lastName,
      dob: intakeForm.dob,
      gender: intakeForm.gender,
      phone: intakeForm.phone,
      email: intakeForm.email,
      address: intakeForm.address,
      emergencyContactName: intakeForm.emergencyContactName,
      emergencyContactPhone: intakeForm.emergencyContactPhone,
      medicalAlerts: alerts,
      isUrgent: intakeForm.isUrgent
    });

    // If marked urgent or walk-in, immediately queue
    if (intakeForm.isUrgent) {
      bookAppointment({
        patientId: newPat.id,
        dentistId: 1,
        scheduledStart: new Date().toISOString(),
        durationMinutes: 30,
        status: 'ARRIVED',
        isWalkin: true,
        isUrgent: true,
        chiefComplaint: 'Emergency Intake / Walk-in',
        operatoryChair: 'Chair 1 (Operatory A)'
      });
    }

    alert(`Patient ${newPat.firstName} ${newPat.lastName} registered successfully! ID: ${newPat.patientCode}`);
    setIntakeForm({
      firstName: '',
      lastName: '',
      dob: '1995-01-01',
      gender: 'MALE',
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalAlerts: '',
      isUrgent: false
    });
    setActiveTab('queue');
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointment({
      patientId: Number(bookingForm.patientId),
      dentistId: Number(bookingForm.dentistId),
      scheduledStart: bookingForm.scheduledStart,
      durationMinutes: Number(bookingForm.durationMinutes),
      status: 'CONFIRMED',
      isWalkin: false,
      isUrgent: false,
      chiefComplaint: bookingForm.chiefComplaint,
      operatoryChair: bookingForm.operatoryChair
    });
    alert('Appointment booked successfully!');
    setActiveTab('queue');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    const receipt = recordPayment({
      invoiceId: selectedInvoice.id,
      patientId: selectedInvoice.patientId,
      amount: payAmount,
      paymentMethod: payMethod,
      transactionReference: payRef,
      receivedBy: currentUser.fullName,
      paymentDate: new Date().toISOString()
    });

    setShowReceiptModal(receipt);
    setSelectedInvoice(null);
    setPayAmount(0);
  };

  return (
    <div>
      {/* Greeting Title */}
      <div className="greeting-section">
        <div>
          <h1 className="greeting-text">Good Morning, {currentUser.fullName.split(' ')[0]}!</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--dd-text-muted)', marginTop: '0.2rem' }}>
            Front Desk Coordination & Patient Flow Management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary-teal" onClick={() => setActiveTab('intake')}>
            <UserPlus size={15} />
            <span>Register New Patient</span>
          </button>
          <button className="btn-outline" onClick={() => setActiveTab('booking')}>
            <Calendar size={15} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="card-widget" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div className="kpi-grid-row">
          <div className="kpi-metric-box">
            <div className="kpi-metric-label"><Clock size={14} /><span>Waiting in Lobby</span></div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{waitingPatients.length}</span>
              {waitingPatients.some(a => a.isUrgent) && (
                <span className="pill-badge urgent">Urgent in Queue</span>
              )}
            </div>
          </div>

          <div className="kpi-metric-box">
            <div className="kpi-metric-label"><Users size={14} /><span>Currently in Chair</span></div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{inOperatoryPatients.length}</span>
              <span className="pill-badge teal">Operatories Active</span>
            </div>
          </div>

          <div className="kpi-metric-box">
            <div className="kpi-metric-label"><Calendar size={14} /><span>Scheduled Today</span></div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{scheduledToday.length}</span>
              <span className="pill-badge lime">Upcoming</span>
            </div>
          </div>

          <div className="kpi-metric-box">
            <div className="kpi-metric-label"><DollarSign size={14} /><span>Unpaid Invoices</span></div>
            <div className="kpi-metric-value-row">
              <span className="kpi-metric-number">{invoices.filter(i => i.status !== 'PAID').length}</span>
              <span className="trend-badge" style={{ color: '#d97706' }}>Pending Cashier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn-outline ${activeTab === 'queue' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'queue' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeTab === 'queue' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeTab === 'queue' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveTab('queue')}
        >
          <Clock size={15} />
          <span>Active Waiting Queue ({waitingPatients.length})</span>
        </button>

        <button
          className={`btn-outline ${activeTab === 'intake' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'intake' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeTab === 'intake' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeTab === 'intake' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveTab('intake')}
        >
          <UserPlus size={15} />
          <span>Patient Intake</span>
        </button>

        <button
          className={`btn-outline ${activeTab === 'booking' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'booking' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeTab === 'booking' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeTab === 'booking' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveTab('booking')}
        >
          <Calendar size={15} />
          <span>Book Appointment</span>
        </button>

        <button
          className={`btn-outline ${activeTab === 'cashier' ? 'active' : ''}`}
          style={{
            backgroundColor: activeTab === 'cashier' ? 'var(--dd-primary-teal)' : '#ffffff',
            color: activeTab === 'cashier' ? '#ffffff' : 'var(--dd-text-dark)',
            borderColor: activeTab === 'cashier' ? 'var(--dd-primary-teal)' : 'var(--dd-border)'
          }}
          onClick={() => setActiveTab('cashier')}
        >
          <DollarSign size={15} />
          <span>Cashier & Invoices</span>
        </button>
      </div>

      {/* Tab 1: Waiting Room Queue */}
      {activeTab === 'queue' && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Clock size={18} color="var(--dd-primary-teal)" />
              <span>Lobby Waiting Room & Operatory Queue</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--dd-text-muted)' }}>
              Live synchronization over local LAN
            </span>
          </div>

          {waitingPatients.length === 0 && scheduledToday.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--dd-text-muted)' }}>
              No patients currently waiting in the lobby.
            </p>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Medical Alerts</th>
                  <th>Time / Complaint</th>
                  <th>Chair</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Waiting arrived patients */}
                {waitingPatients.map((a) => {
                  const pat = getPatient(a.patientId);
                  if (!pat) return null;
                  return (
                    <tr key={a.id} style={{ backgroundColor: a.isUrgent ? 'var(--dd-coral-bg)' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className="user-avatar-circle" style={{ width: 32, height: 32, fontSize: '0.75rem', backgroundColor: a.isUrgent ? 'var(--dd-coral-alert)' : 'var(--dd-primary-teal)' }}>
                            {pat.firstName[0]}{pat.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{pat.firstName} {pat.lastName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>{pat.patientCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>{pat.phone}</td>
                      <td>
                        {pat.medicalAlerts && pat.medicalAlerts.length > 0 ? (
                          <div className="pill-badge urgent">
                            <ShieldAlert size={12} />
                            <span>{pat.medicalAlerts[0]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{new Date(a.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)' }}>{a.chiefComplaint}</div>
                      </td>
                      <td>
                        <span className="pill-badge lime">{a.operatoryChair}</span>
                      </td>
                      <td>
                        <button
                          className="btn-primary-teal"
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          onClick={() => updateAppointmentStatus(a.id, 'IN_OPERATORY')}
                        >
                          <span>Move to Chair</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Scheduled upcoming appointments */}
                {scheduledToday.map((a) => {
                  const pat = getPatient(a.patientId);
                  if (!pat) return null;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className="user-avatar-circle" style={{ width: 32, height: 32, fontSize: '0.75rem', backgroundColor: '#94a3b8' }}>
                            {pat.firstName[0]}{pat.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{pat.firstName} {pat.lastName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--dd-text-muted)' }}>{pat.patientCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>{pat.phone}</td>
                      <td>
                        {pat.medicalAlerts && pat.medicalAlerts.length > 0 ? (
                          <div className="pill-badge urgent">
                            <ShieldAlert size={12} />
                            <span>{pat.medicalAlerts[0]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{new Date(a.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dd-text-muted)' }}>{a.chiefComplaint}</div>
                      </td>
                      <td>
                        <span className="pill-badge">{a.operatoryChair}</span>
                      </td>
                      <td>
                        <button
                          className="btn-accent-lime"
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          onClick={() => updateAppointmentStatus(a.id, 'ARRIVED')}
                        >
                          <CheckCircle2 size={13} />
                          <span>Check In (Arrived)</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Patient Registration Intake */}
      {activeTab === 'intake' && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <UserPlus size={18} color="var(--dd-primary-teal)" />
              <span>New Patient Demographic Intake</span>
            </div>
          </div>

          <form onSubmit={handleRegisterPatient} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>First Name *</label>
              <input
                type="text"
                required
                value={intakeForm.firstName}
                onChange={(e) => setIntakeForm({ ...intakeForm, firstName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Last Name *</label>
              <input
                type="text"
                required
                value={intakeForm.lastName}
                onChange={(e) => setIntakeForm({ ...intakeForm, lastName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={intakeForm.phone}
                onChange={(e) => setIntakeForm({ ...intakeForm, phone: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Date of Birth</label>
              <input
                type="date"
                value={intakeForm.dob}
                onChange={(e) => setIntakeForm({ ...intakeForm, dob: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Biological Sex</label>
              <select
                value={intakeForm.gender}
                onChange={(e) => setIntakeForm({ ...intakeForm, gender: e.target.value as any })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Emergency Contact & Phone</label>
              <input
                type="text"
                placeholder="Name & Phone (e.g. Spouse +1 555-1234)"
                value={intakeForm.emergencyContactName}
                onChange={(e) => setIntakeForm({ ...intakeForm, emergencyContactName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Known Medical Alerts & Allergies (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin Allergy, Hypertension, Latex Sensitivity"
                value={intakeForm.medicalAlerts}
                onChange={(e) => setIntakeForm({ ...intakeForm, medicalAlerts: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="urgent-walkin"
                checked={intakeForm.isUrgent}
                onChange={(e) => setIntakeForm({ ...intakeForm, isUrgent: e.target.checked })}
              />
              <label htmlFor="urgent-walkin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dd-coral-alert)' }}>
                Urgent Walk-in Case (Immediately place at top of waiting queue)
              </label>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary-teal">
                Register & Commit Patient Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Appointment Booking */}
      {activeTab === 'booking' && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <Calendar size={18} color="var(--dd-primary-teal)" />
              <span>Schedule Operatory Appointment</span>
            </div>
          </div>

          <form onSubmit={handleBookAppointment} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Patient</label>
              <select
                value={bookingForm.patientId}
                onChange={(e) => setBookingForm({ ...bookingForm, patientId: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Start Date & Time</label>
              <input
                type="datetime-local"
                value={bookingForm.scheduledStart}
                onChange={(e) => setBookingForm({ ...bookingForm, scheduledStart: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Duration (Minutes)</label>
              <select
                value={bookingForm.durationMinutes}
                onChange={(e) => setBookingForm({ ...bookingForm, durationMinutes: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              >
                <option value={15}>15 Minutes (Brief Follow-up)</option>
                <option value={30}>30 Minutes (Standard Exam / Cleaning)</option>
                <option value={45}>45 Minutes (Restorative / Extraction)</option>
                <option value={60}>60 Minutes (Root Canal / Crown Prep)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Operatory Chair</label>
              <select
                value={bookingForm.operatoryChair}
                onChange={(e) => setBookingForm({ ...bookingForm, operatoryChair: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              >
                <option value="Chair 1 (Operatory A)">Chair 1 (Operatory A - Dr. Chen)</option>
                <option value="Chair 2 (Hygiene Suite)">Chair 2 (Hygiene Suite)</option>
                <option value="Chair 3 (Surgical/Prosthetic)">Chair 3 (Surgical/Prosthetic)</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Chief Complaint / Reason for Visit</label>
              <input
                type="text"
                placeholder="e.g. Tooth sensitivity, bi-annual checkup, chipped incisor"
                value={bookingForm.chiefComplaint}
                onChange={(e) => setBookingForm({ ...bookingForm, chiefComplaint: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary-teal">
                Confirm & Lock Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Cashier & Invoices */}
      {activeTab === 'cashier' && (
        <div className="card-widget">
          <div className="card-widget-header">
            <div className="card-widget-title">
              <DollarSign size={18} color="var(--dd-primary-teal)" />
              <span>Front Desk Cashier & Invoices</span>
            </div>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const pat = getPatient(inv.patientId);
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                    <td>{pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${inv.patientId}`}</td>
                    <td style={{ fontWeight: 800 }}>${inv.totalAmount}</td>
                    <td>${inv.paidAmount}</td>
                    <td>
                      <span className={`pill-badge ${inv.status === 'PAID' ? 'active' : 'urgent'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.status !== 'PAID' ? (
                        <button
                          className="btn-primary-teal"
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPayAmount(inv.totalAmount - inv.paidAmount);
                          }}
                        >
                          <CreditCard size={13} />
                          <span>Collect Payment</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--dd-text-muted)' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Processing Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Record Payment</h3>
              <button className="btn-outline" onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>

            <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--dd-text-muted)' }}>Invoice #{selectedInvoice.invoiceNumber}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dd-primary-teal)' }}>
                  Due: ${selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Payment Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)', fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Payment Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                >
                  <option value="CASH">Cash in Drawer</option>
                  <option value="CREDIT_CARD">Credit Card Terminal</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  <option value="INSURANCE_COPAY">Insurance Co-Pay</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Transaction / Slip Reference</label>
                <input
                  type="text"
                  placeholder="e.g. POS-AUTH-99128"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--dd-border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setSelectedInvoice(null)}>Cancel</button>
                <button type="submit" className="btn-primary-teal">Confirm & Issue Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>DENTALDESK CLINIC</div>
              <div style={{ fontSize: '0.75rem' }}>Air-Gapped LAN Practice</div>
              <div style={{ fontSize: '0.75rem' }}>Receipt #: {showReceiptModal.receiptNumber}</div>
              <div style={{ fontSize: '0.75rem' }}>Date: {new Date().toLocaleString()}</div>
            </div>

            <div style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
              <div><strong>Amount Paid:</strong> ${showReceiptModal.amount}.00</div>
              <div><strong>Method:</strong> {showReceiptModal.paymentMethod}</div>
              <div><strong>Cashier:</strong> {showReceiptModal.receivedBy}</div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
              Thank you for choosing DentalDesk.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn-outline" onClick={() => setShowReceiptModal(null)}>Close</button>
              <button className="btn-primary-teal" onClick={() => window.print()}>Print 80mm Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
