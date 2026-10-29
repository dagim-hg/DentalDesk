import React, { useState } from 'react';
import { DentalProvider, useDental } from './context/DentalContext';
import { ModernSidebar } from './components/layout/ModernSidebar';
import { ModernTopBar } from './components/layout/ModernTopBar';
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { DentistDashboard } from './components/dashboards/DentistDashboard';
import { ReceptionistDashboard } from './components/dashboards/ReceptionistDashboard';
import { ForbiddenView } from './components/dashboards/ForbiddenView';
import { LoginModal } from './components/auth/LoginModal';

import { QueueTriage } from './components/QueueTriage';
import { ToothChart } from './components/ToothChart';
import { PatientRegistry } from './components/PatientRegistry';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import { BillingInvoicing } from './components/BillingInvoicing';
import { InventoryTracker } from './components/InventoryTracker';
import { AuditBackup } from './components/AuditBackup';
import { Patient } from './types/dental';

import './styles/dashboard.css';

function DentalDeskMain() {
  const { currentUser, setSelectedPatient, hasPermission } = useDental();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [billingPatientId, setBillingPatientId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const role = currentUser.role;

  const handleNavigateToChart = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentTab('chart');
  };

  const handleNavigateToBilling = (patientId: number) => {
    setBillingPatientId(patientId);
    setCurrentTab('billing');
  };

  // Route & RBAC Permission Gatekeeper
  const renderContent = () => {
    // 1. Primary Role Dashboards
    if (currentTab === 'home') {
      if (role === 'ROLE_OWNER') {
        return <OwnerDashboard onNavigateTab={setCurrentTab} />;
      }
      if (role === 'ROLE_DENTIST') {
        return <DentistDashboard onNavigateTab={setCurrentTab} />;
      }
      if (role === 'ROLE_RECEPTIONIST') {
        return <ReceptionistDashboard onNavigateTab={setCurrentTab} />;
      }
      // Assistant or Admin fallback
      return <ReceptionistDashboard onNavigateTab={setCurrentTab} />;
    }

    // 2. Queue & Triage Workspace
    if (currentTab === 'queue') {
      return (
        <QueueTriage
          onNavigateToChart={handleNavigateToChart}
          onNavigateToBilling={handleNavigateToBilling}
        />
      );
    }

    // 3. Clinical Chart & Odontogram (Forbidden for Receptionist)
    if (currentTab === 'chart') {
      if (!hasPermission('VIEW_CLINICAL_NOTES')) {
        return (
          <ForbiddenView
            attemptedResource="Clinical Odontogram & Private SOAP Notes"
            onReturnHome={() => setCurrentTab('home')}
          />
        );
      }
      return <ToothChart />;
    }

    // 4. Patients Registry
    if (currentTab === 'patients') {
      return <PatientRegistry onOpenChart={handleNavigateToChart} />;
    }

    // 5. Appointment Schedule & Calendar
    if (currentTab === 'appointments') {
      return <AppointmentCalendar />;
    }

    // 6. Billing, Invoicing & Cashier (Dentist has restricted view)
    if (currentTab === 'billing') {
      return <BillingInvoicing initialPatientId={billingPatientId} />;
    }

    // 7. Inventory & Supplies
    if (currentTab === 'inventory') {
      return <InventoryTracker />;
    }

    // 8. LAN Appliance & Audit Logs (Owner/Admin ONLY)
    if (currentTab === 'audits') {
      if (!hasPermission('ADMIN_OPERATIONS')) {
        return (
          <ForbiddenView
            attemptedResource="Air-Gapped Security Audit Logs & Database Snapshots"
            onReturnHome={() => setCurrentTab('home')}
          />
        );
      }
      return <AuditBackup />;
    }

    // 9. Staff & Team Roles Management (Owner ONLY)
    if (currentTab === 'staff') {
      if (!hasPermission('MANAGE_STAFF')) {
        return (
          <ForbiddenView
            attemptedResource="Staff Account Credentials & Role Provisioning"
            onReturnHome={() => setCurrentTab('home')}
          />
        );
      }
      return <OwnerDashboard onNavigateTab={setCurrentTab} />;
    }

    // 10. Service Fee Catalog (Owner ONLY)
    if (currentTab === 'fees') {
      if (!hasPermission('EDIT_SERVICE_FEES')) {
        return (
          <ForbiddenView
            attemptedResource="Clinic Service Pricing & Fee Structure"
            onReturnHome={() => setCurrentTab('home')}
          />
        );
      }
      return <BillingInvoicing />;
    }

    // 11. Daily Reconciliation (Receptionist & Owner)
    if (currentTab === 'reconciliation') {
      return <BillingInvoicing />;
    }

    // Default fallback
    return <OwnerDashboard onNavigateTab={setCurrentTab} />;
  };

  return (
    <div className="modern-shell">
      {/* Left Modern Sidebar tailored to authenticated role */}
      <ModernSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="modern-main-content">
        {/* Top Navigation Bar with Search, Greeting, Status */}
        <ModernTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Dynamic Role-Based Content Area */}
        {renderContent()}
      </main>

      {/* Shared Login & Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
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
