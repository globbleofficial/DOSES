import api from './api';

export const checkAdminStatus = async () => {
  const response = await api.get('/wipe/check-admin');
  return response.data;
};

export const browseDirectory = async (dirPath = '') => {
  const response = await api.post('/wipe/browse', { dirPath });
  return response.data;
};

export const wipeLocalFile = async (payload) => {
  const response = await api.post('/wipe/local', payload);
  return response.data;
};

export const wipeFileUpload = async (formData) => {
  const response = await api.post('/wipe/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const wipeFromUrl = async (payload) => {
  const response = await api.post('/wipe/url', payload);
  return response.data;
};
