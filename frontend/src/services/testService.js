import api from './api';

export const testService = {
  async getWeeklyTestStatus(weekNumber = 1) {
    const res = await api.get(`/tests/weekly/status?weekNumber=${weekNumber}`);
    return res.data.data;
  },

  async generateWeeklyTest(weekNumber = 1) {
    const res = await api.post('/tests/weekly/generate', { weekNumber });
    return res.data.data.test;
  },

  async startWeeklyTest(testId) {
    const res = await api.post(`/tests/weekly/${testId}/start`);
    return res.data.data.session;
  },

  async submitWeeklyTest(testId, answers) {
    const res = await api.post(`/tests/weekly/${testId}/submit`, { answers });
    return res.data.data.result;
  },
};
