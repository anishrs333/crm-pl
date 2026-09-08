import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Authenticating session...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based authorization check
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Access Denied
        </h2>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '20px' }}>
          Your current role (<strong>{user?.role}</strong>) does not have permission to view
          this module. Please contact your system administrator.
        </p>
        <a
          href="/dashboard"
          style={{
            padding: '10px 20px',
            background: '#6366f1',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 600,
          }}
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
};
