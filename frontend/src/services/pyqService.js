import api from './api';

export const pyqService = {
  async getPYQs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/pyqs?${query}`);
    return res.data;
  },
};
