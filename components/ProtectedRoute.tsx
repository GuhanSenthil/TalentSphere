import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: ('hr' | 'candidate')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
      // You can return a loading spinner here while checking auth status
      return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in, but tries to access a page not meant for their role
  if (!allowedRoles.includes(user.role)) {
    // Redirect them to their respective dashboard/home page
    const homePath = user.role === 'hr' ? '/dashboard' : '/';
    return <Navigate to={homePath} replace />; 
  }

  return children;
};

export default ProtectedRoute;