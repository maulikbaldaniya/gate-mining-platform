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
};
