import httpClient from '@/services/http/client';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await httpClient.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};
