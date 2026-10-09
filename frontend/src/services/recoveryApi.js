import api from './api';

export const scanDeletedFiles = async (targetPath = 'D:\\') => {
  const response = await api.post('/recovery/scan', { targetPath });
  return response.data;
};
