import React from 'react';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Login from '@/pages/auth/Login';
import RegisterCompany from '@/pages/auth/RegisterCompany';
import RegisterEmployee from '@/pages/auth/RegisterEmployee';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import CompanyDashboard from '@/pages/company/Dashboard';
import CompanyEmployees from '@/pages/company/Employees';
import CompanyJoinRequests from '@/pages/company/JoinRequests';
import CompanyProjects from '@/pages/company/Projects';
import CompanyProjectDetail from '@/pages/company/ProjectDetail';
import EmployeeDashboard from '@/pages/employee/Dashboard';
import EmployeeProjects from '@/pages/employee/Projects';
import EmployeeTasks from '@/pages/employee/Tasks';
import MyCompany from '@/pages/employee/MyCompany';
import Profile from '@/pages/Profile';
import { ProtectedRoute, PublicRoute } from '@/routes/guards';
import { ROUTE_PATHS } from '@/routes/routePaths';

const withPublicGuard = (element) => <PublicRoute>{element}</PublicRoute>;

const withProtectedGuard = (element, allowedRole) => (
  <ProtectedRoute allowedRole={allowedRole}>{element}</ProtectedRoute>
);

export const publicRoutes = [
  { path: ROUTE_PATHS.ROOT, element: <Navigate to={ROUTE_PATHS.LOGIN} replace /> },
  { path: ROUTE_PATHS.LOGIN, element: withPublicGuard(<Login />) },
  { path: ROUTE_PATHS.REGISTER_COMPANY, element: withPublicGuard(<RegisterCompany />) },
  { path: ROUTE_PATHS.REGISTER_EMPLOYEE, element: withPublicGuard(<RegisterEmployee />) },
  { path: ROUTE_PATHS.FORGOT_PASSWORD, element: withPublicGuard(<ForgotPassword />) },
  { path: ROUTE_PATHS.RESET_PASSWORD, element: withPublicGuard(<ResetPassword />) },
];

export const protectedRouteGroups = [
  {
    element: <AppLayout />,
    children: [
      { path: ROUTE_PATHS.COMPANY_DASHBOARD, element: withProtectedGuard(<CompanyDashboard />, 'company') },
      { path: ROUTE_PATHS.COMPANY_EMPLOYEES, element: withProtectedGuard(<CompanyEmployees />, 'company') },
      { path: ROUTE_PATHS.COMPANY_REQUESTS, element: withProtectedGuard(<CompanyJoinRequests />, 'company') },
      { path: ROUTE_PATHS.COMPANY_PROJECTS, element: withProtectedGuard(<CompanyProjects />, 'company') },
      { path: ROUTE_PATHS.COMPANY_PROJECT_DETAIL, element: withProtectedGuard(<CompanyProjectDetail />, 'company') },
      { path: ROUTE_PATHS.EMPLOYEE_DASHBOARD, element: withProtectedGuard(<EmployeeDashboard />, 'employee') },
      { path: ROUTE_PATHS.EMPLOYEE_PROJECTS, element: withProtectedGuard(<EmployeeProjects />, 'employee') },
      { path: ROUTE_PATHS.EMPLOYEE_PROJECT_DETAIL, element: withProtectedGuard(<CompanyProjectDetail />, 'employee') },
      { path: ROUTE_PATHS.EMPLOYEE_TASKS, element: withProtectedGuard(<EmployeeTasks />, 'employee') },
      { path: ROUTE_PATHS.EMPLOYEE_COMPANY, element: withProtectedGuard(<MyCompany />, 'employee') },
      { path: ROUTE_PATHS.PROFILE, element: withProtectedGuard(<Profile />) },
    ],
  },
];
