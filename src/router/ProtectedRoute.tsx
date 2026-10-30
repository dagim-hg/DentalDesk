import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDental } from '../context/DentalContext';
import { tokenStorage } from '../services/api';
import { UserRole } from '../types/dental';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/** Maps each role to its dedicated dashboard URL */
const roleToDashboard: Record<UserRole, string> = {
  ROLE_OWNER: '/owner',
  ROLE_DENTIST: '/dentist',
  ROLE_RECEPTIONIST: '/receptionist',
  ROLE_ASSISTANT: '/receptionist',
  ROLE_ADMIN: '/owner',
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { currentUser, isAuthenticated } = useDental();
  const token = tokenStorage.get();

  // 1. Not authenticated → go to login
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authenticated but wrong role → redirect to their own dashboard
  if (!allowedRoles.includes(currentUser.role)) {
    const correctPath = roleToDashboard[currentUser.role] ?? '/login';
    return <Navigate to={correctPath} replace />;
  }

  // 3. All good → render the protected content
  return <>{children}</>;
};

