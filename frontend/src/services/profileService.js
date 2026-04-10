import httpClient from '@/services/http/client';

export const updateProfile = async (payload) => {
  const { data } = await httpClient.put('/profile', payload);
  return data;
};

export const getMyCompanyProfile = async () => {
  const { data } = await httpClient.get('/profile/my-company');
  return data;
};

export const requestToJoinCompany = async (invitationCode) => {
  const { data } = await httpClient.post('/profile/my-company/request', { invitationCode });
  return data;
};
