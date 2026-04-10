import httpClient from '@/services/http/client';

export const getTaskComments = async (taskId) => {
  const { data } = await httpClient.get(`/comments/task/${taskId}`);
  return data;
};

export const addTaskComment = async (payload) => {
  const { data } = await httpClient.post('/comments', payload);
  return data;
};
