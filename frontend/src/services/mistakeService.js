import api from './api';

export const mistakeService = {
  async getMistakes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/mistakes?${query}`);
    return res.data;
  },

  async updateMistake(mistakeId, updates) {
    const res = await api.patch(`/mistakes/${mistakeId}`, updates);
    return res.data.data.mistake;
  },
};
