import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(59, 130, 246, 0.15)',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and preserve the intended target in location state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

