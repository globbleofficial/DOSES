import api from './api';

export const getConnectedDevices = async () => {
  const response = await api.get('/devices/list');
  return response.data;
};

export const wipeDevice = async (payload) => {
  const response = await api.post('/devices/wipe', payload);
  return response.data;
};
