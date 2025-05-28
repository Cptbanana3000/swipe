// swipe/packages/client/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Adjust path if your context is elsewhere

interface ProtectedRouteProps {
  // You can add other props if needed, like roles for role-based auth
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Optional: Show a loading spinner or a blank page while checking auth state
    // This prevents a flicker if the auth state is still being loaded from localStorage
    return <div>Loading authentication state...</div>; // Or a proper spinner component
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location so we can redirect back after login (optional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child route element
  return <Outlet />; // Outlet renders the matched child route component
};

export default ProtectedRoute;