import httpClient from '@/services/http/client';

export const getTaskComments = async (taskId) => {
  const { data } = await httpClient.get(`/comments/task/${taskId}`);
  return data;
};

export const addTaskComment = async (payload) => {
  const { data } = await httpClient.post('/comments', payload);
  return data;
};

export const deleteComment = async (commentId) => {
  const { data } = await httpClient.delete(`/comments/${commentId}`);
  return data;
};

export const deleteCommentMedia = async (commentId, fileId) => {
  const { data } = await httpClient.delete(`/comments/${commentId}/media/${fileId}`);
  return data;
};
