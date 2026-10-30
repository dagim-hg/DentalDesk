import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernTopBar } from '../components/layout/ModernTopBar';
import { DentistDashboard } from '../components/dashboards/DentistDashboard';
import { QueueTriage } from '../components/QueueTriage';
import { ToothChart } from '../components/ToothChart';
import { PatientRegistry } from '../components/PatientRegistry';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { InventoryTracker } from '../components/InventoryTracker';
import { Patient } from '../types/dental';

export const DentistPage: React.FC = () => {
  const { setSelectedPatient } = useDental();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigateToChart = (patient: Patient) => {
    setSelectedPatient(patient);
    navigate('/dentist/chart');
  };

  const handleNavigateToBilling = (_patientId: number) => {
    // Dentist has read-only view of billing — navigate to billing page isn't available
    // Just stay on current page
  };

  return (
    <div className="modern-shell">
      <ModernSidebar baseRoute="/dentist" />
      <main className="modern-main-content">
        <ModernTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Routes>
          <Route index element={<DentistDashboard onNavigateTab={(tab) => navigate(`/dentist/${tab}`)} />} />
          <Route path="queue" element={
            <QueueTriage
              onNavigateToChart={handleNavigateToChart}
              onNavigateToBilling={handleNavigateToBilling}
            />
          } />
          <Route path="chart" element={<ToothChart />} />
          <Route path="patients" element={<PatientRegistry onOpenChart={handleNavigateToChart} />} />
          <Route path="appointments" element={<AppointmentCalendar />} />
          <Route path="inventory" element={<InventoryTracker />} />
          <Route path="*" element={<Navigate to="/dentist" replace />} />
        </Routes>
      </main>
    </div>
  );
};

