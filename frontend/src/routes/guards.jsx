import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ROUTE_PATHS } from '@/routes/routePaths';

const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <FullPageLoader />;
  if (!user) return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={ROUTE_PATHS.ROOT} replace />;

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <FullPageLoader />;
  if (user) {
    return (
      <Navigate
        to={user.role === 'company' ? ROUTE_PATHS.COMPANY_DASHBOARD : ROUTE_PATHS.EMPLOYEE_DASHBOARD}
        replace
      />
    );
  }

  return children;
};
