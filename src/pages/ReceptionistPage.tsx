import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernTopBar } from '../components/layout/ModernTopBar';
import { ReceptionistDashboard } from '../components/dashboards/ReceptionistDashboard';
import { QueueTriage } from '../components/QueueTriage';
import { PatientRegistry } from '../components/PatientRegistry';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { BillingInvoicing } from '../components/BillingInvoicing';
import { ForbiddenView } from '../components/dashboards/ForbiddenView';
import { Patient } from '../types/dental';

export const ReceptionistPage: React.FC = () => {
  const { setSelectedPatient } = useDental();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [billingPatientId, setBillingPatientId] = useState<number | undefined>();

  const handleNavigateToChart = (patient: Patient) => {
    setSelectedPatient(patient);
    // Receptionists cannot open the clinical chart — show forbidden
    navigate('/receptionist/chart-forbidden');
  };

  const handleNavigateToBilling = (patientId: number) => {
    setBillingPatientId(patientId);
    navigate('/receptionist/billing');
  };

  return (
    <div className="modern-shell">
      <ModernSidebar baseRoute="/receptionist" />
      <main className="modern-main-content">
        <ModernTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Routes>
          <Route index element={<ReceptionistDashboard onNavigateTab={(tab) => navigate(`/receptionist/${tab}`)} />} />
          <Route path="queue" element={
            <QueueTriage
              onNavigateToChart={handleNavigateToChart}
              onNavigateToBilling={handleNavigateToBilling}
            />
          } />
          <Route path="appointments" element={<AppointmentCalendar />} />
          <Route path="patients" element={<PatientRegistry onOpenChart={handleNavigateToChart} />} />
          <Route path="billing" element={<BillingInvoicing initialPatientId={billingPatientId} />} />
          <Route path="reconciliation" element={<BillingInvoicing />} />
          <Route path="chart-forbidden" element={
            <ForbiddenView
              attemptedResource="Clinical Odontogram & Private SOAP Notes"
              onReturnHome={() => navigate('/receptionist')}
            />
          } />
          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Routes>
      </main>
    </div>
  );
};

