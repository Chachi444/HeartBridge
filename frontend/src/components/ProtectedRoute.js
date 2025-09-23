import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, requiredRole, isAuthenticated }) => {
  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have the required role, redirect to their appropriate dashboard
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to their own dashboard based on their role
    switch (user.role) {
      case 'elderly':
        return <Navigate to="/elderly" replace />;
      case 'volunteer':
        return <Navigate to="/volunteer" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has the correct role
  return children;
};

export default ProtectedRoute;