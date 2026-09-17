import api from './api';

export const progressService = {
  async getDashboard() {
    const res = await api.get('/dashboard');
    return res.data.data;
  },

  async getOverview() {
    const res = await api.get('/progress/overview');
    return res.data.data;
  },

  async getSubjectProgress() {
    const res = await api.get('/progress/subjects');
    return res.data.data.subjects;
  },
};
