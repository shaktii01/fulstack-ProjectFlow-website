import httpClient from '@/services/http/client';

export const getProjects = async () => {
  const { data } = await httpClient.get('/projects');
  return data;
};

export const createProject = async (payload) => {
  const { data } = await httpClient.post('/projects', payload);
  return data;
};

export const getProjectById = async (projectId) => {
  const { data } = await httpClient.get(`/projects/${projectId}`);
  return data;
};

export const updateProject = async (projectId, payload) => {
  const { data } = await httpClient.put(`/projects/${projectId}`, payload);
  return data;
};

export const deleteProject = async (projectId) => {
  const { data } = await httpClient.delete(`/projects/${projectId}`);
  return data;
};
