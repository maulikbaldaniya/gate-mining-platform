import api from './api';

export const topicService = {
  async getTopic(topicId) {
    const res = await api.get(`/topics/${topicId}`);
    return res.data.data.topic;
  },

  async getLesson(topicId) {
    const res = await api.get(`/topics/${topicId}/lesson`);
    return res.data.data.lesson;
  },
};
