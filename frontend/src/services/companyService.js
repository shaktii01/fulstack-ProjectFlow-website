import httpClient from '@/services/http/client';

export const getCompanyDashboardStats = async () => {
  const { data } = await httpClient.get('/company/dashboard');
  return data;
};

export const getCompanyEmployees = async () => {
  const { data } = await httpClient.get('/company/employees');
  return data;
};

export const updateCompanyEmployee = async (employeeId, payload) => {
  const { data } = await httpClient.put(`/company/employees/${employeeId}`, payload);
  return data;
};

export const removeCompanyEmployee = async (employeeId) => {
  const { data } = await httpClient.delete(`/company/employees/${employeeId}`);
  return data;
};

export const getCompanyJoinRequests = async () => {
  const { data } = await httpClient.get('/company/requests');
  return data;
};

export const updateCompanyJoinRequest = async (requestId, status) => {
  const { data } = await httpClient.put(`/company/requests/${requestId}`, { status });
  return data;
};
