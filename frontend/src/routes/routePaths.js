export const ROUTE_PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER_COMPANY: '/register/company',
  REGISTER_EMPLOYEE: '/register/employee',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  PROFILE: '/profile',
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_EMPLOYEES: '/company/employees',
  COMPANY_REQUESTS: '/company/requests',
  COMPANY_PROJECTS: '/company/projects',
  COMPANY_PROJECT_DETAIL: '/company/projects/:id',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_PROJECTS: '/employee/projects',
  EMPLOYEE_PROJECT_DETAIL: '/employee/projects/:id',
  EMPLOYEE_TASKS: '/employee/tasks',
  EMPLOYEE_COMPANY: '/employee/company',
};

export const ROUTE_PATH_BUILDERS = {
  companyProjectDetail: (projectId) => `/company/projects/${projectId}`,
  employeeProjectDetail: (projectId) => `/employee/projects/${projectId}`,
  resetPassword: (token) => `/reset-password/${token}`,
};
