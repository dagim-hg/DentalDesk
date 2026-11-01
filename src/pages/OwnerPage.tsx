import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernTopBar } from '../components/layout/ModernTopBar';
import { OwnerDashboard } from '../components/dashboards/OwnerDashboard';
import { BillingInvoicing } from '../components/BillingInvoicing';
import { InventoryTracker } from '../components/InventoryTracker';
import { AuditBackup } from '../components/AuditBackup';
import { StaffManagement } from '../components/StaffManagement';
import { ServiceFeeCatalog } from '../components/ServiceFeeCatalog';

export const OwnerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="modern-shell">
      <ModernSidebar baseRoute="/owner" />
      <main className="modern-main-content">
        <ModernTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Routes>
          {/* Executive Overview */}
          <Route index element={<OwnerDashboard onNavigateTab={(tab) => navigate(`/owner/${tab}`)} />} />

          {/* Finance */}
          <Route path="billing" element={<BillingInvoicing />} />
          <Route path="fees" element={<ServiceFeeCatalog />} />

          {/* Management */}
          <Route path="staff" element={<StaffManagement />} />
          <Route path="inventory" element={<InventoryTracker />} />
          <Route path="audits" element={<AuditBackup />} />

          {/* Any other route (including clinical routes not available to owner) redirects to owner home */}
          <Route path="*" element={<Navigate to="/owner" replace />} />
        </Routes>
      </main>
    </div>
  );
};
