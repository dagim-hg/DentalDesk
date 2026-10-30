import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernTopBar } from '../components/layout/ModernTopBar';
import { OwnerDashboard } from '../components/dashboards/OwnerDashboard';
import { QueueTriage } from '../components/QueueTriage';
import { ToothChart } from '../components/ToothChart';
import { PatientRegistry } from '../components/PatientRegistry';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { BillingInvoicing } from '../components/BillingInvoicing';
import { InventoryTracker } from '../components/InventoryTracker';
import { AuditBackup } from '../components/AuditBackup';
import { ForbiddenView } from '../components/dashboards/ForbiddenView';
import { Patient } from '../types/dental';

export const OwnerPage: React.FC = () => {
  const { setSelectedPatient } = useDental();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [billingPatientId, setBillingPatientId] = useState<number | undefined>();

  const handleNavigateToChart = (patient: Patient) => {
    setSelectedPatient(patient);
    navigate('/owner/chart');
  };

  const handleNavigateToBilling = (patientId: number) => {
    setBillingPatientId(patientId);
    navigate('/owner/billing');
  };

  return (
    <div className="modern-shell">
      <ModernSidebar baseRoute="/owner" />
      <main className="modern-main-content">
        <ModernTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Routes>
          <Route index element={<OwnerDashboard onNavigateTab={(tab) => navigate(`/owner/${tab}`)} />} />
          <Route path="patients" element={<PatientRegistry onOpenChart={handleNavigateToChart} />} />
          <Route path="appointments" element={<AppointmentCalendar />} />
          <Route path="chart" element={<ToothChart />} />
          <Route path="billing" element={<BillingInvoicing initialPatientId={billingPatientId} />} />
          <Route path="fees" element={<BillingInvoicing />} />
          <Route path="staff" element={<OwnerDashboard onNavigateTab={(tab) => navigate(`/owner/${tab}`)} />} />
          <Route path="inventory" element={<InventoryTracker />} />
          <Route path="audits" element={<AuditBackup />} />
          <Route path="queue" element={
            <QueueTriage
              onNavigateToChart={handleNavigateToChart}
              onNavigateToBilling={handleNavigateToBilling}
            />
          } />
          <Route path="*" element={<Navigate to="/owner" replace />} />
        </Routes>
      </main>
    </div>
  );
};

