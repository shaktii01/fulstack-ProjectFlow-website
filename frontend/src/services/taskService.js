import httpClient from '@/services/http/client';

export const getTasks = async ({ projectId } = {}) => {
  const query = projectId ? `?projectId=${projectId}` : '';
  const { data } = await httpClient.get(`/tasks${query}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await httpClient.post('/tasks', payload);
  return data;
};

export const getTaskById = async (taskId) => {
  const { data } = await httpClient.get(`/tasks/${taskId}`);
  return data;
};

export const updateTask = async (taskId, payload) => {
  const { data } = await httpClient.put(`/tasks/${taskId}`, payload);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await httpClient.delete(`/tasks/${taskId}`);
  return data;
};
