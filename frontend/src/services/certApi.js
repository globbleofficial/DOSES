import api from './api';

export const verifyCertificate = async (idOrHash) => {
  const response = await api.get(`/certificates/verify/${idOrHash}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};
