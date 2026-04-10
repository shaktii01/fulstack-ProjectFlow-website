import httpClient from '@/services/http/client';

export const login = async (credentials) => {
  const { data } = await httpClient.post('/auth/login', credentials);
  return data;
};

export const registerCompany = async (payload) => {
  const { data } = await httpClient.post('/auth/register/company', payload);
  return data;
};

export const registerEmployee = async (payload) => {
  const { data } = await httpClient.post('/auth/register/employee', payload);
  return data;
};

export const logout = async () => {
  const { data } = await httpClient.post('/auth/logout');
  return data;
};

export const getAuthSession = async () => {
  const { data } = await httpClient.get('/auth/session');
  return data;
};

export const requestPasswordReset = async (payload) => {
  const { data } = await httpClient.post('/auth/forgot-password', payload);
  return data;
};

export const resetPassword = async (token, payload) => {
  const { data } = await httpClient.put(`/auth/reset-password/${token}`, payload);
  return data;
};
