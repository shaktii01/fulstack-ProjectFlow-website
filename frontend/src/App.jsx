import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AppLayout from './layouts/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterCompany from './pages/auth/RegisterCompany';
import RegisterEmployee from './pages/auth/RegisterEmployee';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyEmployees from './pages/company/Employees';
import CompanyJoinRequests from './pages/company/JoinRequests';
import CompanyProjects from './pages/company/Projects';
import CompanyProjectDetail from './pages/company/ProjectDetail';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProjects from './pages/employee/Projects';
import EmployeeProjectDetail from './pages/company/ProjectDetail'; // Reuses same component
import EmployeeTasks from './pages/employee/Tasks';
import MyCompany from './pages/employee/MyCompany';

// Shared Pages
import Profile from './pages/Profile';

import useAuthStore from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// A simple auth guard component
function ProtectedRoute({ children, allowedRole }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;

  return children;
}

// Redirect if already logged in
function PublicRoute({ children }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) {
    return <Navigate to={user.role === 'company' ? '/company/dashboard' : '/employee/dashboard'} replace />;
  }
  return children;
}

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register/company" element={
            <PublicRoute><RegisterCompany /></PublicRoute>
          } />
          <Route path="/register/employee" element={
            <PublicRoute><RegisterEmployee /></PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPassword /></PublicRoute>
          } />
          <Route path="/reset-password/:token" element={
            <PublicRoute><ResetPassword /></PublicRoute>
          } />

          {/* Protected Routes inside Layout */}
          <Route element={<AppLayout />}>
            {/* Company Routes */}
            <Route path="/company/dashboard" element={
              <ProtectedRoute allowedRole="company"><CompanyDashboard /></ProtectedRoute>
            } />
            <Route path="/company/employees" element={
              <ProtectedRoute allowedRole="company"><CompanyEmployees /></ProtectedRoute>
            } />
            <Route path="/company/requests" element={
              <ProtectedRoute allowedRole="company"><CompanyJoinRequests /></ProtectedRoute>
            } />
            <Route path="/company/projects" element={
              <ProtectedRoute allowedRole="company"><CompanyProjects /></ProtectedRoute>
            } />
            <Route path="/company/projects/:id" element={
              <ProtectedRoute allowedRole="company"><CompanyProjectDetail /></ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>
            } />
            <Route path="/employee/projects" element={
              <ProtectedRoute allowedRole="employee"><EmployeeProjects /></ProtectedRoute>
            } />
            <Route path="/employee/projects/:id" element={
              <ProtectedRoute allowedRole="employee"><EmployeeProjectDetail /></ProtectedRoute>
            } />
            <Route path="/employee/tasks" element={
              <ProtectedRoute allowedRole="employee"><EmployeeTasks /></ProtectedRoute>
            } />
            <Route path="/employee/company" element={
              <ProtectedRoute allowedRole="employee"><MyCompany /></ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
