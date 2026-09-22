import api from './api';

export const scheduleService = {
  async getSchedule() {
    const res = await api.get('/schedule');
    return res.data.data.schedule;
  },

  async getDayDetails(dayNumber) {
    const res = await api.get(`/schedule/day/${dayNumber}`);
    return res.data.data.day;
  },

  async setCurrentDay(dayNumber) {
    const res = await api.post('/schedule/set-current-day', { dayNumber });
    return res.data.data;
  },

  async getBacklog(dayNumber) {
    const url = dayNumber ? `/schedule/backlog?dayNumber=${dayNumber}` : '/schedule/backlog';
    const res = await api.get(url);
    return res.data.data;
  },
};
