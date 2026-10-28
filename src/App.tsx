import React, { useState } from 'react';
import { DentalProvider, useDental } from './context/DentalContext';
import { Header } from './components/Header';
import { QueueTriage } from './components/QueueTriage';
import { ToothChart } from './components/ToothChart';
import { PatientRegistry } from './components/PatientRegistry';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import { BillingInvoicing } from './components/BillingInvoicing';
import { InventoryTracker } from './components/InventoryTracker';
import { AuditBackup } from './components/AuditBackup';
import { Patient } from './types/dental';
import { 
  Users, Activity, UserPlus, Calendar, 
  DollarSign, Package, ShieldCheck, Stethoscope 
} from 'lucide-react';

type TabKey = 'queue' | 'chart' | 'patients' | 'schedule' | 'billing' | 'inventory' | 'audit';

function DentalDeskMain() {
  const [activeTab, setActiveTab] = useState<TabKey>('queue');
  const [billingPatientId, setBillingPatientId] = useState<number | undefined>(undefined);
  const { appointments, selectedPatient, setSelectedPatient, inventory } = useDental();

  const waitingCount = appointments.filter(a => a.status === 'ARRIVED').length;
  const inChairCount = appointments.filter(a => a.status === 'IN_OPERATORY').length;
  const lowStockCount = inventory.filter(i => i.currentStock <= i.reorderThreshold).length;

  const handleNavigateToChart = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('chart');
  };

  const handleNavigateToBilling = (patientId: number) => {
    setBillingPatientId(patientId);
    setActiveTab('billing');
  };

  return (
    <div className="app-container">
      {/* Top Clinic Header */}
      <Header onOpenBackup={() => setActiveTab('audit')} />

      {/* Navigation Tab Bar */}
      <nav className="nav-tab-bar">
        <button
          className={`nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <Users size={16} />
          <span>Queue & Triage</span>
          {waitingCount > 0 && (
            <span className="badge-counter">{waitingCount}</span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          <Activity size={16} />
          <span>Odontogram & Chart</span>
          {selectedPatient && (
            <span style={{ fontSize: '0.72rem', opacity: 0.8, background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {selectedPatient.firstName}
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <UserPlus size={16} />
          <span>Patient Registry</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={16} />
          <span>Operatory Schedule</span>
          {inChairCount > 0 && (
            <span className="badge-counter" style={{ background: 'var(--warning)', color: '#000' }}>
              {inChairCount} in chair
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => {
            setBillingPatientId(undefined);
            setActiveTab('billing');
          }}
        >
          <DollarSign size={16} />
          <span>Billing & Cashier</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={16} />
          <span>Dental Supplies</span>
          {lowStockCount > 0 && (
            <span className="badge-urgent">{lowStockCount}</span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          style={{ marginLeft: 'auto' }}
        >
          <ShieldCheck size={16} />
          <span>LAN Appliance & Audits</span>
        </button>
      </nav>

      {/* Main Viewport */}
      <main className="main-viewport">
        {activeTab === 'queue' && (
          <QueueTriage
            onNavigateToChart={handleNavigateToChart}
            onNavigateToBilling={handleNavigateToBilling}
          />
        )}

        {activeTab === 'chart' && (
          <ToothChart />
        )}

        {activeTab === 'patients' && (
          <PatientRegistry onOpenChart={handleNavigateToChart} />
        )}

        {activeTab === 'schedule' && (
          <AppointmentCalendar />
        )}

        {activeTab === 'billing' && (
          <BillingInvoicing initialPatientId={billingPatientId} />
        )}

        {activeTab === 'inventory' && (
          <InventoryTracker />
        )}

        {activeTab === 'audit' && (
          <AuditBackup />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DentalProvider>
      <DentalDeskMain />
    </DentalProvider>
  );
}
