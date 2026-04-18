// frontend/src/components/RoleBasedAccess.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

// Show component only for admin
export const AdminOnly = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : null;
};

// Show component only for authenticated users
export const AuthenticatedOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : null;
};

// Show component only for non-authenticated users
export const PublicOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : null;
};

// Show component based on specific roles
export const RoleBased = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user?.role) ? <>{children}</> : null;
};

// Show component for regular users (not admin)
export const UserOnly = ({ children }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  return isAuthenticated && !isAdmin ? <>{children}</> : null;
};