import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DentalProvider } from './context/DentalContext';
import { ProtectedRoute } from './router/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { OwnerPage } from './pages/OwnerPage';
import { DentistPage } from './pages/DentistPage';
import { ReceptionistPage } from './pages/ReceptionistPage';

import './styles/dashboard.css';

export default function App() {
  return (
    <DentalProvider>
      <BrowserRouter>
        <Routes>
          {/* Public: login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Owner / Manager workspace */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute allowedRoles={['ROLE_OWNER', 'ROLE_ADMIN']}>
                <OwnerPage />
              </ProtectedRoute>
            }
          />

          {/* Dentist clinical workspace */}
          <Route
            path="/dentist/*"
            element={
              <ProtectedRoute allowedRoles={['ROLE_DENTIST']}>
                <DentistPage />
              </ProtectedRoute>
            }
          />

          {/* Receptionist / front-desk workspace */}
          <Route
            path="/receptionist/*"
            element={
              <ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST', 'ROLE_ASSISTANT']}>
                <ReceptionistPage />
              </ProtectedRoute>
            }
          />

          {/* Root → login (ProtectedRoute will redirect to correct dashboard if authenticated) */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DentalProvider>
  );
}
